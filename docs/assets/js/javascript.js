// Définition de la route API
const API_URL = "http://localhost:3000";
const API_URL_film = "/api/films";
const API_films_delete = "/api/films/delete"
const API_films_research = "/api/films/research"
const API_films_updater = "/api/films/update"

// Fonction pour récupérer les données depuis l'API
function fetchFilms() {
    return $.ajax({
        url: `${API_URL}/api/films`,
        method: "GET",
        timeout: 0,
    });
}

// Fonction pour générer une ligne de tableau pour un film
function generateTableRow(film) {

    return `
        <tr>
            <td>${film.id}</td>
            <td>${film.titre}</td>
            <td>${film.overview}</td>
            <td>${film.release_date}</td>
            <td>${film.popularity}</td>
            <td>${film.vote_average}</td>
            <td>${film.vote_count}</td>
            <td>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${film.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${film.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `;
}

// Fonction pour peupler la table HTML
function populateTable(films) {
    const tableBody = $("#data-table tbody");
    tableBody.empty(); // Nettoyer le contenu existant
    films.forEach(film => {
        const row = generateTableRow(film);
        tableBody.append(row);
    });
}

// Fonction pour filtrer les films par titre
function filterMoviesByTitle(title) {
    fetchFilms()
        .done(function (response) {
            if (Array.isArray(response)) {
                const filteredMovies = response.filter(movie =>
                    movie.title.toLowerCase().includes(title.toLowerCase()) // Assurez-vous que "titre" est le nom du champ pour le titre du film
                );
                populateTable(filteredMovies); // Populate avec les films filtrés
            } else {
                console.error("La réponse n'est pas un tableau d'objets.");
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Erreur de récupération des données :", textStatus, errorThrown);
        });
}

// Gestionnaires d'événements
$(document).ready(function () {
     // Recherche par titre
        $("#search-title").on("input", function () {
        const searchValue = $(this).val();
        filterMoviesByTitle(searchValue); // Appel de la fonction pour filtrer les films
    });

    

    // Ouverture et fermeture du modal de modificaton de film
    $("#openModalBtn").on("click", function () {
        $("#loginModal").fadeIn();
    });

    $(".close-btn").on("click", function () {
        $("#loginModal").fadeOut();
    });

    $(window).on("click", function (event) {
        if ($(event.target).is("#loginModal")) {
            $("#loginModal").fadeOut();
        }
    });

    // Fermeture du modal pour ajouter un utilisateur
    $(".close-btn").on("click", function () {
        $("#updateMovieModal").fadeOut();
    });

    $(window).on("click", function (event) {
        if ($(event.target).is("#updateMovieModal")) {
            $("#updateMovieModal").fadeOut();
        }
    });

    // Préremplir les données et afficher le bon bouton :
    $("body").on("click", ".edit-btn", function () {
        const userId = $(this).data("id");
    
        // Récupérer les données de film à modifier
        $.ajax({
            url: `${API_URL}${API_films_research}` ,  // URL pour obtenir les données de l'utilisateur
            method: "POST",
            data: JSON.stringify({
                "id": userId
            }),
            success: function (films) {
                var film = films.film
                // Préremplir le formulaire
                $("##movie-title").val(film.title);
                $("##movie-overview").val(film.overview);
                $("##movie-release").val(film.release_date);
                $("##movie-popularity").val(film.popularity);
                $("##movie-vote-avg").val(film.vote_average);
                $("##movie-vote-count").val(film.vote_count);
                
    
                // Changer le titre et afficher le bouton "Mettre à jour"
                $("#modal-title").text("Modifier un Membre");
                $("#addUserButtons").hide();
                $("#updateMovieButton").show();
    
                $("#updateMovieModal").fadeIn(); // Afficher le modal
            },
            error: function () {
                alert("Erreur lors de la récupération des données.");
            }
        });
    });
    
// Envoyer la requête de mise à jour
    $("#updateMovieButton").on("click", function () {
    
        const updatedMovie = {
            titre: $("#movie-title").val(),
            overview: $("#movie-overview").val(),
            release_date: $("#movie-release").val(),
            popularity: $("#movie-popularity").val(),
            vote_average: $("#movie-vote-avg").val(),
            vote_count: $("#movie-vote-count").val(),
        };
        // Envoyer la requête de mise à jour
        $.ajax({
            url: `${API_URL}${API_members_updater}`,
            method: "POST", // ou "PATCH" selon votre API
            contentType: "application/json",
            data: JSON.stringify(updatedUser),
            success: function () {
                alert("Utilisateur mis à jour avec succès !");
                $("#updateMovieModal").fadeOut(); // Fermer le modal
                initializeTable(); // Rafraîchir la table
            },
            error: function () {
                alert("Erreur lors de la mise à jour.");
            }
        });
    });

    // Réinitialiser le formulaire
    $(".close-btn").on("click", function () {
        $("#updateMovieModal").fadeOut();
        $("#modal-title").text("Mettre à jour un film");
        $("#addUserButtons").show();
        $("#updateMovieButton").hide();
        $("#updateMovieModal form")[0].reset(); // Réinitialiser le formulaire
    });
    


    // Fonction pour supprimer un utilisateur par ID
function deleteUser(userId) {
    $.ajax({
        url: `${API_URL}${API_members_delete}`,  // Utilisation de l'ID dans l'URL pour identifier l'utilisateur
        method: "DELETE",
        success: function (response) {
            alert("Utilisateur supprimé avec succès !");
            initializeTable();  // Rafraîchir la table après la suppression
        },
        "data": JSON.stringify({
            "id": userId
        }),
        error: function (error) {
            alert("Erreur lors de la suppression de l'utilisateur.");
            console.error(error); // Afficher l'erreur dans la console
        }
    });
}

// Gestionnaire d'événements pour le bouton de suppression
$("body").on("click", ".delete-btn", function () {
    const userId = $(this).data("id");  // Récupérer l'ID de l'utilisateur à partir du bouton

    // Confirmer la suppression de l'utilisateur
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {  
        deleteUser(userId);  // Appeler la fonction pour supprimer l'utilisateur
    }
});

    // Afficher/masquer le spinner lors des requêtes
function showLoading() {
    $("#loadingSpinner").fadeIn();
}

function hideLoading() {
    $("#loadingSpinner").fadeOut();
}

// Exemple d'utilisation
/*fetchUsers()
    .done(function (response) {
        populateTable(response);
    })
    .always(function () {
        hideLoading(); // Masquer le spinner après la requête
    });

    

    $("#addUserButtons").on("click", function () {
        // Récupérer les valeurs des champs du formulaire
        const newUser = {
            nom: $("#user-name").val().trim(),
            prenom: $("#user-firstname").val().trim(),
            email: $("#user-email").val().trim(),
            matricule: $("#user-matricule").val().trim(),
            telephoneBureau: $("#user-phone").val().trim(),
            categorie: $("#user-category").val(),
            domaineActivite: $("#user-domain").val().trim(),
            autresInformations: $("#user-info").val().trim()
        };
    
        // Validation des champs
        if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.categorie) {
            alert("Veuillez remplir les champs obligatoires : Nom, Prénom, Email, et Catégorie.");
            return; // Arrêter l'exécution si les champs ne sont pas remplis
        }
    
        // Validation spécifique pour l'email
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(newUser.email)) {
            alert("Veuillez entrer une adresse email valide.");
            return;
        }
    
        // Effectuer la requête AJAX pour envoyer les données à l'API
        $.ajax({
            url: `${API_URL}${API_members_add}`, // Utilisation de l'URL de l'API définie
            method: "POST",
            data: JSON.stringify(newUser),
            contentType: "application/json",
            success: function (response) {
                alert("Membre ajouté avec succès !");
                $("#updateMovieModal").fadeOut(); // Fermer le modal après ajout
                
                // Réinitialiser les champs du formulaire
                $("#user-name").val("");
                $("#user-firstname").val("");
                $("#user-email").val("");
                $("#user-matricule").val("");
                $("#user-phone").val("");
                $("#user-category").val("");
                $("#user-domain").val("");
                $("#user-info").val("");
    
                initializeTable(); // Mettre à jour la table avec les nouveaux utilisateurs (si nécessaire)
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Gestion d'erreur plus détaillée
                const errorMessage = jqXHR.responseJSON ? jqXHR.responseJSON.message : "Erreur lors de l'ajout du membre.";
                alert(`Erreur : ${errorMessage}`);
                console.error("Erreur lors de l'ajout du membre :", errorThrown);
            }
        });
    });*/


    // Mette sur la liste rouge
    $("body").on("click", ".toggle-liste-rouge-btns", function () {
        const button = $(this); // Bouton cliqué
        const userId = button.data("id"); // ID de l'utilisateur
        const currentStatus = String(button.data("status")); // 0 ou 1
        const newStatus = currentStatus === "0" ? "1" : "0";

  
        $.ajax({
            url: `${API_URL}${API_member_setRedList}`, // Remplacez par l'URL correcte
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                id: userId,
                liste_rouge: newStatus
            }),
            success: function () {
                
                
                // Met à jour dynamiquement le bouton
                button
                    .data("status", newStatus) // Met à jour le statut dans l'attribut data
                    .toggleClass("btn-danger btn-success") // Change les couleurs du bouton
                    .text(newStatus === "0" ? "Enlever de Liste Rouge" : " Mettre sur Liste Rouge"); // Change le texte
            },
            error: function () {
                alert("Erreur lors de la mise à jour du statut de liste rouge.");
            }
        });
        alert("Statut de liste rouge mis à jour avec succès !");
        location.reload();
    });

    // Mette sur la liste rouge
    $("body").on("click", ".toggle-liste-rouge-btn", function () {
        const button = $(this); // Bouton cliqué
        const userId = button.data("id"); // ID de l'utilisateur
        const currentStatus = String(button.data("status")); // 0 ou 1
        const newStatus = currentStatus === "0" ? "1" : "0";

  
        $.ajax({
            url: `${API_URL}${API_member_setRedList}`, // Remplacez par l'URL correcte
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                id: userId,
                liste_rouge: newStatus
            }),
            success: function () {
                
                
                // Met à jour dynamiquement le bouton
                button
                    .data("status", newStatus) // Met à jour le statut dans l'attribut data
                    .toggleClass("btn-danger btn-success") // Change les couleurs du bouton
                    .text(newStatus === "0" ? "Enlever de Liste Rouge" : " Mettre sur Liste Rouge"); // Change le texte
            },
            error: function () {
                alert("Erreur lors de la mise à jour du statut de liste rouge.");
            }
        });
        alert("Statut de liste rouge mis à jour avec succès !");
    });
    
    
    // Fonction pour initialiser l'affichage de la table avec tous les utilisateurs
