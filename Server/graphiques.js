// Récupérer les données depuis le backend
fetch('http://localhost:3000/api/films')
.then(response => response.json())
.then(films => {
    const filmsList = films.films; // Adapter selon la structure de votre réponse
    console.log('Films:', filmsList);

    createBarChart(filmsList);
    createLineChart(filmsList);
    createHistogram(filmsList);

    if (Array.isArray(films) && films.length > 0) {
        console.log(films);  // Afficher les données récupérées dans la console
        const films = data.films || data; // Ajustez selon la structure de votre réponse
        createBarChart(films.limit(100));
        createLineChart(films.limit(100));
        createHistogram(films.limit(100));
    }else{
        console.log('Aucun film trouvé');
    }
})
.catch(error => console.error('Erreur lors de la récupération des films:', error));

// 1. Diagramme en barres : Popularité des films
function createBarChart(films) {
    const filmsArray = films; // Extraire le tableau des films
    console.log('Films:', filmsArray);
    const sortedFilms = filmsArray.sort((a, b) => b.popularity - a.popularity);
    const ctx = document.getElementById('barChart').getContext('2d');
    const labels = sortedFilms.map(film => film.title);
    const data = sortedFilms.map(film => film.popularity);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Popularité des films(décroissante)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// 2. Graphique en lignes : Moyenne des votes au fil des années
function createLineChart(films) {
    const filmsArray = films; // Extraire le tableau des films
    console.log('Films:', filmsArray);
    const ctx = document.getElementById('lineChart').getContext('2d');
    const sortedFilms = filmsArray.sort((a, b) => a.vote_count - b.vote_count);
    const labels = sortedFilms.map(film => film.title);
    const data = sortedFilms.map(film => film.vote_average);

    // Créer le graphique
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre de votes',
                data: data,
                fill: false,
                borderColor: 'rgba(153, 102, 255, 1)',
                tension: 0.1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Nombre de vote : ${context.raw}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Films',
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre de vote',
                    },
                },
            },
        },
    });
}


// 3. Histogramme : Distribution des votes

//1. fonction pour regrouper les votes en intervalles et compter leur fréquence
function createBins(data, binSize) {
    const max = Math.ceil(Math.max(...data));
    const min = Math.floor(Math.min(...data));
    const bins = [];
    const frequencies = [];

    for (let start = min; start < max; start += binSize) {
        bins.push(`${start}-${start + binSize}`);
        const count = data.filter(value => value >= start && value < start + binSize).length;
        frequencies.push(count);
    }

    return { bins, frequencies };
}


//2. fonction pour créer l'histogramme
function createHistogram(films) {
    const filmsArray = films; // Extraire le tableau des films
    const ctx = document.getElementById('histogram').getContext('2d');
    const voteAverages = filmsArray.map(film => film.vote_average);

    // Définir la taille des intervalles (bins)
    const binSize = 1; // Exemple : intervalles de 1 (0-1, 1-2, ...)
    const { bins, frequencies } = createBins(voteAverages, binSize);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: bins, // Intervalles (bins)
            datasets: [{
                label: 'Distribution des votes',
                data: frequencies, // Fréquences des votes par intervalle
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Intervalles de votes'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Fréquence'
                    }
                }
            }
        }
    });
}

