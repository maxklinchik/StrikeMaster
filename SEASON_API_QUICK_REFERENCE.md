# Quick Reference: Season-Aware API Calls

## Client-Side Code Updates

### 1. Update API Client Helper

**File:** `docs/assets/js/api/client.js`

```javascript
// Add helper to get current season from localStorage
function getCurrentSeason() {
  return localStorage.getItem('bowling_season') || '2025-2026';
}

// Update fetchMatches to include season
async function fetchMatches(coachId, gender = null, season = null) {
  const url = new URL('/api/matches', window.location.origin);
  url.searchParams.append('coachId', coachId);
  
  if (gender) url.searchParams.append('gender', gender);
  if (season) url.searchParams.append('season', season);
  
  const response = await fetch(url);
  return response.json();
}

// Example usage:
// const matches = await fetchMatches(userId);  // All seasons
// const matches = await fetchMatches(userId, 'boys', '2025-2026');  // Specific season
```

### 2. When Creating Matches

**In match entry form (e.g., home.html or match creation modal):**

```javascript
const matchData = {
  coachId: userId,
  gender: selectedGender,
  opponent: opponentName,
  matchDate: matchDate,
  ourScore: homeScore,
  opponentScore: awayScore,
  result: determineResult(homeScore, awayScore),
  season: localStorage.getItem('bowling_season') || '2025-2026',  // ← Add this
  location: location,
  comments: comments
};

fetch('/api/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(matchData)
})
.then(r => r.json())
.then(match => console.log('Match created:', match));
```

### 3. Load Matches with Current Season

**Example for home.html dashboard:**

```javascript
async function loadDashboardMatches() {
  const user = JSON.parse(localStorage.getItem('bowling_user'));
  const currentSeason = localStorage.getItem('bowling_season') || '2025-2026';
  
  try {
    // Fetch matches for current season
    const matches = await fetch(
      `/api/matches?coachId=${user.id}&season=${currentSeason}`
    ).then(r => r.json());
    
    // Render matches
    renderMatches(matches);
  } catch (error) {
    console.error('Failed to load matches:', error);
  }
}

// Listen for season changes
window.addEventListener('season:change', (e) => {
  console.log('Season changed to:', e.detail.season);
  loadDashboardMatches();  // Reload matches for new season
});
```

### 4. Season Management in seasonSettings.html

The delete button already makes the API call, but here's the structure:

```javascript
async function deleteSeason(season, coachId) {
  const response = await fetch(
    `/api/seasons/${season}?coachId=${coachId}`,
    { method: 'DELETE' }
  );
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`Deleted ${result.deletedCount} matches`);
    // Refresh season list
    loadSeasons(coachId);
  }
}
```

### 5. Display All Seasons (Optional UI Enhancement)

```javascript
async function loadAvailableSeasons(coachId) {
  try {
    const response = await fetch(`/api/seasons?coachId=${coachId}`);
    const { seasons } = await response.json();
    
    // Update UI with available seasons
    renderSeasonList(seasons);
  } catch (error) {
    console.error('Failed to load seasons:', error);
  }
}
```

## API Request/Response Examples

### Fetch Matches

**Request:**
```javascript
GET /api/matches?coachId=123e4567-e89b-12d3-a456-426614174000&season=2025-2026
```

**Response:**
```json
[
  {
    "id": "uuid",
    "coach_id": "123e4567-e89b-12d3-a456-426614174000",
    "gender": "boys",
    "opponent": "Opponent Name",
    "match_date": "2026-04-19",
    "our_score": 5,
    "opponent_score": 3,
    "result": "win",
    "season": "2025-2026",
    "can_edit": true,
    "is_owner": true
  }
]
```

### Create Match

**Request:**
```javascript
POST /api/matches

{
  "coachId": "123e4567-e89b-12d3-a456-426614174000",
  "gender": "boys",
  "opponent": "New School",
  "matchDate": "2026-04-20",
  "season": "2025-2026",
  "ourScore": 4,
  "opponentScore": 2,
  "result": "win"
}
```

**Response:**
```json
{
  "id": "new-uuid",
  "coach_id": "123e4567-e89b-12d3-a456-426614174000",
  "gender": "boys",
  "opponent": "New School",
  "match_date": "2026-04-20",
  "season": "2025-2026",
  "our_score": 4,
  "opponent_score": 2,
  "result": "win",
  "created_at": "2026-04-19T10:30:00Z"
}
```

### Get Available Seasons

**Request:**
```javascript
GET /api/seasons?coachId=123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "seasons": ["2025-2026", "2024-2025", "2023-2024"],
  "count": 3
}
```

### Delete Season

**Request:**
```javascript
DELETE /api/seasons/2024-2025?coachId=123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "success": true,
  "message": "Deleted 15 matches for season 2024-2025",
  "deletedCount": 15
}
```

## Testing with curl

```bash
# Get seasons
curl "http://localhost:3000/api/seasons?coachId=USER_ID"

# Get matches for specific season
curl "http://localhost:3000/api/matches?coachId=USER_ID&season=2025-2026"

# Create a match
curl -X POST "http://localhost:3000/api/matches" \
  -H "Content-Type: application/json" \
  -d '{
    "coachId": "USER_ID",
    "gender": "boys",
    "opponent": "Test School",
    "matchDate": "2026-04-20",
    "season": "2025-2026"
  }'

# Delete a season
curl -X DELETE "http://localhost:3000/api/seasons/2024-2025?coachId=USER_ID"
```

## Summary of Changes

| Item | Before | After |
|------|--------|-------|
| Fetch matches | `/api/matches?coachId=X` | `/api/matches?coachId=X&season=Y` |
| Create match | No season field | Includes `season` in body |
| Get seasons | N/A | `GET /api/seasons?coachId=X` |
| Delete season | N/A | `DELETE /api/seasons/Y?coachId=X` |
| Database | No season column | `season VARCHAR(20)` |
| Default season | N/A | `'2025-2026'` |
