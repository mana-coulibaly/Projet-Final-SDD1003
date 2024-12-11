let currentPage = 1;
const limit = 10; // Nombre de films par page
let isSearchActive = false; // Indique si une recherche est active



// Fonction pour récupérer les films
async function fetchFilms(page = 1) {
    if (isSearchActive) return; // Ne charge pas les films si une recherche est active

    try {
        const response = await fetch(`http://localhost:3000/api/films?page=${page}&limit=${limit}`);
        const data = await response.json();

        if (page === 1) {
            resetResults(); // Réinitialiser uniquement pour la première page
        }

        displayResults(data.films);

        // Mettre à jour le bouton "Voir plus"
        const loadMoreButton = document.getElementById("load-more");
        if (data.currentPage < data.totalPages) {
            loadMoreButton.style.display = "block";
        } else {
            loadMoreButton.style.display = "none";
        }

        currentPage = page; // Mettre à jour la page actuelle

        // Mise à jour de la pagination
        //currentPage++;
        //document.getElementById("load-more").style.display =
            //data.currentPage < data.totalPages ? "block" : "none";
    } catch (error) {
        console.error("Erreur dans fetchFilms:", error);
    }
}




// Fonction pour afficher les films dans le tableau
function displayResults(films) {
    const tableBody = document.querySelector("#data-table tbody");

    if (!films || films.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Aucun film trouvé</td></tr>`;
        return;
    }

    films.forEach((film) => {
        const shortOverview = film.overview
            ? film.overview.substring(0, 100) + (film.overview.length > 100 ? "..." : "")
            : "Aucune description disponible";

        const row = `
            <tr data-id="${film._id}">
                <td>${film.id}</td>
                <td>${film.title}</td>
                <td>${shortOverview}</td>
                <td>${new Date(film.release_date).toDateString() || "Date inconnue"}</td>
                <td>${film.popularity}</td>
                <td>${film.vote_average}</td>
                <td>${film.vote_count}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openUpdateModal('${film._id}')">Mettre à jour</button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteFilm('${film._id}')">Supprimer</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Fonction de recherche de films
async function searchMovies(title = "", minPopularity = "", maxPopularity = "", page = 1) {

    console.log("Recherche en cours...");
    console.log("Titre:", title, "Popularité Min:", minPopularity, "Popularité Max:", maxPopularity);

    if (!title && !minPopularity && !maxPopularity) {
        alert("Veuillez entrer au moins un critère de recherche.");
        return;
    }

    // Construire l'URL de la requête
    let url = `http://localhost:3000/api/films/search?`;
    if (title) url += `title=${encodeURIComponent(title)}&`;
    if (minPopularity) url += `minPopularity=${encodeURIComponent(minPopularity)}&`;
    if (maxPopularity) url += `maxPopularity=${encodeURIComponent(maxPopularity)}&`;
    url = url.slice(0, -1); // Retirer le dernier "&"

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors de la recherche.");

        const data = await response.json();

        console.log("Résultats de la recherche:", data);

        if (page === 1) {
            resetResults(); // Réinitialiser les résultats uniquement pour la première page
        }
        displayResults(data);

        // Activer ou désactiver le bouton "Voir plus" en fonction des résultats
        const loadMoreButton = document.getElementById("load-more");
        if (data.currentPage < data.totalPages) {
            loadMoreButton.style.display = "block";

            // Mettre à jour l'événement pour charger la page suivante
            loadMoreButton.onclick = () => searchMovies(title, minPopularity, maxPopularity, page + 1);
        } else {
            loadMoreButton.style.display = "none";
        }

        isSearchActive = true;
        currentPage = page; // Réinitialiser la pagination
    } catch (error) {
        console.error("Erreur dans searchMovies:", error);
        alert("Erreur lors de la recherche. Veuillez réessayer.");
    }
}





// Fonction pour relancer la recherche active
function relaunchSearch() {
    const title = document.getElementById("search-title").value;
    const minPopularity = document.getElementById("min-popularity").value;
    const maxPopularity = document.getElementById("max-popularity").value;

    // Réexécuter la recherche avec les critères actuels
    searchMovies(title, minPopularity, maxPopularity);
}



// Réinitialiser les résultats de la recherche
function resetResults() {
    document.querySelector("#data-table tbody").innerHTML = ""; // Vide le tableau
}



// Réinitialiser les filtres et recharger les films par défaut
function resetSearch() {
    isSearchActive = false;
    currentPage = 1;
    resetResults();
    fetchFilms();
}




// Fonction pour ouvrir le modal de mise à jour
function openUpdateModal(filmId) {
    // Remplir les champs du modal avec les données du film sélectionné
    //document.getElementById('movie-id').value = movieId;
    fetch(`http://localhost:3000/api/films/${filmId}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la récupération du film");
            }
            return response.json();
        })
        .then((film) => {
            console.log("Film à mettre à jour:", film);

            // Préremplir les champs du formulaire
            document.getElementById('movie-id').value = film._id; // Définir l'ID caché
            document.getElementById("movie-title").value = film.title;
            document.getElementById("movie-overview").value = film.overview;
            document.getElementById("movie-release").value = film.release_date;
            document.getElementById("movie-popularity").value = film.popularity;
            document.getElementById("movie-vote-avg").value = film.vote_average;
            document.getElementById("movie-vote-count").value = film.vote_count;

            // Sauvegarder l'ID du film pour le récupérer lors de l'envoi de la requête de mise à jour
            document.getElementById('updateMovieButton').setAttribute('data-id', filmId);

            // Afficher le modal
            const modal = document.getElementById('updateMovieModal');
            modal.style.display = 'block';

            // Afficher le bouton de mise à jour
            document.getElementById('updateMovieButton').style.display = 'block';
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du film:', error);
        });
}





// Fermer le modal
document.querySelector('.close-btn').addEventListener('click', () => {
    const modal = document.getElementById('updateMovieModal');
    modal.style.display = 'none';
    document.getElementById('updateMovieButton').style.display = 'none'; // Cacher le bouton de mise à jour
});




// Envoyer les données mises à jour au backend
document.getElementById('updateMovieButton').addEventListener('click', () => {
    // Récupérer les valeurs des champs
    const movieId = document.getElementById('movie-id').value;
    const updatedMovie = {
        title: document.getElementById('movie-title').value,
        overview: document.getElementById('movie-overview').value,
        release_date: document.getElementById('movie-release').value,
        popularity: parseFloat(document.getElementById('movie-popularity').value),
        vote_average: parseFloat(document.getElementById('movie-vote-avg').value),
        vote_count: parseInt(document.getElementById('movie-vote-count').value),
    };

    console.log('ID du film envoyé :', movieId);

    console.log('Données envoyées:', updatedMovie);

    // Envoyer une requête PATCH au serveur
    fetch(`http://localhost:3000/api/films/update/${movieId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedMovie),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour du film');
            }
            return response.json();
        })
        .then(data => {
            console.log('Film mis à jour avec succès:', data);

            // Fermer le modal
            document.getElementById('updateMovieModal').style.display = 'none';

            // Rafraîchir la liste des films (à implémenter si nécessaire)
            fetchFilmsAndDisplay();
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour:', error);
        });
});












