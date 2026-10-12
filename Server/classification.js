let currentPage = 1;
const limit = 5; // Nombre de films par page
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

        currentPage = page; // Mettre à jour la page actuelle
    } catch (error) {
        console.error("Erreur dans fetchFilms:", error);
    }
}


// Fonction pour afficher les films dans le tableau
function displayResults(films) {
    const tableBody = document.querySelector("#classification-table tbody");

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
                <td></td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Fonction de recherche de films
async function searchMovies(title = "", page = 1) {

    console.log("Recherche en cours...");
    console.log("Titre:", title);

    if (!title) {
        alert("Veuillez entrer au moins un critère de recherche.");
        return;
    }

    // Construire l'URL de la requête
    let url = `http://localhost:3000/api/films/search?`;
    if (title) url += `title=${encodeURIComponent(title)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Erreur lors de la recherche.");

        const data = await response.json();

        console.log("Résultats de la recherche:", data);

        if (page === 1) {
            resetResults(); // Réinitialiser les résultats uniquement pour la première page
        }
        displayResults(data);

        isSearchActive = true;
        currentPage = page; // Réinitialiser la pagination
    } catch (error) {
        console.error("Erreur dans searchMovies:", error);
        alert("Erreur lors de la recherche. Veuillez réessayer.");
    }
}


// Fonction pour relancer la recherche active
function relaunchSearch() {
    const title = document.getElementById("classification-search").value;

    // Réexécuter la recherche avec les critères actuels
    searchMovies(title, currentPage);
}


// Réinitialiser les résultats de la recherche
function resetResults() {
    document.querySelector("#classification-table tbody").innerHTML = ""; // Vide le tableau
}

// Réinitialiser les filtres et recharger les films par défaut
function resetSearch() {
    isSearchActive = false;
    currentPage = 1;
    resetResults();
    fetchFilms();
}

// Gestion des boutons
document.getElementById("classification-search-button").addEventListener("click", () => {
    const title = document.getElementById("classification-search").value;
    searchMovies(title, minPopularity, maxPopularity);
});

document.getElementById("classificaton-reset-button").addEventListener("click", resetSearch);

// Charger les films au démarrage
fetchFilms();
