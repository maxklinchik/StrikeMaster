# Testing Guide - Strike Master

## Setup Instructions

### 1. Clean Database Setup

**In Supabase SQL Editor:**
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `database/cleanup-and-reset.sql`
3. Click "Run" to execute
4. This will:
   - Delete ALL existing auth users
   - Drop and recreate all tables
   - Set up proper permissions

### 2. Verify Environment Variables on Railway

Make sure these are set correctly:
- `SUPABASE_URL` = `https://fxqddamrgadttkfxvjth.supabase.co`
- `SUPABASE_SERVICE_KEY` = (your service role key from Supabase)

### 3. How the New System Works

**No More Teams Table!**
- Players are linked DIRECTLY to coaches via `coach_id`
- "Team" is just the combination of coach + gender (boys/girls)
- Each coach automatically has both a boys and girls "team"

**Data Flow:**
```
Coach Signs Up
  ↓
User record created with team_code
  ↓
Coach adds players
  ↓
Players saved with coach_id + gender
  ↓
API fetches players by: /api/players?coachId=xxx&gender=boys
```

## Testing Steps

### Test 1: Create New Account

1. **Clear browser data:**
   - Open DevTools (F12)
   - Application tab → Storage → Clear site data
   - OR: `localStorage.clear()` in console

2. **Sign Up:**
   - Go to your app: https://arkokush.github.io/StrikeMaster/
   - Click "Director Sign Up"
   - Fill in:
     - First Name: Test
     - Last Name: Coach
     - School: Pascack Hills
     - Email: test@example.com
     - Password: test123
   - Click "Sign Up"
   - **Copy the team code shown!** (e.g., "XYZ123")
   - Should redirect to Team Selector

### Test 2: Add Boys Players

1. Click "Boys Team" button
2. Click "Players" in nav
3. Add a player:
   - First Name: John
   - Last Name: Doe
   - Graduation Year: 2026
   - Click "Add Player"
4. Player should appear in the list below
5. Add 2-3 more players

**Open Browser Console (F12) - you should see:**
```
Fetching players for coach: [uuid] gender: boys
Players loaded: [array of players]
```

### Test 3: Add Girls Players

1. Click "Girls Team" from nav
2. Click "Players"
3. Add a player:
   - First Name: Jane
   - Last Name: Smith
   - Graduation Year: 2027
4. Should see the player appear

### Test 4: Check My Team Page

1. Click "My Team" in nav
2. Should see boys/girls tabs
3. Switch between tabs - should show correct players
4. Try adding a player from here too

### Test 5: Student Login

1. Open new incognito window
2. Go to app, click "Student Log In"
3. Enter the team code from signup
4. Should be able to view (but not edit) the team

## Troubleshooting

### "No team found" or "No user data"
- **Solution:** Log out, clear localStorage, log in again
- Check browser console for actual error message

### "Failed to load players"
**Check:**
1. Railway logs - is the API running?
2. Browser console - what's the actual error?
3. Network tab - is the API request happening? What's the response?

**Common fixes:**
- Railway env vars not set correctly
- Database schema not run in Supabase
- Old auth users conflicting with new schema

### "500 Server Error"
**Check Railway logs:**
```
Could not fetch profile: [error message]
```

**Fix:**
1. Verify SUPABASE_SERVICE_KEY is set in Railway
2. Run cleanup-and-reset.sql in Supabase
3. Restart Railway app

### API Test Endpoints

Test these URLs directly in browser (replace with your Railway URL):

**Health check:**
```
https://strikemaster-production.up.railway.app/api/health
```
Should return: `{"status":"ok","timestamp":"...","database":"connected"}`

**After logging in, test with your user ID:**
```
https://strikemaster-production.up.railway.app/api/players?coachId=[YOUR_USER_ID]&gender=boys
```

## Architecture Summary

```
Frontend (GitHub Pages)
    ↓
API (Railway) - server.js
    ↓
Supabase (Database + Auth)
```

**Key Files:**
- `api/server.js` - All API endpoints
- `database/cleanup-and-reset.sql` - Fresh database setup
- `docs/pages/auth/teacherSignUp.html` - Coach registration
- `docs/pages/dashboard/players.html` - Player management
- `docs/assets/js/auth-helper.js` - Auth utilities
- `docs/assets/js/config/api.js` - API client

## Expected Data Structure

**User in localStorage:**
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "Coach",
  "team_name": "Pascack Hills",
  "team_code": "ABC123"
}
```

**Player object:**
```json
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "gender": "boys",
  "grad_year": 2026,
  "coach_id": "coach-uuid",
  "is_active": true
}
```
