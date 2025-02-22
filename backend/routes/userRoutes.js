const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const Repas = require('../models/Repas');
const RendezVous = require('../models/RendezVous');
const authenticate = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

router.get('/me', authenticate, async (req, res) => {
  try {
    // Récupération de l'utilisateur
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    console.log("Recherche glycémie pour user_id:", req.user.userId);

    // Recherche dans la collection glycemie avec les deux formats possibles d'ID
    const glycemieData = await mongoose.connection.db.collection('glycemie').find({
      $or: [
        { user_id: req.user.userId }, // Format string
        { user_id: new mongoose.Types.ObjectId(req.user.userId) } // Format ObjectId
      ]
    }).toArray();

    console.log("Nombre de glycémies trouvées:", glycemieData.length);
    
    // Si on trouve des données, les trier par date
    if (glycemieData.length > 0) {
      glycemieData.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log("Premier élément trouvé:", glycemieData[0]);
    }

    // Envoyer les données trouvées
    res.json({
      user,
      glycemie: glycemieData,
      repas: await Repas.find({ user_id: req.user.userId }),
      rendezVous: await RendezVous.find({ user_id: req.user.userId })
    });

  } catch (error) {
    console.error("❌ Erreur détaillée:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Route de debug pour vérifier un document glycémie spécifique
router.get('/check-glycemie/:id', authenticate, async (req, res) => {
  try {
    const glycemie = await mongoose.connection.db.collection('glycemie').findOne({
      _id: new mongoose.Types.ObjectId(req.params.id)
    });
    
    res.json({
      found: !!glycemie,
      data: glycemie,
      userId: req.user.userId,
      format: {
        asString: req.user.userId,
        asObjectId: new mongoose.Types.ObjectId(req.user.userId)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;