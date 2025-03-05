const express = require('express');
const router = express.Router();
const Repas = require('../models/Repas');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const axios = require('axios');

const analyzeImageWithOpenAI = async (imageUrl) => {
  try {
    console.log(`🔍 Vérification de la clé API OpenAI: ${process.env.OPENAI_API_KEY ? "OK" : "NON TROUVÉE"}`);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ Clé API OpenAI manquante. Ajoutez-la dans les variables d\'environnement.');
    }

    // URL complète de l'image
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `https://res.cloudinary.com/dszucpj0a/image/upload/${imageUrl}`;

    console.log(`📷 Analyse de l'image: ${fullImageUrl}`);

    // Définition du modèle : gpt-4o ou fallback vers gpt-3.5-turbo
    let modelToUse = "gpt-4o"; 

    // Amélioration du prompt pour obtenir des informations plus détaillées
    // Modification du prompt pour demander un format JSON plus simple
    const requestBody = {
      model: modelToUse,
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyse cette image de repas et donne-moi les informations suivantes au format JSON strict:\n" +
                    "- aliments: liste des aliments visibles (format string array simple)\n" +
                    "- calories: estimation des calories totales (number)\n" +
                    "- glucides: estimation des glucides totaux en grammes (number)\n" +
                    "- lipides: estimation des lipides totaux en grammes (number)\n" +
                    "- proteines: estimation des protéines totales en grammes (number)\n" +
                    "- fibres: estimation des fibres totales en grammes (number)\n" +
                    "- index_glycemique: estimation de l'index glycémique moyen du repas (0-100) (number)\n" +
                    "- impact_glycemique_avant: estimation de l'impact sur la glycémie avant le repas (mg/dL) (number)\n" +
                    "- impact_glycemique_apres: estimation de l'impact sur la glycémie après le repas (mg/dL) (number)\n" +
                    "- ordre_consommation: ordre recommandé de consommation des aliments (format string array simple)\n" +
                    "- description: description détaillée du repas (string)\n" +
                    "Réponds uniquement avec un objet JSON valide sans explications supplémentaires."
            },
            { type: "image_url", image_url: { url: fullImageUrl } }
          ]
        }
      ],
      max_tokens: 1000
    };

    // Envoi de la requête OpenAI
    let response;
    try {
      response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("⚠ Quota dépassé, passage à gpt-3.5-turbo...");
        modelToUse = "gpt-3.5-turbo";
        requestBody.model = modelToUse;
        
        response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
          }
        );
      } else {
        throw error;
      }
    }

    // Extraction du contenu JSON avec une méthode plus robuste
    const content = response.data.choices[0].message.content;
    console.log("📝 Réponse OpenAI reçue:", content.substring(0, 200) + "...");

    // Amélioration du parsing JSON
    let analysisResult;
    try {
      // Essayer d'abord de parser directement le contenu complet
      analysisResult = JSON.parse(content);
    } catch (parseError) {
      console.log("⚠️ Erreur de parsing direct, tentative d'extraction du JSON...");
      
      // Si échec, essayer d'extraire le JSON avec une regex plus robuste
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysisResult = JSON.parse(jsonMatch[0]);
        } catch (nestedError) {
          console.error("❌ Échec de l'extraction JSON:", nestedError);
          throw new Error("Impossible de parser la réponse JSON d'OpenAI");
        }
      } else {
        throw new Error("Aucun objet JSON trouvé dans la réponse d'OpenAI");
      }
    }

    // Vérifier et normaliser les données
    return {
      aliments: Array.isArray(analysisResult.aliments) ? analysisResult.aliments : [],
      calories: Number(analysisResult.calories) || 0,
      glucides: Number(analysisResult.glucides) || 0,
      lipides: Number(analysisResult.lipides) || 0,
      proteines: Number(analysisResult.proteines) || 0,
      fibres: Number(analysisResult.fibres) || 0,
      index_glycemique: Number(analysisResult.index_glycemique) || 0,
      impact_glycemique_avant: Number(analysisResult.impact_glycemique_avant) || 0,
      impact_glycemique_apres: Number(analysisResult.impact_glycemique_apres) || 0,
      ordre_consommation: Array.isArray(analysisResult.ordre_consommation) ? analysisResult.ordre_consommation : [],
      description: analysisResult.description || "Analyse du repas"
    };
  } catch (error) {
    console.error("🚨 Erreur lors de l'analyse de l'image:", error.message);
    return {
      aliments: [],
      calories: 0,
      glucides: 0,
      lipides: 0,
      proteines: 0,
      fibres: 0,
      index_glycemique: 0,
      impact_glycemique_avant: 0,
      impact_glycemique_apres: 0,
      ordre_consommation: [],
      description: "Analyse non disponible - Erreur OpenAI"
    };
  }
};

