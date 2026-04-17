// Database Service - Teams, Players, Matches, Scores
import { supabase } from '../config/supabase.js';

export const dbService = {
  // ==================== TEAMS ====================
  
  /**
   * Create a new team
   */
  async createTeam(teamData) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([teamData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, team: data };
    } catch (error) {
      console.error('Create team error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all teams
   */
  async getAllTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      return { success: true, teams: data };
    } catch (error) {
      console.error('Get teams error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get teams by gender
   */
  async getTeamsByGender(gender) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('gender', gender)
        .order('name');

      if (error) throw error;
      return { success: true, teams: data };
    } catch (error) {
      console.error('Get teams by gender error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get teams by director
   */
  async getTeamsByDirector(directorId) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('director_id', directorId)
        .order('name');

      if (error) throw error;
      return { success: true, teams: data };
    } catch (error) {
      console.error('Get teams by director error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update team
   */
  async updateTeam(teamId, updates) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, team: data };
    } catch (error) {
      console.error('Update team error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== PLAYERS ====================

  /**
   * Add a new player
   */
  async addPlayer(playerData) {
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, player: data };
    } catch (error) {
      console.error('Add player error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get players by team
   */
  async getPlayersByTeam(teamId) {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('last_name');

      if (error) throw error;
      return { success: true, players: data };
    } catch (error) {
      console.error('Get players error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get player details
   */
  async getPlayer(playerId) {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*, teams(*)')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      return { success: true, player: data };
    } catch (error) {
      console.error('Get player error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update player
   */
  async updatePlayer(playerId, updates) {
    try {
      const { data, error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', playerId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, player: data };
    } catch (error) {
      console.error('Update player error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Deactivate player
   */
  async deactivatePlayer(playerId) {
    return this.updatePlayer(playerId, { is_active: false });
  },

  // ==================== MATCHES ====================

  /**
   * Create a new match
   */
  async createMatch(matchData) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, match: data };
    } catch (error) {
      console.error('Create match error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get matches by team
   */
  async getMatchesByTeam(teamId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('match_date', { ascending: false });

      if (error) throw error;
      return { success: true, matches: data };
    } catch (error) {
      console.error('Get matches error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get match details
   */
  async getMatch(matchId) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .eq('id', matchId)
        .single();

      if (error) throw error;
      return { success: true, match: data };
    } catch (error) {
      console.error('Get match error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update match status
   */
  async updateMatchStatus(matchId, status) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, match: data };
    } catch (error) {
      console.error('Update match status error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== PLAYER SCORES ====================

  /**
   * Submit player score for a game
   */
  async submitPlayerScore(scoreData) {
    try {
      const { data, error } = await supabase
        .from('player_scores')
        .upsert([scoreData], { onConflict: 'match_id,player_id,game_number' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, score: data };
    } catch (error) {
      console.error('Submit score error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get all scores for a match
   */
  async getMatchScores(matchId) {
    try {
      const { data, error } = await supabase
        .from('player_scores')
        .select('*, players(*)')
        .eq('match_id', matchId)
        .order('player_id')
        .order('game_number');

      if (error) throw error;
      return { success: true, scores: data };
    } catch (error) {
      console.error('Get match scores error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get player scores for a specific match
   */
  async getPlayerMatchScores(matchId, playerId) {
    try {
      const { data, error } = await supabase
        .from('player_scores')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', playerId)
        .order('game_number');

      if (error) throw error;
      return { success: true, scores: data };
    } catch (error) {
      console.error('Get player match scores error:', error);
      return { success: false, error: error.message };
    }
  },

  // ==================== PLAYER MATCH SUMMARY ====================

  /**
   * Generate or update player match summary
   */
  async updatePlayerMatchSummary(matchId, playerId) {
    try {
      // Get all scores for this player in this match
      const { data: scores, error: scoresError } = await supabase
        .from('player_scores')
        .select('*')
        .eq('match_id', matchId)
        .eq('player_id', playerId);

      if (scoresError) throw scoresError;

      if (scores.length === 0) {
        return { success: false, error: 'No scores found' };
      }

      // Calculate summary stats
      const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
      const totalWood = scores.reduce((sum, s) => sum + s.wood_count, 0);
      const highGame = Math.max(...scores.map(s => s.score));
      const averageScore = totalScore / scores.length;
      const strikes = scores.reduce((sum, s) => sum + (s.strikes || 0), 0);
      const spares = scores.reduce((sum, s) => sum + (s.spares || 0), 0);

      // Upsert summary
      const { data, error } = await supabase
        .from('player_match_summary')
        .upsert([{
          match_id: matchId,
          player_id: playerId,
          total_score: totalScore,
          total_wood: totalWood,
          average_score: averageScore,
          high_game: highGame,
          strikes,
          spares
        }], { onConflict: 'match_id,player_id' })
        .select()
        .single();

      if (error) throw error;
      return { success: true, summary: data };
    } catch (error) {
      console.error('Update summary error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get player season statistics
   */
  async getPlayerSeasonStats(playerId) {
    try {
      const { data, error } = await supabase
        .from('player_match_summary')
        .select('*, matches(*)')
        .eq('player_id', playerId)
        .order('matches(match_date)', { ascending: false });

      if (error) throw error;

      // Calculate season totals
      const matchesPlayed = data.length;
      const totalWood = data.reduce((sum, s) => sum + s.total_wood, 0);
      const seasonAverage = data.reduce((sum, s) => sum + s.average_score, 0) / matchesPlayed;
      const seasonHigh = Math.max(...data.map(s => s.high_game));

      return {
        success: true,
        stats: {
          matchesPlayed,
          totalWood,
          seasonAverage: seasonAverage.toFixed(2),
          seasonHigh,
          matches: data
        }
      };
    } catch (error) {
      console.error('Get season stats error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get team rankings by total wood
   */
  async getTeamRankings(gender = null) {
    try {
      let query = supabase
        .from('player_match_summary')
        .select('player_id, players(first_name, last_name, teams(name, gender)), total_wood')
        .order('total_wood', { ascending: false });

      if (gender) {
        query = query.eq('players.teams.gender', gender);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, rankings: data };
    } catch (error) {
      console.error('Get rankings error:', error);
      return { success: false, error: error.message };
    }
  }
};
