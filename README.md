# Strike Master 🎳

A modern team management and scoring application for high school bowling teams. Track players, enter three-game scores, view team stats, and manage rankings.

## 🌐 Live Demo

**GitHub Pages**: [https://arkokush.github.io/StrikeMaster/](https://arkokush.github.io/StrikeMaster/)

## 📁 Project Structure

```
StrikeMaster/
├── docs/                          # Frontend (GitHub Pages)
│   ├── index.html                 # Landing page
│   ├── assets/
│   │   ├── css/
│   │   │   ├── style.css          # Main styles
│   │   │   ├── records.css        # Records page styles
│   │   │   └── stored-colors.css  # Theme color variables
│   │   ├── images/
│   │   │   └── images/
│   │   │       └── phLogo.png     # Logo
│   │   └── js/
│   │       ├── accent-loader.js   # Theme loader
│   │       ├── api/
│   │       │   └── client.js      # API client
│   │       ├── config/
│   │       │   └── supabase.js    # Supabase configuration
│   │       └── services/
│   │           ├── auth.js        # Authentication service
│   │           └── database.js    # Database service
│   └── pages/
│       ├── auth/                  # Authentication pages
│       │   ├── studentLogin.html
│       │   ├── teacherLogin.html
│       │   └── teacherSignUp.html
│       ├── dashboard/             # Main application pages
│       │   ├── players.html
│       │   ├── boysRecords.html
│       │   ├── girlsPlayers.html
│       │   ├── girlsRecords.html
│       │   ├── myTeam.html
│       │   ├── playerProfile.html
│       │   └── home.html
│       ├── rankings/              # Statistics & rankings
│       │   ├── countyRanking.html
│       │   ├── divisionRankings.html
│       │   └── teamSeasonStats.html
│       └── settings/              # User settings
│           ├── accountInfo.html
│           ├── appearanceSettings.html
│           └── teamsSettings.html
├── api/                           # Backend API (Railway)
│   ├── package.json
│   └── server.js
├── server.js                      # Root server
├── package.json
├── Procfile                       # Heroku/Railway deployment
├── nixpacks.toml                  # Nixpacks config
├── start.sh                       # Startup script
├── DEPLOYMENT_GUIDE.md
└── INTEGRATION_GUIDE.md
```

## 🚀 Features

### For Coaches/Directors
- **Player Management**: Add, remove, and manage team players
- **Score Tracking**: Enter 3-game scores for each match
- **Match Management**: Add dates, opponents, and bowling locations
- **Team Statistics**: View season averages and performance metrics

### For Students
- **View-Only Access**: Browse team records and player stats
- **Quick Login**: Simple code-based authentication

### General Features
- **Boys/Girls Teams**: Separate tracking for boys and girls teams
- **Rankings**: County and division rankings
- **Customizable Appearance**: Theme colors and dark mode
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Vanilla JS for simplicity
- **GitHub Pages**: Static site hosting

### Backend
- **Node.js + Express**: API server
- **Supabase**: Database and authentication
- **Railway/Heroku**: Backend hosting

## 📦 Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/arkokush/StrikeMaster.git
   cd StrikeMaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the frontend**
   - Open `docs/index.html` in your browser, or
   - Use a local server like Live Server

## 🌍 Deployment

### Frontend (GitHub Pages)

1. Go to repository Settings → Pages
2. Set source to `main` branch, `/docs` folder
3. Save and wait for deployment

**URL**: `https://arkokush.github.io/StrikeMaster/`

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy from the `/api` directory

## 📱 Page Navigation

| Page | Description |
|------|-------------|
| `index.html` | Landing page with login options |
| `studentLogin.html` | Student code-based login |
| `teacherLogin.html` | Teacher email/password login |
| `teacherSignUp.html` | New teacher registration |
| `home.html` | Select season and team level |
| `boysRecords.html` | Boys team score records |
| `girlsRecords.html` | Girls team score records |
| `players.html` | Manage boys team players |
| `girlsPlayers.html` | Manage girls team players |
| `playerProfile.html` | Individual player statistics |
| `myTeam.html` | Team dashboard menu |
| `countyRanking.html` | County-wide rankings |
| `divisionRankings.html` | Division rankings |
| `teamSeasonStats.html` | Season statistics overview |
| `appearanceSettings.html` | Theme customization |
| `teamsSettings.html` | Manage opponent teams |
| `accountInfo.html` | User account settings |

## 🎨 Customization

### Theme Colors
Navigate to Settings → Appearance to customize:
- **Accent Color**: Primary UI color
- **Main Color**: Secondary/navbar color
- **Dark Mode**: Toggle dark theme

## 🔐 Authentication

### Teacher/Director Access
- Full access to add/edit players and scores
- Manages team rosters
- Receives unique coach code for students

### Student Access
- View-only access using coach code
- Cannot modify data

## 📄 License

MIT License - feel free to use and modify for your own projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Made with ❤️ for high school bowling teams**
