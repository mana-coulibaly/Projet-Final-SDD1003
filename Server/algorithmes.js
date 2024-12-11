// Récupérer les données depuis le backend
fetch('http://localhost:3000/api/films')
.then(response => response.json())
.then(films => {
    const filmsList = films.films; // Adapter selon la structure de votre réponse
    console.log('Films:', filmsList);

    if (Array.isArray(filmsList) && filmsList.length > 0) {
        regressionLinear(filmsList)
        runKNN(filmsList, 5); // KNN avec k = 5
        dbscan(filmsList);
    }else{
        console.log('Aucun film trouvé');
    }
})
.catch(error => console.error('Erreur lors de la récupération des films:', error));


// 1. Enlever les doublons et gérer les valeurs aberrantes
function cleanFilms(films) {
    // Enlever les doublons en fonction du titre (si un film a plusieurs entrées avec le même titre)
    const uniqueFilms = Array.from(new Set(films.map(film => film.title)))
        .map(title => films.find(film => film.title === title));
        console.log('Films uniques:', uniqueFilms.length);

    // Gérer les valeurs aberrantes : Supposons que nous excluons les films avec une moyenne de votes > 10 ou < 0 (valeurs irréalistes)
    const cleanFilms = uniqueFilms.filter(film => film.vote_average >= 0 && film.vote_average <= 10 && film.popularity >= 0);
    console.log('Films sans valeurs aberrantes:', uniqueFilms.length);
    
    return cleanFilms;
}

// 2. Normalisation Min-Max : mettre les données dans une plage entre 0 et 1
function normalizeData(data, fields) {
    const minMax = {};
    // Calculer le min et le max pour chaque champ spécifié
    fields.forEach(field => {
        const values = data.map(item => item[field]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        minMax[field] = { min, max };
    });

    // Normaliser les données
    const normalizedData = data.map(item => {
        const normalizedItem = { ...item };
        fields.forEach(field => {
            const { min, max } = minMax[field];
            normalizedItem[field] = (item[field] - min) / (max - min);
        });
        return normalizedItem;
    });

    return normalizedData;
}


// 3. Diviser les films en train et test
function splitData(films) {
    const trainSize = Math.floor(films.length * 0.8); // 80% pour l'entraînement
    console.log('Fonction splitData:');
    console.log('Taille des données d\'entraînement:', trainSize);
    const trainData = films.slice(0, trainSize); // Données d'entraînement
    console.log('Taille des données de test:', films.length - trainSize);
    const testData = films.slice(trainSize); // Données de test
    console.log('Données d\'entraînement:', trainData);
    console.log('Données de test:', testData);
    return { trainData, testData };
}

// 4. Régression linéaire : Prédire la popularité en fonction de la moyenne des votes
function regressionLinear(films) {
    // Nettoyer les films
    const cleanData = cleanFilms(films);
    console.log('Fonction regression linéaire:');
    console.log('Données nettoyées:', cleanData);
    
    // Normaliser les données
    const normalizedData = normalizeData(cleanData, ['vote_average', 'popularity']);
    console.log('Données normalisées:', normalizedData);

    // Diviser les films en train/test
    const { trainData, testData } = splitData(normalizedData);
    console.log('Données d\'entraînement:', trainData);
    console.log('Données de test:', testData);

    // Moyenne des votes (variable indépendante)
    const xTrain = trainData.map(film => film.vote_count);
    console.log('xTrain:', xTrain);

    // Popularité (variable dépendante)
    const yTrain = trainData.map(film => film.vote_average);
    console.log('yTrain:', yTrain);
    
    // Calcul de la régression linéaire sur les données d'entraînement
    const regression = ss.linearRegression(xTrain.map((xi, i) => [xi, yTrain[i]]));
    console.log('Régression Linéaire:', regression);
    const regressionLine = ss.linearRegressionLine(regression);
    console.log('Régression Linéaire (fonction):', regressionLine);
    
    // Prédictions pour la popularité en fonction de la moyenne des votes
    const predictedYTest = testData.map(film => regressionLine(film.vote_count)); // Prédictions sur les données de test
    console.log('Prédictions (Test):', predictedYTest);

    // Prédictions sur les données d'entraînement (pour affichage)
    const predictedYTrain = xTrain.map(xi => regressionLine(xi));
    console.log('Prédictions (Entraînement):', predictedYTrain);

    // Créer le graphique avec Chart.js pour la régression linéaire
    const ctx = document.getElementById('regressionChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: xTrain,
            datasets: [
                {
                    label: 'Régression Linéaire (Entraînement)',
                    data: predictedYTrain,
                    fill: false,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                },
                {
                    label: 'Données Réelles (Entraînement)',
                    data: yTrain,
                    fill: false,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.1
                },
                {
                    label: 'Prédictions (Test)',
                    data: predictedYTest,
                    fill: false,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    tension: 0.1
                },
                {
                    label: 'Données Réelles (Test)',
                    data: testData.map(film => film.popularity), // Ajouter les vraies valeurs de test
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)', // Une couleur différente pour les données réelles de test
                    tension: 0.1,
                    borderDash: [5, 5] // Ajouter un effet de tirets pour différencier les données réelles de test
                }
            ]
        }
    });

    // Évaluation du modèle
    evaluateModel(predictedYTest, testData);
    // Afficher les résultats de l'évaluation
    console.log('Erreur Moyenne Absolue (MAE):', calculateMAE(predictedYTest, testData.map(film => film.popularity)));
    console.log('RMSE:', calculateRMSE(predictedYTest, testData.map(film => film.popularity)));
    console.log('R²:', calculateR2(predictedYTest, testData.map(film => film.popularity)));
    console.log('Accuracy:', calculateAccuracy(predictedYTest, testData.map(film => film.popularity)));

}

