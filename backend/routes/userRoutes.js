
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const RendezVous = require('../models/RendezVous');
const Medicament = require('../models/Medicaments');
const auth = require('../middleware/authMiddleware'); 

// Get user data
// Get user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-mot_de_passe');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Get user's glycemie data
    const glycemie = await Glycemie.find({ user_id: req.user.userId })
      .sort({ date: -1 })
      .limit(20);

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