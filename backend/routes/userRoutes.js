const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const RendezVous = require('../models/RendezVous');
const Medicament = require('../models/Medicaments');
const auth = require('../middleware/authMiddleware'); 

// Get user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-mot_de_passe');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Convertir l'ID utilisateur en ObjectId pour la recherche
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.user.userId);
      console.log('ID utilisateur converti en ObjectId:', userId);
    } catch (err) {
      console.error('Erreur lors de la conversion de l\'ID en ObjectId:', err);
      // Continuer avec l'ID sous forme de chaîne si la conversion échoue
      userId = req.user.userId;
    }

    // Get user's glycemie data - rechercher avec les deux formats possibles
    console.log('Recherche de glycémie pour userId (string):', req.user.userId);
    console.log('Recherche de glycémie pour userId (ObjectId):', userId);
    
    const glycemie = await Glycemie.find({
      $or: [
        { user_id: req.user.userId },  // Format string
        { user_id: userId },           // Format ObjectId
        { "user_id.$oid": req.user.userId }  // Format EJSON
      ]
    })
    .sort({ date: -1 })
    .limit(20);

    console.log(`Glycémie trouvée pour l'utilisateur:`, glycemie.length);
    
    // Si aucune donnée n'est trouvée, essayer une recherche directe dans la collection
    if (glycemie.length === 0) {
      console.log('Tentative de recherche directe dans la collection glycemie');
      
      // Utiliser une requête directe à la collection
      const db = mongoose.connection.db;
      const glycemieCollection = db.collection('glycemie');
      
      const rawGlycemie = await glycemieCollection.find({
        $or: [
          { "user_id": req.user.userId },
          { "user_id": userId },
          { "user_id.$oid": req.user.userId }
        ]
      }).sort({ date: -1 }).limit(20).toArray();
      
      console.log('Résultat de la recherche directe:', rawGlycemie.length);
      
      if (rawGlycemie.length > 0) {
        // Utiliser les données brutes si elles sont trouvées
        glycemie.push(...rawGlycemie);
      }
    }

    // Get user's appointments
    const rendezVous = await RendezVous.find({ user_id: req.user.userId })
      .sort({ date: 1 });

    // Get user's medications
    const medicaments = await Medicament.find({ user_id: req.user.userId });

    res.json({
      ...user.toObject(),
      glycemie,
      rendezVous,
      medicaments,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Add a new appointment
router.post('/rendezvous', auth, async (req, res) => {
  try {
    const { type, lieu, date, note, rappel } = req.body;
    
    // Validate required fields
    if (!type || !lieu || !date) {
      return res.status(400).json({ message: 'Type, lieu et date sont requis' });
    }
    
    const newRendezVous = new RendezVous({
      user_id: req.user.userId,
      type,
      lieu,
      date,
      note: note || '',
      rappel: rappel !== undefined ? rappel : true
    });
    
    await newRendezVous.save();
    
    res.status(201).json({
      message: 'Rendez-vous ajouté avec succès',
      rendezVous: newRendezVous
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Ajouter une route pour créer une nouvelle entrée de glycémie
router.post('/glycemie', auth, async (req, res) => {
  try {
    const { valeur, unite, date, moment_journee, contexte, commentaire } = req.body;
    
    // Valider les champs requis
    if (!valeur || !date) {
      return res.status(400).json({ message: 'Valeur et date sont requis' });
    }
    
    // Créer une nouvelle entrée de glycémie
    const newGlycemie = new Glycemie({
      user_id: req.user.userId,
      valeur,
      unite: unite || 'mg/dL',
      date,
      moment_journee: moment_journee || '',
      contexte: contexte || '',
      commentaire: commentaire || ''
    });
    
    await newGlycemie.save();
    
    res.status(201).json({
      message: 'Glycémie ajoutée avec succès',
      glycemie: newGlycemie
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la glycémie:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;