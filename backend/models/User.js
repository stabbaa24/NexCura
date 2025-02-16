const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nom: String,
  email: { type: String, unique: true },
  mot_de_passe: String,
  type_diabete: String,
  taille: Number,
  poids: Number,
  objectif_glycemie: {
    min: Number,
    max: Number
  }
});

module.exports = mongoose.model('User', UserSchema);
