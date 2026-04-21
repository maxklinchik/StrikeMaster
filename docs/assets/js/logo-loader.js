// Load and apply user's logo preference across all pages
(function() {
  try {
    const logoDisplay = localStorage.getItem('logoDisplay') || 'school';
    
    // Store for later use by page-specific handlers
    window.userLogoDisplay = logoDisplay;
    
    // Immediate application function
    function applyLogoPreference() {
      const logoImgs = document.querySelectorAll('[data-team-logo], .navbar .logo img');
      if (!logoImgs.length) return;
      
      const currentPath = window.location.pathname;
      const basePath = currentPath.includes('/pages/')
        ? '../../assets/images/'
        : 'assets/images/';
      
      logoImgs.forEach(img => {
        if (logoDisplay === 'strikemaster') {
          img.src = `${basePath}BowlingPinCartoon.png`;
          img.style.display = '';
        } else if (logoDisplay === 'school') {
          // Try to get school logo from user data if available
          let schoolLogoSet = false;
          try {
            const userStr = localStorage.getItem('bowling_user');
            if (userStr) {
              const user = JSON.parse(userStr);
              if (user.team_name && typeof getTeamLogo === 'function') {
                const schoolLogo = getTeamLogo(user.team_name, `${basePath}Team Logos/`);
                if (schoolLogo) {
                  img.src = schoolLogo;
                  img.style.display = '';
                  schoolLogoSet = true;
                  return;
                }
              }
            }
          } catch (e) {}
          
          // Fallback to default school logo if user not logged in or team logo not found
          if (!schoolLogoSet) {
            img.src = `${basePath}Team Logos/phLogo.png`;
            img.style.display = '';
          }
        } else if (logoDisplay === 'none') {
          img.style.display = 'none';
        }
      });
    }
    
    // Apply immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyLogoPreference);
    } else {
      applyLogoPreference();
    }
    
    // Also apply on mutation in case images are added dynamically
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => {
        const imgs = document.querySelectorAll('[data-team-logo], .navbar .logo img');
        let needsUpdate = false;
        
        imgs.forEach(img => {
          if (logoDisplay === 'strikemaster' && !img.src.includes('BowlingPinCartoon.png')) {
            needsUpdate = true;
          } else if (logoDisplay === 'school' && img.src.includes('BowlingPinCartoon.png')) {
            needsUpdate = true;
          } else if (logoDisplay === 'none' && img.style.display !== 'none') {
            needsUpdate = true;
          }
        });
        
        if (needsUpdate) {
          applyLogoPreference();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  } catch (e) {
    console.log('Logo loader error:', e.message);
  }
})();
