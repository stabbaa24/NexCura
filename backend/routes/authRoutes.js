const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, mot_de_passe, type_diabete, taille, poids, objectif_glycemie } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const newUser = new User({
      nom, email, mot_de_passe: hashedPassword, type_diabete, taille, poids, objectif_glycemie
    });

    await newUser.save();
    res.status(201).json({ message: "Inscription réussie !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
      console.log("🔍 Tentative de connexion avec email :", req.body.email);
  
      const email = req.body.email.trim(); // Nettoie les espaces
      const user = await User.findOne({ email });
  
      console.log("✅ Résultat de la recherche :", user);
  
      if (!user) {
        console.log("❌ Utilisateur non trouvé !");
        return res.status(400).json({ message: "Utilisateur non trouvé" });
      }
  
      // Vérification du mot de passe
      const isMatch = await bcrypt.compare(req.body.mot_de_passe, user.mot_de_passe);
      if (!isMatch) {
        console.log("❌ Mot de passe incorrect !");
        return res.status(400).json({ message: "Mot de passe incorrect" });
      }
  
      // Génération du token
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
      console.log("✅ Connexion réussie !");
      res.json({ token, user });
  
    } catch (error) {
      console.error("❌ Erreur serveur :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  

module.exports = router;
