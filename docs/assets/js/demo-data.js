const demoFilms = [
  { id: 1, title: 'The Shawshank Redemption', overview: 'Un récit d’espoir et de persévérance.', release_date: '1994-09-23', popularity: 82.4, vote_average: 8.7, vote_count: 24500 },
  { id: 2, title: 'Inception', overview: 'Un voleur spécialisé dans l’extraction des rêves.', release_date: '2010-07-16', popularity: 78.9, vote_average: 8.4, vote_count: 31200 },
  { id: 3, title: 'Interstellar', overview: 'Une mission spatiale pour trouver un nouvel avenir à l’humanité.', release_date: '2014-11-07', popularity: 76.2, vote_average: 8.5, vote_count: 28400 },
  { id: 4, title: 'Parasite', overview: 'Deux familles que tout oppose se rapprochent de façon inattendue.', release_date: '2019-05-30', popularity: 69.8, vote_average: 8.5, vote_count: 16800 },
  { id: 5, title: 'The Social Network', overview: 'La création d’un réseau social et ses conséquences.', release_date: '2010-10-01', popularity: 61.7, vote_average: 7.7, vote_count: 12400 },
  { id: 6, title: 'Arrival', overview: 'Une linguiste tente de communiquer avec des visiteurs venus d’ailleurs.', release_date: '2016-11-10', popularity: 58.3, vote_average: 7.9, vote_count: 13900 }
];

function renderDemoFilms() {
  const title = document.querySelector('#search-title')?.value.trim().toLowerCase() || '';
  const min = Number.parseFloat(document.querySelector('#min-popularity')?.value) || -Infinity;
  const max = Number.parseFloat(document.querySelector('#max-popularity')?.value) || Infinity;
  const filtered = demoFilms.filter(film => film.title.toLowerCase().includes(title) && film.popularity >= min && film.popularity <= max);
  const body = document.querySelector('#data-table tbody');
  if (!body) return;
  body.innerHTML = filtered.length ? filtered.map(film => `<tr><td>${film.id}</td><td class="font-weight-bold">${film.title}</td><td>${film.overview}</td><td>${film.release_date}</td><td>${film.popularity}</td><td>${film.vote_average}</td><td>${film.vote_count}</td><td><button class="btn btn-warning btn-sm" disabled>Démo</button></td><td><button class="btn btn-danger btn-sm" disabled>Démo</button></td></tr>`).join('') : '<tr><td colspan="9" class="text-center">Aucun film trouvé dans la démonstration.</td></tr>';
}

document.addEventListener('DOMContentLoaded', () => {
  renderDemoFilms();
  document.querySelector('#search-button')?.addEventListener('click', renderDemoFilms);
  document.querySelector('#reset-button')?.addEventListener('click', () => { document.querySelector('#search-title').value = ''; document.querySelector('#min-popularity').value = ''; document.querySelector('#max-popularity').value = ''; renderDemoFilms(); });
  const loadMore = document.querySelector('#load-more');
  if (loadMore) { loadMore.textContent = 'Données de démonstration'; loadMore.disabled = true; }
});
