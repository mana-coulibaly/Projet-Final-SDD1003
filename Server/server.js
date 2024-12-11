const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importer les routes
const filmRoutes = require('./routes/films');

// Initialisation de l'application
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Connexion à MongoDB
const mongoURI = 'mongodb+srv://manastar:SDD1003@cluster1.slqex.mongodb.net/Films?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
.then(() => {
    console.log('Connecté à MongoDB Atlas avec succès');
    console.log('Base de données:', mongoose.connection.name);
}).catch((error) => {
    console.error('Erreur de connexion à MongoDB Atlas:', error);
});

// Routes
app.use('/api/films', filmRoutes);

// Route pour la recherche des films
app.get('/api/films/search', (req, res) => {
    const { title, minPopularity, maxPopularity } = req.query;

    console.log('server.js...');
    console.log('Titre:', title);
    console.log('Popularité Min:', minPopularity);
    console.log('Popularité Max:', maxPopularity);

    // Si aucun critère n'est fourni, renvoyer une erreur
    if (!title && !minPopularity && !maxPopularity) {
        return res.status(400).json({ error: 'Veuillez entrer au moins un critère de recherche.' });
    }

    let filteredMovies = movies;

    if (title) {
        filteredMovies = filteredMovies.filter(movie => movie.title.toLowerCase().includes(title.toLowerCase()));
    }

    if (minPopularity) {
        filteredMovies = filteredMovies.filter(movie => movie.popularity >= minPopularity);
    }

    if (maxPopularity) {
        filteredMovies = filteredMovies.filter(movie => movie.popularity <= maxPopularity);
    }

    // Retourner les films filtrés
    res.json(filteredMovies);
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
