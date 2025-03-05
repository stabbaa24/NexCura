const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { 
      nom, 
      prenom, 
      email, 
      mot_de_passe, 
      age, 
      genre, 
      type_diabete, 
      taille, 
      poids, 
      objectif_glycemie 
    } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier les champs obligatoires
    if (!email || !mot_de_passe) {
      return res.status(400).json({ message: 'Email et mot de passe sont requis' });
    }

    // Vérifier la longueur du mot de passe
    if (mot_de_passe.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Créer un nouvel utilisateur
    const newUser = new User({
      nom: nom || '',
      prenom: prenom || '',
      email,
      mot_de_passe: hashedPassword,
      age: age || null,
      genre: genre || '',
      type_diabete: type_diabete || '',
      taille: taille || null,
      poids: poids || null,
      objectif_glycemie: {
        min: objectif_glycemie?.min || 70,
        max: objectif_glycemie?.max || 180
      }
    });

    // Sauvegarder l'utilisateur dans la base de données
    await newUser.save();

    // Créer un token JWT
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Renvoyer le token et les informations utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...newUser.toObject() };
    delete userWithoutPassword.mot_de_passe;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// Route de connexion (login)
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Renvoyer le token et les informations utilisateur (sans le mot de passe)
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.mot_de_passe;

    res.json({
      message: 'Connexion réussie',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

module.exports = router;