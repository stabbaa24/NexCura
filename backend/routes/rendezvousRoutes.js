const express = require('express');
const router = express.Router();
const RendezVous = require('../models/RendezVous');
const auth = require('../middleware/authMiddleware');

// Ajouter un rendez-vous
// Correction: la route doit être '/' et non '/rendezvous' car le préfixe '/api/rendezvous' est déjà défini dans server.js
router.post('/', auth, async (req, res) => {
  try {
    const { type, lieu, date, note, rappel } = req.body;

    if (!type || !lieu || !date) {
      return res.status(400).json({ message: 'Type, lieu et date sont requis' });
    }

    const newRendezVous = new RendezVous({
      user_id: req.user.userId,  // Assurez-vous que le middleware `auth` est bien appelé
      type,
      date,
      lieu,
      note: note || '',
      rappel: rappel !== undefined ? rappel : true
    });

    await newRendezVous.save();
    res.status(201).json({ message: 'Rendez-vous ajouté avec succès', rendezVous: newRendezVous });

  } catch (error) {
    console.error('Erreur lors de l\'ajout du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;