// Fonction pour supprimer un film
function deleteFilm(filmId) {
    fetch(`http://localhost:3000/api/films/${filmId}`, {
        method: "DELETE",
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Erreur lors de la suppression du film");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Film supprimé:", data);
            // Supprimer la ligne correspondante du tableau
            const row = document.querySelector(`tr[data-id='${filmId}']`);
            if (row) row.remove(); // Retirer la ligne du tableau
            alert("Film supprimé avec succès !");

            // Si une recherche est active, on peut relancer la recherche pour actualiser la liste
            if (isSearchActive) {
                relaunchSearch();
            }
        })
        .catch((error) => console.error("Erreur dans deleteFilm:", error));
}







// Gestion des boutons
document.getElementById("search-button").addEventListener("click", () => {
    const title = document.getElementById("search-title").value;
    const minPopularity = document.getElementById("min-popularity").value;
    const maxPopularity = document.getElementById("max-popularity").value;
    searchMovies(title, minPopularity, maxPopularity);
});

document.getElementById("reset-button").addEventListener("click", resetSearch);

document.getElementById("load-more").addEventListener("click", () => {
    if (isSearchActive) {
        searchMovies();
    } else {
        fetchFilms(currentPage + 1);
    }
});

// Charger les films au démarrage
fetchFilms();
