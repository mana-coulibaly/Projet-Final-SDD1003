const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema({
    title: { type: String, required: true },
    overview: { type: String, default: 'Aucune description disponible' },
    release_date: { type: String, required: true },
    popularity: { type: Number, default: 0 },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 },
}, { timestamps: true }); // Ajout des champs createdAt et updatedAt

const Film = mongoose.model('Film', filmSchema);
module.exports = Film;

