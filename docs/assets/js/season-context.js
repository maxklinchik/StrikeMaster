(function () {
  const storageKey = 'bowling_season';
  const defaultSeason = '2025-2026';

  function getSeason() {
    return localStorage.getItem(storageKey) || defaultSeason;
  }

  function syncSelects(season) {
    document.querySelectorAll('[data-season-select]').forEach((select) => {
      if (select.value !== season) {
        select.value = season;
      }
    });
  }

  function setSeason(season) {
    localStorage.setItem(storageKey, season);
    syncSelects(season);
    window.dispatchEvent(new CustomEvent('season:change', { detail: { season } }));
  }

  function init() {
    const season = getSeason();
    document.querySelectorAll('[data-season-select]').forEach((select) => {
      select.value = season;
      select.addEventListener('change', (event) => {
        setSeason(event.target.value);
      });
    });
  }

  function onChange(handler) {
    window.addEventListener('season:change', (event) => {
      handler(event.detail.season);
    });
  }

  window.SeasonContext = {
    getSeason,
    setSeason,
    onChange,
    storageKey,
    defaultSeason,
    init
  };

  document.addEventListener('DOMContentLoaded', init);
})();
