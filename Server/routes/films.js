const express = require('express');
const router = express.Router();
const Film = require('../models/Film');
const { DBSCAN } = require('@turf/clusters-dbscan');

// Récupérer tous les films
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 200 } = req.query; // Par défaut : page 1, 10 films par page
        const films = await Film.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ release_date: -1 }) // Tri par date de sortie décroissante
            .exec();

        const totalFilms = await Film.countDocuments();
        res.status(200).json({
            totalFilms,
            totalPages: Math.ceil(totalFilms / limit),
            currentPage: parseInt(page),
            films,
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des films', error });
    }
});

// Rechercher un film par titre et/ou par filtres
router.get('/search', async (req, res) => {
    try {
        const query = req.query.title || '';
        const filters = {};

        // Recherche par titre (partiel et insensible à la casse)
        if (query) {
            filters.title = { $regex: query, $options: 'i' };
        }

        // Filtres numériques (popularité, vote moyen, vote total)
        if (req.query.minPopularity) {
            const minPopularity = parseFloat(req.query.minPopularity);
            if (!isNaN(minPopularity)) {
                filters.popularity = { ...filters.popularity, $gte: minPopularity };
            } else {
                console.warn('minPopularity est invalide:', req.query.minPopularity);
            }
        }
        if (req.query.maxPopularity) {
            const maxPopularity = parseFloat(req.query.maxPopularity);
            if (!isNaN(maxPopularity)) {
                filters.popularity = { ...filters.popularity, $lte: maxPopularity };
            } else {
                console.warn('maxPopularity est invalide:', req.query.maxPopularity);
            }
        }

        console.log('Filtres MongoDB :', filters); // Log pour voir les filtres générés

        // Requête MongoDB avec les filtres
        const films = await Film.find(filters);
        res.status(200).json(films);
    } catch (error) {
        console.error('Erreur lors de la recherche de films :', error);
        res.status(500).json({ message: 'Erreur lors de la recherche de films', error });
    }
});


// Récupérer un film par ID
router.get('/:id', async (req, res) => {
    try {
        const film = await Film.findById(req.params.id);
        if (!film) {
            return res.status(404).json({ message: 'Film non trouvé.' });
        }
        res.status(200).json(film);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du film', error });
    }
});

// Mettre à jour un film
router.patch('/update/:id', async (req, res) => {
    console.log('ID reçu:', req.params.id);
    console.log('Données reçues:', req.body);

    try {
        const updatedFilm = await Film.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Retourner le document mis à jour
        );

        // Si le film n'existe pas
        if (!updatedFilm) {
            return res.status(404).json({ message: 'Film non trouvé.' });
        }

        // Si le film a été mis à jour
        res.status(200).json(updatedFilm);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du film', error });
    }
});

// Supprimer un film
router.delete('/:id', async (req, res) => {
    try {
        const deletedFilm = await Film.findByIdAndDelete(req.params.id);
        if (!deletedFilm) {
            return res.status(404).json({ message: 'Film non trouvé.' });
        }
        res.status(200).json({ message: 'Film supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du film', error });
    }
});


module.exports = router;
