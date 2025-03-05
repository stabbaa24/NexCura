const express = require('express');
const router = express.Router();
const Repas = require('../models/Repas');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const axios = require('axios');

// Service pour analyser l'image avec OpenAI
const analyzeImageWithOpenAI = async (imageUrl) => {
  try {
    // Vérifier que la clé API est correctement configurée
    if (!process.env.OPENAI_API_KEY) {
      console.error('Erreur: Clé API OpenAI manquante');
      throw new Error('Configuration OpenAI manquante');
    }
    
    // Afficher les premiers caractères de la clé API pour le débogage (sécurisé)
    const apiKeyStart = process.env.OPENAI_API_KEY.substring(0, 7);
    const apiKeyEnd = process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
    console.log(`Utilisation de la clé API: ${apiKeyStart}...${apiKeyEnd}`);
    
    // S'assurer que l'URL complète est utilisée pour l'API OpenAI
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `https://res.cloudinary.com/dszucpj0a/image/upload/${imageUrl}`;
    
    console.log(`Tentative d'analyse de l'image: ${fullImageUrl}`);
    
    // Mise à jour du modèle de gpt-4-vision-preview à gpt-4o
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o", // Modèle mis à jour
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Analyse cette image de repas. Identifie les aliments présents et donne-moi une estimation des valeurs nutritionnelles (calories, glucides, lipides, protéines) et l'index glycémique. Réponds au format JSON avec les propriétés: aliments (array), calories (number), glucides (number), proteines (number), lipides (number), index_glycemique (number), et description (string)." },
              { 
                type: "image_url", 
                image_url: { 
                  url: fullImageUrl 
                } 
              }
            ]
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    // Le reste du code reste inchangé
    const content = response.data.choices[0].message.content;
    console.log("Réponse OpenAI reçue:", content.substring(0, 100) + "...");
    
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json\n|\n```/g, ''));
    } else {
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error("Erreur de parsing JSON:", e);
        return {
          aliments: [],
          calories: 0,
          glucides: 0,
          proteines: 0,
          lipides: 0,
          index_glycemique: 0,
          description: "Analyse non disponible - Erreur de format"
        };
      }
    }
  } catch (error) {
    console.error('Erreur détaillée lors de l\'analyse de l\'image:', error.response?.data || error.message);
    
    // Amélioration du logging pour mieux diagnostiquer les problèmes
    if (error.response) {
      console.error('Statut de la réponse:', error.response.status);
      console.error('Données de la réponse:', error.response.data);
      
      // Gestion spécifique des erreurs d'authentification
      if (error.response.status === 401) {
        console.error('Erreur d\'authentification avec l\'API OpenAI. Vérifiez votre clé API.');
        return {
          aliments: [],
          calories: 0,
          glucides: 0,
          proteines: 0,
          lipides: 0,
          index_glycemique: 0,
          description: "Analyse non disponible - Erreur d'authentification API"
        };
      }
    }
    
    if (error.response?.status === 404) {
      console.error('API endpoint non trouvé ou image non accessible');
      return {
        aliments: [],
        calories: 0,
        glucides: 0,
        proteines: 0,
        lipides: 0,
        index_glycemique: 0,
        description: "Analyse non disponible - Image non accessible"
      };
    }
    
    throw new Error('Erreur lors de l\'analyse de l\'image');
  }
};

// Service pour prédire l'impact sur la glycémie
const predictGlycemicImpact = async (userData, mealData) => {
  // Logique simplifiée pour prédire l'impact glycémique
  // Dans une implémentation réelle, vous pourriez utiliser un modèle ML plus sophistiqué
  
  const { type_diabete, poids, taille } = userData;
  const { glucides_totaux, index_glycemique } = mealData;
  
  // Calcul de l'IMC
  const imc = poids / ((taille / 100) ** 2);
  
  // Facteurs d'impact basés sur le type de diabète et l'IMC
  let facteurImpact = 1;
  
  if (type_diabete === 'type1') {
    facteurImpact = 1.2;
  } else if (type_diabete === 'type2') {
    facteurImpact = 1.0;
  } else {
    facteurImpact = 0.8; // Pour prédiabète ou autre
  }
  
  // Ajustement basé sur l'IMC
  if (imc > 30) {
    facteurImpact *= 1.2; // Impact plus élevé pour l'obésité
  } else if (imc > 25) {
    facteurImpact *= 1.1; // Impact légèrement plus élevé pour le surpoids
  }
  
  // Calcul de l'impact glycémique estimé (mg/dL)
  const impactEstime = Math.round((glucides_totaux * index_glycemique * facteurImpact) / 100);
  
  return {
    impact_estime: impactEstime,
    recommandations: generateRecommendations(mealData, userData)
  };
};

// Fonction pour générer des recommandations
const generateRecommendations = (mealData, userData) => {
  const recommendations = [];
  
  // Recommandations basées sur l'index glycémique
  if (mealData.index_glycemique > 70) {
    recommendations.push("Ce repas a un index glycémique élevé. Envisagez d'ajouter plus de fibres ou de protéines pour ralentir l'absorption des glucides.");
  }
  
  // Recommandations sur l'ordre de consommation
  recommendations.push("Ordre optimal de consommation: légumes fibreux d'abord, puis protéines, puis glucides.");
  
  // Recommandations basées sur le type de diabète
  if (userData.type_diabete === 'type1') {
    recommendations.push("Pour le diabète de type 1, ajustez votre dose d'insuline en fonction des glucides totaux de ce repas.");
  } else if (userData.type_diabete === 'type2') {
    recommendations.push("Pour le diabète de type 2, envisagez une courte marche après ce repas pour aider à réguler votre glycémie.");
  }
  
  // Recommandation générale
  recommendations.push("Mesurez votre glycémie 2 heures après ce repas pour comprendre son impact réel sur votre corps.");
  
  return recommendations;
};

// Route pour ajouter un repas avec analyse d'image
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    // Vérifier si une image a été téléchargée
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image fournie' });
    }
  
    // Uploader l'image vers Cloudinary
    const result = await uploadToCloudinary(req.file.path);
    
    // Extraire seulement la partie de l'URL après "upload/"
    const cloudinaryPath = result.secure_url.split('upload/')[1];
    console.log("Chemin Cloudinary stocké:", cloudinaryPath);
    
    // Utiliser l'URL complète pour l'analyse
    const analysisResult = await analyzeImageWithOpenAI(result.secure_url);
  
    // Récupérer les données de l'utilisateur pour la prédiction
    const user = await User.findById(req.user.userId);
    
    // Préparer les données du repas
    const mealData = {
      description: analysisResult.description || req.body.description || '',
      glucides_totaux: analysisResult.glucides || parseFloat(req.body.glucides_totaux) || 0,
      index_glycemique: analysisResult.index_glycemique || parseFloat(req.body.index_glycemique) || 0,
      calories: analysisResult.calories || parseFloat(req.body.calories) || 0,
      proteines: analysisResult.proteines || parseFloat(req.body.proteines) || 0,
      lipides: analysisResult.lipides || parseFloat(req.body.lipides) || 0,
      aliments: analysisResult.aliments || []
    };
  
    // Prédire l'impact glycémique
    const impactPrediction = await predictGlycemicImpact(user, mealData);
  
    // Renvoyer les résultats de l'analyse avec le chemin relatif de l'image
    res.status(200).json({
      message: 'Analyse du repas réussie',
      imageUrl: cloudinaryPath, // Stocker seulement le chemin relatif
      analysis: {
        ...mealData,
        impact_glycemique: impactPrediction.impact_estime,
        recommandations: impactPrediction.recommandations
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse du repas:', error);
    res.status(500).json({ message: 'Erreur lors de l\'analyse du repas', error: error.message });
  }
});

// Route pour sauvegarder un repas après analyse
router.post('/', auth, async (req, res) => {
  try {
    const { 
    photo, 
    description, 
    index_glycemique, 
    glucides_totaux, 
    impact_glycemique, 
    commentaire,
    calories,
    proteines,
    lipides,
    aliments
    } = req.body;

    // Créer un nouveau repas
    const newRepas = new Repas({
    user_id: req.user.userId,
    photo,
    description,
    index_glycemique,
    glucides_totaux,
    date: new Date(),
    impact_glycemique: {
    avant_repas: impact_glycemique.avant_repas || 0,
    apres_repas: impact_glycemique.apres_repas || 0
    },
    commentaire,
    calories,
    proteines,
    lipides,
    aliments
    });

    // Sauvegarder le repas
    await newRepas.save();

    res.status(201).json({
    message: 'Repas sauvegardé avec succès',
    repas: newRepas
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du repas:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde du repas', error: error.message });
  }
});

// Route pour récupérer les repas d'un utilisateur
router.get('/', auth, async (req, res) => {
  try {
    const repas = await Repas.find({ user_id: req.user.userId })
    .sort({ date: -1 });

    res.json(repas);
  } catch (error) {
    console.error('Erreur lors de la récupération des repas:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;