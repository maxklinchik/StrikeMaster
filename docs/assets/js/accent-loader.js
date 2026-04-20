
// Load school colors IMMEDIATELY and completely bypass Strike Master defaults
(function () {
  try {
    // Try to get team name from user data or from data attribute
    let teamName = null;
    const dataTeam = document.documentElement.getAttribute('data-school-team');
    if (dataTeam) {
      teamName = dataTeam;
    } else {
      const userStr = localStorage.getItem("bowling_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        teamName = user.team_name;
      }
    }
    
  if (teamName && typeof getTeamColors === 'function') {
      const teamColors = getTeamColors(teamName);
      if (teamColors) {
        // If accent is white, swap with main color to reduce white visibility
        let mainColor = teamColors.mainColor;
        let accentColor = teamColors.accentColor;
        
        if (accentColor && accentColor.toUpperCase() === '#FFFFFF') {
          // Swap: use main color as accent, and accent (white) as main
          const temp = mainColor;
          mainColor = accentColor;
          accentColor = temp;
        }
        
        // IMMEDIATELY set school colors as CSS variables
        // This overrides any :root defaults
        document.documentElement.style.setProperty("--main-color", mainColor, "important");
        document.documentElement.style.setProperty("--accent-color", accentColor, "important");
      }
    }
  } catch (e) {
    console.log('School color loading not available:', e.message);
  }
})();

// Load custom colors if they exist (user's personalization)
(function () {
  const saved = localStorage.getItem("accentColor");
  if (saved) {
    document.documentElement.style.setProperty("--accent-color", saved, "important");
  }
})();

(function () {
  const savedMain = localStorage.getItem("mainColor");
  if (savedMain) {
    document.documentElement.style.setProperty("--main-color", savedMain, "important");
  }

  const mainColor = savedMain
    || getComputedStyle(document.documentElement).getPropertyValue("--main-color").trim();
  const accentColor = localStorage.getItem("accentColor")
    || getComputedStyle(document.documentElement).getPropertyValue("--accent-color").trim();

  const isLightColor = (hex) => {
    const c = hex.replace('#', '').trim();
    if (c.length < 6) return false;
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  if (mainColor) {
    if (isLightColor(mainColor)) {
      document.documentElement.style.setProperty("--sidebar-text-color", "#000000");
      document.documentElement.classList.add('light-sidebar');
    } else {
      document.documentElement.style.setProperty("--sidebar-text-color", "#ffffff");
      document.documentElement.classList.remove('light-sidebar');
    }
  }

  let accentTextColor = null;
  if (accentColor) {
    accentTextColor = isLightColor(accentColor) ? "#000000" : "#ffffff";
    document.documentElement.style.setProperty("--accent-text-color", accentTextColor);
  }

  const buttonColor = accentColor || mainColor;
  if (buttonColor) {
    const c = buttonColor.replace('#', '').trim();
    if (c.length >= 6) {
      const r = parseInt(c.substr(0, 2), 16);
      const g = parseInt(c.substr(2, 2), 16);
      const b = parseInt(c.substr(4, 2), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (luminance > 0.85) {
        document.documentElement.style.setProperty("--button-border-color", "rgba(0, 0, 0, 0.45)");
        document.documentElement.style.setProperty("--button-shadow-color", "rgba(0, 0, 0, 0.28)");
      } else if (luminance > 0.65) {
        document.documentElement.style.setProperty("--button-border-color", "rgba(0, 0, 0, 0.32)");
        document.documentElement.style.setProperty("--button-shadow-color", "rgba(0, 0, 0, 0.22)");
      } else {
        document.documentElement.style.setProperty("--button-border-color", "rgba(0, 0, 0, 0.22)");
        document.documentElement.style.setProperty("--button-shadow-color", "rgba(0, 0, 0, 0.16)");
      }
    }
  }

  if (mainColor && accentColor) {
    const c = mainColor.replace('#', '').trim();
    if (c.length >= 6) {
      const r = parseInt(c.substr(0, 2), 16);
      const g = parseInt(c.substr(2, 2), 16);
      const b = parseInt(c.substr(4, 2), 16);
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isVeryLight = luminance > 0.88;
      const isGray = chroma < 18;

      if (isVeryLight || isGray) {
        document.documentElement.style.setProperty("--dashboard-button-bg", accentColor);
        document.documentElement.style.setProperty("--dashboard-button-text", accentTextColor || "#ffffff");
        document.documentElement.style.setProperty("--dashboard-button-border", "rgba(0, 0, 0, 0.28)");
      } else {
        document.documentElement.style.setProperty("--dashboard-button-bg", "var(--card-bg)");
        document.documentElement.style.setProperty("--dashboard-button-text", "var(--text-color)");
        document.documentElement.style.setProperty("--dashboard-button-border", "var(--button-border-color)");
      }
    }
  }
})();

(function () {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
})();

(function () {
  const simpleUi = localStorage.getItem("simpleUi") === "true";
  document.documentElement.setAttribute("data-ui", simpleUi ? "simple" : "cartoon");
})();

// Team logo loader - updates navbar logo on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedLogo = localStorage.getItem('teamLogo');
  if (savedLogo) {
    const logoImgs = document.querySelectorAll('.navbar .logo img, [data-team-logo]');
    logoImgs.forEach(img => {
      const currentPath = window.location.pathname;
      let basePath = '';

      if (currentPath.includes('/pages/')) {
        basePath = '../../assets/images/Team Logos/';
      } else {
        basePath = 'assets/images/Team Logos/';
      }

      img.src = basePath + savedLogo;
    });
  }
});
