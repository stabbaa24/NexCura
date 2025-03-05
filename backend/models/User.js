const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: String,
  prenom: String, // Nouveau champ pour le prénom
  email: { type: String, unique: true },
  mot_de_passe: String,
  age: Number, // Nouveau champ pour l'âge
  genre: String, // Nouveau champ pour le genre (homme, femme, autre)
  type_diabete: String,
  taille: Number,
  poids: Number,
  objectif_glycemie: {
    min: Number,
    max: Number
  }
});

module.exports = mongoose.model('User', UserSchema);