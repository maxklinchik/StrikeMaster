# Backend Season Integration Guide

## 1. Database Setup

### Run Migration in Supabase

Go to your Supabase dashboard → SQL Editor and run:

```sql
-- Add season column to matches table
ALTER TABLE matches ADD COLUMN season VARCHAR(20) DEFAULT '2025-2026';

-- Create indexes for fast queries
CREATE INDEX idx_matches_season ON matches(season);
CREATE INDEX idx_matches_coach_season ON matches(coach_id, season);
```

## 2. Updated API Endpoints

### GET /api/matches - Fetch matches with season filtering

**Query Parameters:**
- `coachId` (required): The coach's user ID
- `gender` (optional): 'boys' or 'girls'
- `season` (optional): Specific season like '2025-2026'

**Examples:**
```javascript
// Fetch all matches for current season
fetch('/api/matches?coachId=user123&season=2025-2026')

// Fetch boys matches for a specific season
fetch('/api/matches?coachId=user123&gender=boys&season=2025-2026')

// Fetch all matches across all seasons
fetch('/api/matches?coachId=user123')
```

### POST /api/matches - Create match with season

**Request Body:**
```json
{
  "coachId": "user123",
  "gender": "boys",
  "matchType": "team",
  "opponent": "Opponent School",
  "matchDate": "2026-04-19",
  "location": "Home",
  "season": "2025-2026",
  "ourScore": 5,
  "opponentScore": 3,
  "result": "win",
  "comments": "Great game!"
}
```

**Key Changes:**
- Add `season` field to request body (defaults to '2025-2026' if not provided)
- When users create a match, it will store the season from the request

### GET /api/seasons - List all seasons for a coach

**Query Parameters:**
- `coachId` (required): The coach's user ID

**Response:**
```json
{
  "seasons": ["2025-2026", "2024-2025"],
  "count": 2
}
```

**Example:**
```javascript
fetch('/api/seasons?coachId=user123')
  .then(r => r.json())
  .then(data => console.log(data.seasons))
```

### DELETE /api/seasons/:season - Delete all matches for a season

**Query Parameters:**
- `coachId` (required): The coach's user ID

**Path Parameters:**
- `season`: The season to delete (e.g., '2024-2025')

**Response:**
```json
{
  "success": true,
  "message": "Deleted 15 matches for season 2024-2025",
  "deletedCount": 15
}
```

**Example:**
```javascript
fetch('/api/seasons/2024-2025?coachId=user123', {
  method: 'DELETE'
})
```

## 3. Frontend Integration

### Update Client Code to Fetch with Season

In `docs/assets/js/api/client.js` (or where you fetch matches):

```javascript
// OLD - without season filtering
async function loadMatches(coachId, gender) {
  const url = `/api/matches?coachId=${coachId}`;
  if (gender) url += `&gender=${gender}`;
  return fetch(url).then(r => r.json());
}

// NEW - with season filtering
async function loadMatches(coachId, gender, season) {
  const url = `/api/matches?coachId=${coachId}`;
  if (gender) url += `&gender=${gender}`;
  if (season) url += `&season=${season}`;
  return fetch(url).then(r => r.json());
}
```

### Update Match Creation to Include Season

When users create matches, pass the current season:

```javascript
const currentSeason = localStorage.getItem('bowling_season') || '2025-2026';

const match = {
  coachId: userId,
  gender: 'boys',
  opponent: 'Opponent Name',
  matchDate: '2026-04-19',
  season: currentSeason,  // ← Add this line
  // ... other fields
};

fetch('/api/matches', {
  method: 'POST',
  body: JSON.stringify(match)
})
```

### Connect Season Deletion from Frontend

In `docs/pages/settings/seasonSettings.html`, update the delete handler:

```javascript
// When user deletes a season via the UI
async function deleteSeason(seasonToDelete, coachId) {
  const response = await fetch(`/api/seasons/${seasonToDelete}?coachId=${coachId}`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  if (result.success) {
    console.log(`${result.deletedCount} matches deleted`);
    // Refresh the season list and matches on page
  }
}
```

## 4. Data Migration for Existing Matches

If you have existing matches without a season, assign them based on match_date:

```sql
-- Assign seasons based on match_date ranges
-- Assuming 2024-2025 season: 09/01/2024 - 08/31/2025
-- Assuming 2025-2026 season: 09/01/2025 onwards

UPDATE matches 
SET season = CASE 
  WHEN match_date >= '2024-09-01' AND match_date < '2025-09-01' THEN '2024-2025'
  WHEN match_date >= '2025-09-01' THEN '2025-2026'
  ELSE '2025-2026'  -- Default for any older matches
END
WHERE season IS NULL OR season = '2025-2026';

-- Verify the migration
SELECT season, COUNT(*) as count FROM matches GROUP BY season;
```

## 5. Testing Your Implementation

### Test GET /api/matches with season filter

```bash
# Fetch matches for specific season
curl "http://localhost:3000/api/matches?coachId=user123&season=2025-2026"

# Fetch boys matches for season
curl "http://localhost:3000/api/matches?coachId=user123&gender=boys&season=2025-2026"
```

### Test GET /api/seasons

```bash
curl "http://localhost:3000/api/seasons?coachId=user123"
```

### Test DELETE /api/seasons

```bash
curl -X DELETE "http://localhost:3000/api/seasons/2024-2025?coachId=user123"
```

## 6. Key Implementation Details

### Season Column
- Default value: `'2025-2026'`
- Format: `'YYYY-YYYY'` (e.g., `'2024-2025'`)
- All existing matches get the default value until migrated

### Indexes
Two indexes are created for performance:
1. `idx_matches_season` - Fast season lookups
2. `idx_matches_coach_season` - Fast coach + season queries

### Cascade Deletes
When deleting a season:
1. Deletes all records for matches in that season
2. Deletes match permissions for those matches
3. Finally deletes the matches themselves

### No NULL Values
The season column has a default, so NULL values won't occur in practice.

## 7. Frontend-Only vs Backend Integration

**Current State (Frontend Only):**
- Seasons stored in localStorage (`bowling_seasons`)
- Current season in localStorage (`bowling_season`)
- Users can add/delete seasons in the UI

**With Backend Integration:**
- Seasons stored in database (derived from matches)
- GET /api/seasons returns actual seasons with matches
- Deleting a season removes all related data from database
- Better data persistence and sharing across devices

**Hybrid Approach (Recommended):**
1. Keep localStorage for UI state (current season selection)
2. Use backend for actual match data filtering
3. Sync localStorage with backend on load
