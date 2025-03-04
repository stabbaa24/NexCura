const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Glycemie = require('../models/Glycemie');
const RendezVous = require('../models/RendezVous');
const Medicament = require('../models/Medicaments');
const auth = require('../middleware/authMiddleware'); 
const bcrypt = require('bcrypt'); // Assurez-vous d'avoir installé bcrypt

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
    { user_id: userId },    // Format ObjectId
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

// Nouvelle route pour mettre à jour les informations utilisateur
router.put('/update', auth, async (req, res) => {
  try {
    const { 
      nom, 
      email, 
      mot_de_passe_actuel, 
      nouveau_mot_de_passe, 
      type_diabete, 
      taille, 
      poids, 
      objectif_glycemie 
    } = req.body;

    // Trouver l'utilisateur
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Préparer l'objet de mise à jour
    const updateData = {};
    
    // Mettre à jour les champs simples s'ils sont fournis
    if (nom !== undefined) updateData.nom = nom;
    if (email !== undefined) updateData.email = email;
    if (type_diabete !== undefined) updateData.type_diabete = type_diabete;
    if (taille !== undefined) updateData.taille = taille;
    if (poids !== undefined) updateData.poids = poids;
    
    // Mettre à jour l'objectif de glycémie s'il est fourni
    if (objectif_glycemie) {
      updateData.objectif_glycemie = {
        min: objectif_glycemie.min !== undefined ? objectif_glycemie.min : user.objectif_glycemie?.min,
        max: objectif_glycemie.max !== undefined ? objectif_glycemie.max : user.objectif_glycemie?.max
      };
    }

    // Si l'utilisateur veut changer son mot de passe
    if (nouveau_mot_de_passe) {
      // Vérifier que le mot de passe actuel est correct
      if (!mot_de_passe_actuel) {
        return res.status(400).json({ message: 'Le mot de passe actuel est requis pour changer de mot de passe' });
      }
      
      // Vérifier le mot de passe actuel
      const isMatch = await bcrypt.compare(mot_de_passe_actuel, user.mot_de_passe);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }
      
      // Hasher le nouveau mot de passe
      const salt = await bcrypt.genSalt(10);
      updateData.mot_de_passe = await bcrypt.hash(nouveau_mot_de_passe, salt);
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true }
    ).select('-mot_de_passe');

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    // Gérer les erreurs de duplication d'email
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé par un autre compte' });
    }
    
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

module.exports = router;