function initializeTable() {

    /*
    fetchUsers()
        .done(function (response) {
            if (Array.isArray(response)) {
                populateTable(response);
            } else {
                console.error("La réponse n'est pas un tableau d'objets.");
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Erreur de récupération des données :", textStatus, errorThrown);
        });*/
}
   
// Ajouter un gestionnaire d'événement pour le clic du bouton
$("#openDeconnexion").on("click", function () {
    // Appeler l'API pour déconnecter les utilisateurs
    $.ajax({
        url: `${API_URL}${API_member_dn_status}`, // URL de l'API
        method: "POST", // Méthode HTTP
        contentType: "application/json", // Type de contenu
        success: function (data) {
            const response = JSON.parse(data)
            // Afficher la réponse dans la console
            console.log(response);

            // Vérifier le statut dans la réponse
            if (response.status === "false") {
                location.reload(); 
                // alert("Tous les utilisateurs ont été déconnectés avec succès.");
            } else {
                alert("Erreur : " + response.message);
            }
        },
        error: function (xhr, status, error) {
            console.error("Erreur lors de l'appel à l'API :", error);
            alert("Une erreur est survenue lors de la déconnexion des utilisateurs.");
        }
    });
});


    // Initialisation : Charger tous les utilisateurs
    initializeTable();
});