// Maintenant, modifions la route d'analyse pour utiliser ces nouvelles informations
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
    
    // Ajouter un log détaillé pour déboguer
    console.log("Données extraites de l'analyse (détaillées):", JSON.stringify(analysisResult, null, 2));
    
    // Préparer les données du repas avec les nouvelles informations
    const mealData = {
      description: analysisResult.description || req.body.description || '',
      glucides_totaux: analysisResult.glucides || 0,
      index_glycemique: analysisResult.index_glycemique || 0,
      calories: analysisResult.calories || 0,
      proteines: analysisResult.proteines || 0,
      lipides: analysisResult.lipides || 0,
      fibres: analysisResult.fibres || 0,
      aliments: analysisResult.aliments || [],
      impact_glycemique: {
        avant_repas: analysisResult.impact_glycemique_avant || 0,
        apres_repas: analysisResult.impact_glycemique_apres || 0
      },
      ordre_consommation: analysisResult.ordre_consommation || []
    };
  
    // Générer des recommandations basées sur l'ordre de consommation
    let recommandations = [];
    
    if (mealData.ordre_consommation && mealData.ordre_consommation.length > 0) {
      recommandations.push(`Pour minimiser l'impact glycémique, consommez les aliments dans cet ordre: ${mealData.ordre_consommation.join(', ')}`);
    } else {
      recommandations = generateRecommendations(mealData, user);
    }
  
    // Renvoyer les résultats de l'analyse avec le chemin relatif de l'image
    res.status(200).json({
      message: 'Analyse du repas réussie',
      imageUrl: cloudinaryPath, // Stocker seulement le chemin relatif
      analysis: {
        ...mealData,
        recommandations: recommandations
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'analyse du repas:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'analyse du repas', 
      error: error.message,
      // Fournir des valeurs par défaut pour que l'interface puisse continuer à fonctionner
      imageUrl: req.file ? req.file.path : null,
      analysis: {
        description: "Analyse non disponible - Veuillez réessayer",
        glucides_totaux: 0,
        index_glycemique: 0,
        calories: 0,
        proteines: 0,
        lipides: 0,
        fibres: 0,
        aliments: [],
        impact_glycemique: {
          avant_repas: 0,
          apres_repas: 0
        },
        ordre_consommation: [],
        recommandations: ["Impossible d'analyser ce repas. Veuillez réessayer ou saisir les informations manuellement."]
      }
    });
  }
});

// Le reste du code reste inchangé
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

// Route pour sauvegarder un repas après analyse
router.post('/', auth, async (req, res) => {
  try {
    const { 
      photo, 
      nom,         // Ajout du champ nom
      description, 
      index_glycemique, 
      glucides_totaux, 
      impact_glycemique, 
      commentaire,
      calories,
      proteines,
      lipides,
      aliments,
      recommandations
    } = req.body;

    // Créer un nouveau repas
    const newRepas = new Repas({
      user_id: req.user.userId,
      photo,
      nom: nom || 'Repas sans nom',  // Utilisation du nom avec valeur par défaut
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
      aliments,
      recommandations
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

router.delete('/:id', auth, async (req, res) => {
  try {
    const repasId = req.params.id;
    
    // Vérifier que le repas existe et appartient à l'utilisateur
    const repas = await Repas.findOne({ 
      _id: repasId,
      user_id: req.user.userId 
    });
    
    if (!repas) {
      return res.status(404).json({ message: 'Repas non trouvé ou non autorisé' });
    }
    
    // Supprimer le repas
    await Repas.findByIdAndDelete(repasId);
    
    res.status(200).json({ message: 'Repas supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du repas:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;