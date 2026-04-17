# StrikeMaster Integration Guide

## 🎳 Supabase Integration Complete!

Your Strike Master app is now configured with Supabase for authentication and database management.

## 📁 Project Structure

```
StrikeMaster/
├── public/
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css
│   │   │   ├── records.css
│   │   │   └── stored-colors.css
│   │   ├── js/
│   │   │   ├── config/
│   │   │   │   └── supabase.js          # Supabase client config
│   │   │   ├── services/
│   │   │   │   ├── auth.js              # Authentication functions
│   │   │   │   └── database.js          # Database operations
│   │   │   └── accent-loader.js
│   │   └── images/
│   └── pages/
│       ├── auth/
│       │   ├── studentLogin.html
│       │   ├── teacherLogin.html
│       │   └── teacherSignUp.html
│       ├── dashboard/
│       ├── rankings/
│       └── settings/
├── server.js
├── package.json
└── railway.json
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

## 🔧 Using the Services

### Authentication Example

```html
<!-- Add to your HTML pages -->
<script type="module">
  import { authService } from '/assets/js/services/auth.js';

  // Director Sign Up
  async function signUp() {
    const result = await authService.signUpDirector(
      'coach@school.com',
      'password123',
      'John',
      'Doe'
    );
    
    if (result.success) {
      console.log('User created:', result.user);
      window.location.href = '/pages/dashboard/myTeam.html';
    } else {
      alert('Error: ' + result.error);
    }
  }

  // Sign In
  async function signIn() {
    const result = await authService.signIn(
      'coach@school.com',
      'password123'
    );
    
    if (result.success) {
      console.log('Logged in:', result.user);
    }
  }

  // Check if user is logged in
  async function checkAuth() {
    const isAuth = await authService.isAuthenticated();
    if (!isAuth) {
      window.location.href = '/pages/auth/teacherLogin.html';
    }
  }
</script>
```

### Database Example

```html
<script type="module">
  import { dbService } from '/assets/js/services/database.js';

  // Create a Team
  async function createTeam() {
    const user = await authService.getCurrentUser();
    
    const result = await dbService.createTeam({
      name: 'Eagles',
      gender: 'boys',
      school_name: 'Lincoln High',
      division: 'A',
      county: 'Essex',
      director_id: user.id
    });
    
    if (result.success) {
      console.log('Team created:', result.team);
    }
  }

  // Add a Player
  async function addPlayer(teamId) {
    const result = await dbService.addPlayer({
      team_id: teamId,
      first_name: 'Mike',
      last_name: 'Smith',
      grade: 11,
      jersey_number: 7
    });
    
    if (result.success) {
      console.log('Player added:', result.player);
    }
  }

  // Submit Scores
  async function submitScore(matchId, playerId) {
    // Submit game 1
    await dbService.submitPlayerScore({
      match_id: matchId,
      player_id: playerId,
      game_number: 1,
      score: 215,
      wood_count: 95,
      strikes: 8,
      spares: 1
    });

    // Submit game 2
    await dbService.submitPlayerScore({
      match_id: matchId,
      player_id: playerId,
      game_number: 2,
      score: 189,
      wood_count: 88,
      strikes: 5,
      spares: 3
    });

    // Submit game 3
    await dbService.submitPlayerScore({
      match_id: matchId,
      player_id: playerId,
      game_number: 3,
      score: 202,
      wood_count: 91,
      strikes: 6,
      spares: 2
    });

    // Update summary
    await dbService.updatePlayerMatchSummary(matchId, playerId);
  }

  // Get Season Stats
  async function getStats(playerId) {
    const result = await dbService.getPlayerSeasonStats(playerId);
    
    if (result.success) {
      console.log('Matches:', result.stats.matchesPlayed);
      console.log('Total Wood:', result.stats.totalWood);
      console.log('Average:', result.stats.seasonAverage);
      console.log('High Game:', result.stats.seasonHigh);
    }
  }
</script>
```

## 🔐 Security Notes

**IMPORTANT:** Your Supabase keys are currently hardcoded in the config file. For production:

1. Never commit real API keys to git
2. Use environment variables on Railway
3. The keys provided look unusual - verify they're correct in Supabase Dashboard → Settings → API
   - Should see `anon/public` key (starts with `eyJ...`)
   - Should see `service_role` key (starts with `eyJ...`)

## 📊 Available Database Functions

### Authentication
- `signUpDirector()` - Register new coach
- `signUpStudent()` - Register new student
- `signIn()` - Login user
- `signOut()` - Logout user
- `getCurrentUser()` - Get logged-in user
- `getUserProfile()` - Get user details
- `isAuthenticated()` - Check login status

### Teams
- `createTeam()` - Create new team
- `getAllTeams()` - Get all teams
- `getTeamsByGender()` - Filter by boys/girls
- `getTeamsByDirector()` - Get coach's teams
- `updateTeam()` - Update team info

### Players
- `addPlayer()` - Add player to team
- `getPlayersByTeam()` - Get team roster
- `getPlayer()` - Get player details
- `updatePlayer()` - Update player info
- `deactivatePlayer()` - Remove from active roster

### Matches
- `createMatch()` - Schedule match
- `getMatchesByTeam()` - Get team schedule
- `getMatch()` - Get match details
- `updateMatchStatus()` - Set in_progress/completed

### Scores
- `submitPlayerScore()` - Enter game score (1-3)
- `getMatchScores()` - Get all match scores
- `getPlayerMatchScores()` - Get player's 3 games
- `updatePlayerMatchSummary()` - Calculate totals
- `getPlayerSeasonStats()` - Season statistics
- `getTeamRankings()` - Rankings by wood

## 🎯 Next Steps

1. Update login pages with actual form handlers
2. Create dashboard to display teams/players
3. Build score entry interface
4. Add rankings/leaderboards page
5. Test authentication flow
6. Deploy to Railway

## 🐛 Troubleshooting

If you see authentication errors, verify your Supabase keys:
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the `anon public` key (not the publishable key)
4. Update `/public/assets/js/config/supabase.js`
