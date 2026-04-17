# 🎳 Strike Master - Railway Deployment Guide

## Files Created

✅ `/api/server.js` - Express API server  
✅ `/api/package.json` - Node.js dependencies  
✅ `/start.sh` - Railway startup script  
✅ `/public/assets/js/api/client.js` - Frontend API client  
✅ `/railway.json` - Railway deployment config  

---

## 🚀 Railway Deployment Steps

### 1. Add Environment Variables in Railway

Go to your Railway project → **Variables** tab and add:

```
SUPABASE_URL=https://fxqddamrgadttkfxvjth.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
NODE_ENV=production
```

**To get your Service Role Key:**
1. Go to: https://app.supabase.com/project/fxqddamrgadttkfxvjth/settings/api
2. Copy the **`service_role`** key (starts with `eyJ...`)
3. Paste it as the value for `SUPABASE_SERVICE_KEY`

### 2. Connect GitHub to Railway

1. In Railway project, click **"New"** → **"GitHub Repo"**
2. Select: `maxklinchik/Saxon-Project-Front-End`
3. Railway will auto-deploy when you push

### 3. Get Your Railway URL

After deployment succeeds:
1. Click on your service in Railway
2. Go to **Settings** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Copy the URL (e.g., `https://strikemaster-production.up.railway.app`)

### 4. Update Frontend API URL

After you get the Railway URL, you need to update:

**File:** `/public/assets/js/api/client.js`  
**Line 4:** Change `const API_URL = 'https://YOUR-RAILWAY-URL.railway.app';`  
**To:** `const API_URL = 'https://your-actual-railway-url.railway.app';`

---

## 📦 GitHub Pages Setup

### 1. Enable GitHub Pages

1. Go to: https://github.com/maxklinchik/Saxon-Project-Front-End/settings/pages
2. Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/public**
4. Click **Save**
5. Your site will be at: `https://maxklinchik.github.io/Saxon-Project-Front-End/`

---

## ✅ Deployment Checklist

Before pushing to GitHub:

- [ ] Railway environment variables set (SUPABASE_URL, SUPABASE_SERVICE_KEY)
- [ ] Railway GitHub repo connected
- [ ] Railway domain generated
- [ ] Updated API_URL in `/public/assets/js/api/client.js` with Railway URL
- [ ] GitHub Pages enabled

---

## 🧪 Test Your API

After Railway deploys, test it:

```bash
# Health check
curl https://your-railway-url.railway.app/api/health

# Expected response:
{"status":"ok","timestamp":"2026-01-20T..."}
```

---

## 📝 What Each File Does

### Backend (Railway)
- **`api/server.js`** - Express server with all endpoints
- **`api/package.json`** - Defines dependencies (@supabase/supabase-js, express, cors)
- **`start.sh`** - Runs `npm install` and starts server
- **`railway.json`** - Tells Railway how to build and deploy

### Frontend (GitHub Pages)
- **`public/assets/js/api/client.js`** - JavaScript API client
- **All HTML files** - Will use `api.login()`, `api.getTeams()`, etc.

---

## 🔄 Workflow

1. **User visits GitHub Pages** (https://maxklinchik.github.io/...)
2. **Frontend loads** (HTML/CSS/JS from GitHub)
3. **User logs in** → Frontend calls Railway API
4. **Railway API** → Talks to Supabase securely
5. **Response** → Sent back to frontend
6. **Frontend displays** data

---

## ⚠️ Important Security Note

**NEVER** commit your actual Supabase service role key to Git!  
It should ONLY be in Railway's environment variables.

The `.env.example` file is safe to commit (it has placeholder values).

---

## 🐛 Troubleshooting

**Railway deployment fails:**
- Check Build Logs in Railway
- Verify `SUPABASE_SERVICE_KEY` is set in Variables

**CORS errors in browser:**
- Verify Railway URL in `client.js` matches actual deployment URL
- Check Railway deployment logs for CORS-related errors

**Authentication not working:**
- Verify service role key is correct in Railway
- Check browser console for errors
- Test `/api/health` endpoint first

---

## 📧 Need the Service Role Key?

1. Go to: https://app.supabase.com/project/fxqddamrgadttkfxvjth/settings/api
2. Look for **"Project API keys"**
3. Copy the **`service_role`** key (NOT the anon key)
4. Add it to Railway Variables as `SUPABASE_SERVICE_KEY`

**Once you provide the Railway URL, I'll update the frontend code for you!** 🚀
