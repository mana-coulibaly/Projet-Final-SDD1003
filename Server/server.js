const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importer les routes
const filmRoutes = require('./routes/films');

// Initialisation de l'application
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'Projet Final SDD1003 API' });
});

// Connexion à MongoDB
const mongoURI = process.env.MONGODB_URI;
const mongoDatabase = process.env.MONGODB_DB_NAME || 'Films';

if (!mongoURI) {
    console.error('MONGODB_URI est obligatoire pour démarrer le serveur.');
    process.exit(1);
}

mongoose.connect(mongoURI, {
    dbName: mongoDatabase,
    // Les utilisateurs MongoDB Atlas sont généralement authentifiés dans admin,
    // même lorsque les données de l'application sont stockées dans Films.
    authSource: 'admin'
})
.then(() => {
    console.log('Connecté à MongoDB Atlas avec succès');
    console.log('Base de données:', mongoose.connection.name);
}).catch((error) => {
    console.error('Erreur de connexion à MongoDB Atlas:', error);
});

// Routes
app.use('/api/films', filmRoutes);

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
