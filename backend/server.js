require('dotenv').config(); // Charge les variables d'environnement
console.log("📢 MONGO_URI:", process.env.MONGO_URI);
console.log("📢 JWT_SECRET:", process.env.JWT_SECRET);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const rendezvousRoutes = require('./routes/rendezvousRoutes');
const repasRoutes = require('./routes/repasRoutes'); // Ajout de la nouvelle route

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch(err => console.log("❌ Erreur MongoDB:", err));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/rendezvous', rendezvousRoutes);
app.use('/api/repas', repasRoutes); // Enregistrement de la nouvelle route

app.listen(5000, () => console.log("🚀 Serveur sur http://localhost:5000"));
