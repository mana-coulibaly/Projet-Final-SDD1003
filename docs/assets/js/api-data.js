(function () {
  const apiUrl = (window.SDD1003_API_URL || '').replace(/\/$/, '');
  const tableBody = document.querySelector('#data-table tbody');

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderFilms(films) {
    if (!tableBody) return;
    tableBody.innerHTML = films.length
      ? films.map((film) => `<tr data-id="${escapeHtml(film._id)}">
          <td>${escapeHtml(film.id || '—')}</td>
          <td class="font-weight-bold">${escapeHtml(film.title)}</td>
          <td>${escapeHtml(film.overview)}</td>
          <td>${escapeHtml(film.release_date)}</td>
          <td>${escapeHtml(film.popularity)}</td>
          <td>${escapeHtml(film.vote_average)}</td>
          <td>${escapeHtml(film.vote_count)}</td>
          <td><button class="btn btn-warning btn-sm" disabled>API</button></td>
          <td><button class="btn btn-danger btn-sm" disabled>API</button></td>
        </tr>`).join('')
      : '<tr><td colspan="9" class="text-center">Aucun film trouvé.</td></tr>';
  }

  function showError(message) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">${escapeHtml(message)}</td></tr>`;
  }

  async function loadFilms(query = '') {
    if (!apiUrl) return showError('URL de l’API manquante.');
    try {
      const response = await fetch(`${apiUrl}/api/films${query}`);
      if (!response.ok) throw new Error(`Réponse API ${response.status}`);
      const payload = await response.json();
      renderFilms(Array.isArray(payload) ? payload : (payload.films || []));
    } catch (error) {
      console.error(error);
      showError('Impossible de joindre l’API pour le moment.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadFilms();
    document.querySelector('#search-button')?.addEventListener('click', () => {
      const params = new URLSearchParams();
      const title = document.querySelector('#search-title')?.value.trim();
      const min = document.querySelector('#min-popularity')?.value;
      const max = document.querySelector('#max-popularity')?.value;
      if (title) params.set('title', title);
      if (min) params.set('minPopularity', min);
      if (max) params.set('maxPopularity', max);
      loadFilms(params.toString() ? `/search?${params}` : '');
    });
    document.querySelector('#reset-button')?.addEventListener('click', () => {
      ['#search-title', '#min-popularity', '#max-popularity'].forEach((selector) => {
        const field = document.querySelector(selector);
        if (field) field.value = '';
      });
      loadFilms();
    });
    const loadMore = document.querySelector('#load-more');
    if (loadMore) loadMore.remove();
  });
})();
