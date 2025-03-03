
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const RendezVous = require('../models/RendezVous');
const Medicament = require('../models/Medicaments');
const auth = require('../middleware/authMiddleware'); // Using your existing middleware

// Get user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-mot_de_passe');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Convertir l'ID utilisateur en ObjectId pour la compatibilité
    // Utiliser new pour créer un ObjectId correctement
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    
    console.log('Recherche de glycémie pour userId:', req.user.userId);
    console.log('Format ObjectId:', userId);
    
    // Get user's glycemie data - recherche avec deux formats possibles d'ID
    const glycemie = await Glycemie.find({
      $or: [
        { user_id: req.user.userId }, // Format string
        { user_id: userId }           // Format ObjectId
      ]
    })
    .sort({ date: -1 })
    .limit(20);

    console.log(`Glycémie trouvée pour l'utilisateur ${req.user.userId}:`, glycemie.length);

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

// Add more routes as needed

module.exports = router;