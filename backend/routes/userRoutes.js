const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const Repas = require('../models/Repas');
const RendezVous = require('../models/RendezVous'); // Ajout du modèle
const authenticate = require('../middleware/authMiddleware');

const mongoose = require('mongoose');

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Convertir userId en ObjectId pour que MongoDB le reconnaisse
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const glycemie = await Glycemie.find({ user_id: userId }).sort({ date: 1 });
    console.log("📊 Données glycémie récupérées :", glycemie);

    const repas = await Repas.find({ user_id: userId }).sort({ date: 1 });
    const rendezVous = await RendezVous.find({ user_id: userId }).sort({ date: 1 });

    res.json({ user, glycemie, repas, rendezVous });
  } catch (error) {
    console.error("❌ Erreur récupération utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


module.exports = router;
