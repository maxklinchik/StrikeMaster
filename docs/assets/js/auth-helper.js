// Auth Helper for Strike Master
// Simple authentication utilities for use in HTML pages

const auth = {
  // Get current user from localStorage
  getUser: function() {
    const userStr = localStorage.getItem('bowling_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },

  // Get auth token
  getToken: function() {
    return localStorage.getItem('bowling_token');
  },

  // Get user role (coach or student)
  getRole: function() {
    return localStorage.getItem('bowling_role') || 'coach';
  },

  // Check if user is logged in (has user data)
  isLoggedIn: function() {
    const user = this.getUser();
    // User is logged in if they have user data with an id
    return !!(user && user.id);
  },

  // Check if user is a student (read-only access)
  isStudent: function() {
    return this.getRole() === 'student';
  },

  // Check if user is a coach/director (full access)
  isCoach: function() {
    const user = this.getUser();
    // User must be logged in AND not a student
    return !!(user && user.id) && this.getRole() !== 'student';
  },

  // Check if user can edit (coaches only, not students)
  canEdit: function() {
    return this.isLoggedIn() && !this.isStudent();
  },

  // Require authentication - redirect to login if not authenticated
  requireAuth: function(loginUrl) {
    if (!this.isLoggedIn()) {
      const defaultLoginUrl = loginUrl || '../../pages/auth/login.html';
      window.location.href = defaultLoginUrl;
      return false;
    }
    return true;
  },

  // Require coach role - redirect to login if not a coach
  requireCoach: function(loginUrl) {
    if (!this.isLoggedIn()) {
      const defaultLoginUrl = loginUrl || '../../pages/auth/login.html';
      window.location.href = defaultLoginUrl;
      return false;
    }
    return true;
  },

  // Logout - clear session and redirect
  logout: function(redirectUrl) {
    localStorage.removeItem('bowling_user');
    localStorage.removeItem('bowling_token');
    localStorage.removeItem('bowling_role');
    const defaultRedirectUrl = redirectUrl || '../../index.html';
    window.location.href = defaultRedirectUrl;
  },

  // Get user display name
  getDisplayName: function() {
    const user = this.getUser();
    if (!user) return 'Guest';
    if (user.first_name && user.last_name) {
      return user.first_name + ' ' + user.last_name;
    }
    return user.email || 'User';
  }
};