// 5. Calcul de l'Accuracy Score
function calculateAccuracy(predicted, actual, tolerance = 1) {
    const correctPredictions = predicted.filter((pred, idx) =>
        Math.abs(pred - actual[idx]) <= tolerance
    ).length;
    return (correctPredictions / predicted.length) * 100; // En pourcentage
}

// 6. Évaluation du modèle
function evaluateModel(predictedYTest, testData) {
    const testY = testData.map(film => film.popularity);

    // 1. Calcul de l'Erreur Absolue Moyenne (MAE)
    const mae = calculateMAE(predictedYTest, testY);

    // 2. Calcul du RMSE (Root Mean Square Error)
    const rmse = calculateRMSE(predictedYTest, testY);

    // 3. Calcul du R² (Coefficient de détermination)
    const r2 = calculateR2(predictedYTest, testY);

    // 4. Calcul de l'Accuracy Score
    const accuracy = calculateAccuracy(predictedYTest, testY);

    // Affichage des résultats dans la console
    console.log("MAE : ", mae);
    console.log("RMSE : ", rmse);
    console.log("R² : ", r2);
    console.log("Accuracy : ", accuracy);

    // Mettre à jour les éléments HTML
    document.getElementById('maeValue').textContent = mae.toFixed(2);
    document.getElementById('rmseValue').textContent = rmse.toFixed(2);
    document.getElementById('r2Value').textContent = r2.toFixed(2);
    document.getElementById('accuracyValue').textContent = `${accuracy.toFixed(2)} %`;
}


// 7. Calcul de la MAE (Mean Absolute Error)
function calculateMAE(predicted, actual) {
    return predicted.reduce((sum, pred, idx) => sum + Math.abs(pred - actual[idx]), 0) / predicted.length;
}

// 8. Calcul du RMSE (Root Mean Square Error)
function calculateRMSE(predicted, actual) {
    const squaredErrors = predicted.map((pred, i) => Math.pow(pred - actual[i], 2));
    const meanSquaredError = squaredErrors.reduce((sum, err) => sum + err, 0) / predicted.length;
    return Math.sqrt(meanSquaredError);
}

// 9. Calcul du R² (Coefficient de détermination)
function calculateR2(predicted, actual) {
    const meanActual = actual.reduce((sum, val) => sum + val, 0) / actual.length;
    const ssTotal = actual.reduce((sum, val) => sum + Math.pow(val - meanActual, 2), 0);
    const ssResidual = predicted.reduce((sum, val, i) => sum + Math.pow(val - actual[i], 2), 0);
    return 1 - (ssResidual / ssTotal);
}

// 10. K plus proches voisins (KNN) : Prédire la popularité en fonction des votes
// 1. KNN : Implémentation de l'algorithme
function knnPredict(trainData, testData, k) {
    return testData.map(testFilm => {
        // Calculer les distances entre le film de test et tous les films d'entraînement
        const distances = trainData.map(trainFilm => ({
            distance: Math.abs(trainFilm.vote_average - testFilm.vote_average), // Utiliser la distance absolue
            popularity: trainFilm.popularity
        }));

        // Trier par distance croissante
        distances.sort((a, b) => a.distance - b.distance);

        // Obtenir les K voisins les plus proches
        const kNearest = distances.slice(0, k);

        // Calculer la popularité moyenne des voisins
        const predictedPopularity = kNearest.reduce((sum, neighbor) => sum + neighbor.popularity, 0) / k;

        return {
            title: testFilm.title,
            actual: testFilm.popularity,
            predicted: predictedPopularity
        };
    });
}

