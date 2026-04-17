// API Client for GitHub Pages Frontend
// This will call your Railway API backend

const API_URL = 'https://strikemaster-production.up.railway.app';

class APIClient {
  constructor() {
    this.baseURL = API_URL;
    this.session = this.loadSession();
  }

  // Session management
  loadSession() {
    const stored = localStorage.getItem('strikemaster_session');
    return stored ? JSON.parse(stored) : null;
  }

  saveSession(session) {
    localStorage.setItem('strikemaster_session', JSON.stringify(session));
    this.session = session;
  }

  clearSession() {
    localStorage.removeItem('strikemaster_session');
    this.session = null;
  }

  getCurrentUser() {
    return this.session?.user || null;
  }

  isLoggedIn() {
    return !!this.session;
  }

  getAuthHeaders() {
    return this.session ? {
      'Authorization': `Bearer ${this.session.access_token}`
    } : {};
  }

  // Generic fetch wrapper
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ==================== AUTH ====================

  async signup(email, password, firstName, lastName, role = 'student') {
    const data = await this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, role })
    });
    return data;
  }

  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data.session) {
      this.saveSession(data.session);
    }
    return data;
  }

  logout() {
    this.clearSession();
    window.location.href = '/';
  }

  async getProfile(userId) {
    return this.request(`/api/auth/profile/${userId}`);
  }

  // ==================== TEAMS ====================

  async getTeams(gender = null) {
    const query = gender ? `?gender=${gender}` : '';
    return this.request(`/api/teams${query}`);
  }

  async getTeam(teamId) {
    return this.request(`/api/teams/${teamId}`);
  }

  async createTeam(name, gender, schoolName, division, county) {
    const user = this.getCurrentUser();
    if (!user) throw new Error('Must be logged in to create team');
    
    return this.request('/api/teams', {
      method: 'POST',
      body: JSON.stringify({ 
        name, 
        gender, 
        schoolName, 
        division, 
        county, 
        directorId: user.id 
      })
    });
  }

  async updateTeam(teamId, updates) {
    return this.request(`/api/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // ==================== PLAYERS ====================

  async getTeamPlayers(teamId) {
    return this.request(`/api/teams/${teamId}/players`);
  }

  async getPlayer(playerId) {
    return this.request(`/api/players/${playerId}`);
  }

  async createPlayer(teamId, firstName, lastName, grade, jerseyNumber) {
    return this.request('/api/players', {
      method: 'POST',
      body: JSON.stringify({ teamId, firstName, lastName, grade, jerseyNumber })
    });
  }

  async updatePlayer(playerId, updates) {
    return this.request(`/api/players/${playerId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deactivatePlayer(playerId) {
    return this.updatePlayer(playerId, { isActive: false });
  }

  // ==================== MATCHES ====================

  async getMatches(teamId = null) {
    const query = teamId ? `?teamId=${teamId}` : '';
    return this.request(`/api/matches${query}`);
  }

  async getMatch(matchId) {
    return this.request(`/api/matches/${matchId}`);
  }

  async createMatch(homeTeamId, awayTeamId, matchDate, location) {
    return this.request('/api/matches', {
      method: 'POST',
      body: JSON.stringify({ homeTeamId, awayTeamId, matchDate, location })
    });
  }

  async updateMatchStatus(matchId, status) {
    return this.request(`/api/matches/${matchId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  async getMatchScores(matchId) {
    return this.request(`/api/matches/${matchId}/scores`);
  }

  // ==================== SCORES ====================

  async submitScore(matchId, playerId, gameNumber, score, woodCount, strikes = 0, spares = 0) {
    return this.request('/api/scores', {
      method: 'POST',
      body: JSON.stringify({ 
        matchId, 
        playerId, 
        gameNumber, 
        score, 
        woodCount, 
        strikes, 
        spares 
      })
    });
  }

  async getPlayerStats(playerId) {
    return this.request(`/api/players/${playerId}/stats`);
  }

  async getRankings(filters = {}) {
    const params = new URLSearchParams(filters);
    const query = params.toString() ? `?${params}` : '';
    return this.request(`/api/rankings${query}`);
  }
}

// Export singleton instance
const api = new APIClient();