// 2. Fonction principale pour KNN
function runKNN(films, k = 19) {
    const cleanData = cleanFilms(films); // Nettoyer les données
    const { trainData, testData } = splitData(cleanData); // Diviser les données en train/test

    // Effectuer les prédictions avec KNN
    const predictions = knnPredict(trainData, testData, k);

    // Évaluer les performances du modèle
    const actualValues = predictions.map(p => p.actual);
    const predictedValues = predictions.map(p => p.predicted);

    const mae = calculateMAE(predictedValues, actualValues);
    const rmse = calculateRMSE(predictedValues, actualValues);
    const r2 = calculateR2(predictedValues, actualValues);

    console.log('KNN - Résultats :');
    console.log('MAE :', mae);
    console.log('RMSE :', rmse);
    console.log('R² :', r2);
    console.log('Accuracy :', calculateAccuracy(predictedValues, actualValues));

    // Afficher les résultats
    displayKnnResults(predictions);

    // Retourner les résultats pour d'autres utilisations
    return { predictions, mae, rmse, r2 };
}

// 3. Affichage des résultats KNN
function displayKnnResults(predictions) {
    const actualPopularity = predictions.map(p => p.actual);
    const predictedPopularity = predictions.map(p => p.predicted);
    const filmTitles = predictions.map(p => p.title);

    // Afficher les métriques dans la console
    console.log("Prédictions KNN :", predictions);

    // Créer un graphique avec Chart.js
    const ctx = document.getElementById('knnChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: filmTitles,
            datasets: [
                {
                    label: 'Popularité Réelle',
                    data: actualPopularity,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1
                },
                {
                    label: 'Popularité Prédite (KNN)',
                    data: predictedPopularity,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `Prédictions KNN avec k=${predictions.length}`
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Mise à jour des métriques
    const mae = calculateMAE(predictedPopularity, actualPopularity);
    const rmse = calculateRMSE(predictedPopularity, actualPopularity);
    const r2 = calculateR2(predictedPopularity, actualPopularity);

    document.getElementById('knnMaeValue').textContent = mae.toFixed(2);
    document.getElementById('knnRmseValue').textContent = rmse.toFixed(2);
    document.getElementById('knnR2Value').textContent = r2.toFixed(2);
    document.getElementById('knnAccuracyValue').textContent = `${calculateAccuracy(predictedPopularity, actualPopularity).toFixed(2)} %`;
}

// Algorithmes DBSCAN
// 1. Implémentation de l'algorithme DBSCAN
function runDBSCAN(films, epsilon = 0.5, minPoints = 5) {
    const cleanData = cleanFilms(films);
    const normalizedData = normalizeData(cleanData, ['popularity', 'vote_average']);

    // Préparer les données pour DBSCAN (tableau de points : [popularity, vote_average])
    const data = normalizedData.map(film => [film.popularity, film.vote_average]);

    // Exécuter DBSCAN
    const dbscan = new DBSCAN();
    const clusters = dbscan.run(data, epsilon, minPoints);

    // Associer les clusters aux films
    clusters.forEach((cluster, index) => {
        cluster.forEach(filmIndex => {
            normalizedData[filmIndex].cluster = index;
        });
    });

    // Films classés avec leur cluster
    console.log("Clusters : ", clusters);
    console.log("Données avec clusters : ", normalizedData);

    return normalizedData; // Inclut les clusters pour chaque film
}

// 2. Affichage des résultats DBSCAN
function dbscan(filmsWithClusters) {
    const ctx = document.getElementById('dbscanChart').getContext('2d');

    const clusters = [...new Set(filmsWithClusters.map(f => f.cluster))];
    const datasets = clusters.map(cluster => ({
        label: `Cluster ${cluster}`,
        data: filmsWithClusters
            .filter(f => f.cluster === cluster)
            .map(f => ({ x: f.vote_average, y: f.popularity })),
        backgroundColor: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
    }));

    new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Clustering des Films avec DBSCAN'
                }
            },
            scales: {
                x: { title: { display: true, text: 'Popularité' } },
                y: { title: { display: true, text: 'Vote Moyen' } }
            }
        }
    });
}

