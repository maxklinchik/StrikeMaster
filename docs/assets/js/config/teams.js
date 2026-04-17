/**
 * Centralized Teams Configuration
 * Contains all team information including logos and school colors
 */

const TEAMS_CONFIG = {
  // Bergen Catholic High School - Red and Yellow
  'bergen catholic': {
    name: 'Bergen Catholic High School',
    shortName: 'Bergen Catholic',
    logo: 'bcLogo.png',
    accentColor: '#e9ac21', // Yellow
    mainColor: '#cc0001'    // Red
  },
  // Bergen County Technical High School - Gold and Black
  'bergen tech': {
    name: 'Bergen County Technical High School',
    shortName: 'Bergen Tech',
    logo: 'btLogo.png',
    accentColor: '#ad883a', // Gold
    mainColor: '#000000'    // Black
  },
  // Bergenfield High School - Maroon and White
  'bergenfield': {
    name: 'Bergenfield High School',
    shortName: 'Bergenfield',
    logo: 'bergenfieldLogo.png',
    accentColor: '#ab2622', // Maroon
    mainColor: '#FFFFFF'    // White
  },
  // Cliffside Park - Red and Black
  'cliffside park': {
    name: 'Cliffside Park High School',
    shortName: 'Cliffside Park',
    logo: 'cpLogo.png',
    accentColor: '#ed1924', // Red
    mainColor: '#201f1f'    // Black
  },
  // Clifton High School - Maroon and Gray
  'clifton': {
    name: 'Clifton High School',
    shortName: 'Clifton',
    logo: 'clifLogo.png',
    accentColor: '#80262a', // Maroon
    mainColor: '#b2b2b2'    // Gray
  },
  // Demarest (Northern Valley Regional at Demarest) - Blue and Grey
  'demarest': {
    name: 'Northern Valley Regional High School at Demarest',
    shortName: 'Demarest',
    logo: 'nvdLogo.png',
    accentColor: '#0355a6', // Blue
    mainColor: '#9b9da0'    // Grey
  },
  // DePaul Catholic - Green and Black
  'depaul catholic': {
    name: 'DePaul Catholic High School',
    shortName: 'DePaul Catholic',
    logo: 'depLogo.png',
    accentColor: '#003300', // Green
    mainColor: '#000000'    // Black
  },
  // Dumont High School - Orange and White
  'dumont': {
    name: 'Dumont High School',
    shortName: 'Dumont',
    logo: 'dumontLogo.png',
    accentColor: '#f16421', // Orange
    mainColor: '#000000'    // Black
  },
  // Don Bosco Prep - Maroon and Silver
  'don bosco prep': {
    name: 'Don Bosco Preparatory High School',
    shortName: 'Don Bosco Prep',
    logo: 'dbLogo.png',
    accentColor: '#800000', // Maroon
    mainColor: '#C0C0C0'    // Silver
  },
  'don bosco': {
    name: 'Don Bosco Preparatory High School',
    shortName: 'Don Bosco Prep',
    logo: 'dbLogo.png',
    accentColor: '#74273d',
    mainColor: '#cfccce'
  },
  // Dwight Morrow High School - Dark Red and Black
  'dwight morrow': {
    name: 'Dwight Morrow High School',
    shortName: 'Dwight Morrow',
    logo: 'dmLogo.png',
    accentColor: '#7f1519', // Dark Red
    mainColor: '#231f20'    // Black
  },
  // Fair Lawn High School - Red and White
  'fair lawn': {
    name: 'Fair Lawn High School',
    shortName: 'Fair Lawn',
    logo: 'flLogo.png',
    accentColor: '#ffffff', // White
    mainColor: '#c20f2f'    // Red
  },
  // Fort Lee High School - Orange and Black
  'fort lee': {
    name: 'Fort Lee High School',
    shortName: 'Fort Lee',
    logo: 'fortleeLogo.png',
    accentColor: '#ff9700', // Orange
    mainColor: '#000000'    // Black
  },
  // Hackensack High School - Blue and Gold
  'hackensack': {
    name: 'Hackensack High School',
    shortName: 'Hackensack',
    logo: 'hackLogo.png',
    accentColor: '#e79816', // Gold
    mainColor: '#00114d'    // Blue
  },
  // Holy Angels - Blue and White (same as IHA)
  'holy angels': {
    name: 'Academy of the Holy Angels',
    shortName: 'Holy Angels',
    logo: 'ihaLogo.png',
    accentColor: '#003087', // Blue
    mainColor: '#FFFFFF'    // White
  },
  // Immaculate Heart Academy - Blue and White
  'immaculate heart academy': {
    name: 'Immaculate Heart Academy',
    shortName: 'Immaculate Heart',
    logo: 'ihaLogo.png',
    accentColor: '#ffffff', // White
    mainColor: '#1371b9'    // Blue
  },
  'iha': {
    name: 'Immaculate Heart Academy',
    shortName: 'Immaculate Heart',
    logo: 'ihaLogo.png',
    accentColor: '#ffffff', // White
    mainColor: '#1371b9'    // Blue
  },
  // Indian Hills High School - Blue and Gold
  'indian hills': {
    name: 'Indian Hills High School',
    shortName: 'Indian Hills',
    logo: 'ihLogo.png',
    accentColor: '#c49919', // Gold
    mainColor: '#01004c'    // Blue
  },
  'ih': {
    name: 'Indian Hills High School',
    shortName: 'Indian Hills',
    logo: 'ihLogo.png',
    accentColor: '#c49919', // Gold
    mainColor: '#01004c'    // Blue
  },
  // Lakeland Regional High School - Red and Grey
  'lakeland': {
    name: 'Lakeland Regional High School',
    shortName: 'Lakeland',
    logo: 'llLogo.png',
    accentColor: '#fefafd', //Grey
    mainColor: '#bf1d2f'    // Red
  },
  // Mahwah High School - Light Blue and Grey
  'mahwah': {
    name: 'Mahwah High School',
    shortName: 'Mahwah',
    logo: 'mahLogo.png',
    accentColor: '#7ebfe9', // Light Blue
    mainColor: '#c7cbce'    // Grey
  },
  // Northern Highlands Regional High School - Red and Black
  'northern highlands': {
    name: 'Northern Highlands Regional High School',
    shortName: 'Northern Highlands',
    logo: 'nhLogo.png',
    accentColor: '#e51f25', // Red
    mainColor: '#000000'    // Black
  },
  // Old Tappan (Northern Valley Regional at Old Tappan) - Gold and Blue
  'old tappan': {
    name: 'Northern Valley Regional High School at Old Tappan',
    shortName: 'Old Tappan',
    logo: 'nvotLogo.png',
    accentColor: '#c8b868', // Gold
    mainColor: '#434b73'    // Blue
  },
  // Paramus Catholic High School - Gold and Black
  'paramus catholic': {
    name: 'Paramus Catholic High School',
    shortName: 'Paramus Catholic',
    logo: 'pcLogo.png',
    accentColor: '#c4b359', // Gold
    mainColor: '#000000'    // Black
  },
  // Paramus High School - Blue and Grey
  'paramus': {
    name: 'Paramus High School',
    shortName: 'Paramus',
    logo: 'paramusLogo.png',
    accentColor: '#22345f', // Blue
    mainColor: '#979799'    // Grey
  },
  // Pascack Hills High School - Orange and Brown (unchanged)
  'pascack hills': {
    name: 'Pascack Hills High School',
    shortName: 'Pascack Hills',
    logo: 'phLogo.png',
    accentColor: '#f26531', // Orange
    mainColor: '#663415'    // Brown
  },
  'ph': {
    name: 'Pascack Hills High School',
    shortName: 'Pascack Hills',
    logo: 'phLogo.png',
    accentColor: '#f26531', // Orange
    mainColor: '#663415'    // Brown
  },
  // Pascack Valley High School - Green and White
  'pascack valley': {
    name: 'Pascack Valley High School',
    shortName: 'Pascack Valley',
    logo: 'pvLogo.png',
    accentColor: '#388640', // Green
    mainColor: '#FFFFFF'    // White
  },
  'pv': {
    name: 'Pascack Valley High School',
    shortName: 'Pascack Valley',
    logo: 'pvLogo.png',
    accentColor: '#388640', // Green
    mainColor: '#FFFFFF'
  },
  // Passaic County Technical Institute - Blue and Black
  'passaic county technical institute': {
    name: 'Passaic County Technical Institute',
    shortName: 'PCTI',
    logo: 'pctiLogo.png',
    accentColor: '#194791', // Blue
    mainColor: '#000000'    // Black
  },
  'pcti': {
    name: 'Passaic County Technical Institute',
    shortName: 'PCTI',
    logo: 'pctiLogo.png',
    accentColor: '#194791', // Blue
    mainColor: '#000000'
  },
  // Passaic High School - Red and Blue
  'passaic': {
    name: 'Passaic High School',
    shortName: 'Passaic',
    logo: 'passaicLogo.png',
    accentColor: '#cf1f3c', // Red
    mainColor: '#28348a'    // Blue
  },
  // Passaic Valley High School - Green and White
  'passaic valley': {
    name: 'Passaic Valley High School',
    shortName: 'Passaic Valley',
    logo: 'passaicvalLogo.png',
    accentColor: '#2b4829', // Green
    mainColor: '#FFFFFF'    // White
  },
  // Paterson Eastside High School - Orange and Blue
  'paterson eastside': {
    name: 'Paterson Eastside High School',
    shortName: 'Paterson Eastside',
    logo: 'pateastLogo.png',
    accentColor: '#FF6600', // Orange
    mainColor: '#11288b'    // Blue
  },
  // Paterson Kennedy High School - Red and Black
  'paterson kennedy': {
    name: 'John F. Kennedy High School (Paterson)',
    shortName: 'Paterson Kennedy',
    logo: 'patkennLogo.png',
    accentColor: '#eb0505', // Red
    mainColor: '#020202'    // Black
  },
  // Ramapo High School - Green and Black
  'ramapo': {
    name: 'Ramapo High School',
    shortName: 'Ramapo',
    logo: 'ramapoLogo.png',
    accentColor: '#115231', // Green
    mainColor: '#000000'    // Black
  },
  // Ramsey High School - Yellow and Blue
  'ramsey': {
    name: 'Ramsey High School',
    shortName: 'Ramsey',
    logo: 'ramLogo.png',
    accentColor: '#e8be1d', // Yellow
    mainColor: '#000034'    // Blue
  },
  // Ridgefield Park High School - Red and White
  'ridgefield park': {
    name: 'Ridgefield Park High School',
    shortName: 'Ridgefield Park',
    logo: 'rpLogo.png',
    accentColor: '#ea2435', // Red
    mainColor: '#FFFFFF'    // White
  },
  // Ridgewood High School - Black and Red
  'ridgewood': {
    name: 'Ridgewood High School',
    shortName: 'Ridgewood',
    logo: 'ridgeLogo.png',
    accentColor: '#000000', // Black
    mainColor: '#800000'    // Red
  },
  // River Dell Regional High School - Yellow and Black
  'river dell': {
    name: 'River Dell Regional High School',
    shortName: 'River Dell',
    logo: 'rdLogo.png',
    accentColor: '#FFD700', // Yellow
    mainColor: '#000000'    // Black
  },
  'rd': {
    name: 'River Dell Regional High School',
    shortName: 'River Dell',
    logo: 'rdLogo.png',
    accentColor: '#f9cf06',
    mainColor: '#000000'
  },
  // St. Joseph Regional High School - Green and Gold
  'st. joseph': {
    name: 'St. Joseph Regional High School',
    shortName: 'St. Joseph',
    logo: 'sjLogo.png',
    accentColor: '#f4cc00', // Gold
    mainColor: '#005f23'    // Green
  },
  'st joseph': {
    name: 'St. Joseph Regional High School',
    shortName: 'St. Joseph',
    logo: 'sjLogo.png',
    accentColor: '#f4cc00',
    mainColor: '#005f23'
  },
  'sj': {
    name: 'St. Joseph Regional High School',
    shortName: 'St. Joseph',
    logo: 'sjLogo.png',
    accentColor: '#f4cc00',
    mainColor: '#005f23'
  },
  // Teaneck High School - Blue and Black
  'teaneck': {
    name: 'Teaneck High School',
    shortName: 'Teaneck',
    logo: 'teaneckLogo.png',
    accentColor: '#0004b3', // Blue
    mainColor: '#000000'    // Black
  },
  // Tenafly High School - Orange and White
  'tenafly': {
    name: 'Tenafly High School',
    shortName: 'Tenafly',
    logo: 'tenLogo.png',
    accentColor: '#ffffff', // White
    mainColor: '#f7931e'    // Orange
  },
  // Wayne Hills High School - Maroon and Black
  'wayne hills': {
    name: 'Wayne Hills High School',
    shortName: 'Wayne Hills',
    logo: 'whLogo.png',
    accentColor: '#6d1d0e', // Maroon
    mainColor: '#000000'    // Black
  },
  // Wayne Valley High School - Blue and Silver
  'wayne valley': {
    name: 'Wayne Valley High School',
    shortName: 'Wayne Valley',
    logo: 'wvLogo.png',
    accentColor: '#ffffff', // White
    mainColor: '#5b86c3'    // Blue
  },
  // West Milford High School - Yellow and Black
  'west milford': {
    name: 'West Milford High School',
    shortName: 'West Milford',
    logo: 'wmLogo.png',
    accentColor: '#f0b241', // Yellow
    mainColor: '#000000'    // Black
  },
  // Westwood Regional High School - Cardinal Red and Yellow
  'westwood': {
    name: 'Westwood Regional High School',
    shortName: 'Westwood',
    logo: 'wwLogo.png',
    accentColor: '#ffb522', // Yellow 
    mainColor: '#890014'    // Red
  }
};

// List of all schools for dropdowns (sorted alphabetically by name)
const SCHOOLS_LIST = [
  { value: 'Bergen Catholic', name: 'Bergen Catholic High School' },
  { value: 'Bergen Tech', name: 'Bergen County Technical High School' },
  { value: 'Bergenfield', name: 'Bergenfield High School' },
  { value: 'Cliffside Park', name: 'Cliffside Park High School' },
  { value: 'Clifton', name: 'Clifton High School' },
  { value: 'Demarest', name: 'Northern Valley at Demarest' },
  { value: 'DePaul Catholic', name: 'DePaul Catholic High School' },
  { value: 'Don Bosco Prep', name: 'Don Bosco Preparatory High School' },
  { value: 'Dumont', name: 'Dumont High School' },
  { value: 'Dwight Morrow', name: 'Dwight Morrow High School' },
  { value: 'Fair Lawn', name: 'Fair Lawn High School' },
  { value: 'Fort Lee', name: 'Fort Lee High School' },
  { value: 'Hackensack', name: 'Hackensack High School' },
  { value: 'Holy Angels', name: 'Academy of the Holy Angels' },
  { value: 'Immaculate Heart Academy', name: 'Immaculate Heart Academy' },
  { value: 'Indian Hills', name: 'Indian Hills High School' },
  { value: 'Lakeland', name: 'Lakeland Regional High School' },
  { value: 'Mahwah', name: 'Mahwah High School' },
  { value: 'Northern Highlands', name: 'Northern Highlands Regional High School' },
  { value: 'Old Tappan', name: 'Northern Valley at Old Tappan' },
  { value: 'Paramus Catholic', name: 'Paramus Catholic High School' },
  { value: 'Paramus', name: 'Paramus High School' },
  { value: 'Pascack Hills', name: 'Pascack Hills High School' },
  { value: 'Pascack Valley', name: 'Pascack Valley High School' },
  { value: 'Passaic County Technical Institute', name: 'Passaic County Technical Institute (PCTI)' },
  { value: 'Passaic', name: 'Passaic High School' },
  { value: 'Passaic Valley', name: 'Passaic Valley High School' },
  { value: 'Paterson Eastside', name: 'Paterson Eastside High School' },
  { value: 'Paterson Kennedy', name: 'John F. Kennedy High School (Paterson)' },
  { value: 'Ramapo', name: 'Ramapo High School' },
  { value: 'Ramsey', name: 'Ramsey High School' },
  { value: 'Ridgefield Park', name: 'Ridgefield Park High School' },
  { value: 'Ridgewood', name: 'Ridgewood High School' },
  { value: 'River Dell', name: 'River Dell Regional High School' },
  { value: 'St. Joseph', name: 'St. Joseph Regional High School' },
  { value: 'Teaneck', name: 'Teaneck High School' },
  { value: 'Tenafly', name: 'Tenafly High School' },
  { value: 'Wayne Hills', name: 'Wayne Hills High School' },
  { value: 'Wayne Valley', name: 'Wayne Valley High School' },
  { value: 'West Milford', name: 'West Milford High School' },
  { value: 'Westwood', name: 'Westwood Regional High School' }
];

/**
 * Get team configuration by name (case-insensitive partial match)
 * @param {string} teamName - The team name to look up
 * @returns {Object|null} - The team configuration or null if not found
 */
function getTeamConfig(teamName) {
  if (!teamName) return null;
  const normalized = teamName.toLowerCase().trim();

  // Try exact match first
  if (TEAMS_CONFIG[normalized]) {
    return TEAMS_CONFIG[normalized];
  }

  // Try partial match
  for (const [key, config] of Object.entries(TEAMS_CONFIG)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return config;
    }
  }

  return null;
}

/**
 * Get the logo path for a team
 * @param {string} teamName - The team name
 * @param {string} basePath - The base path to the logos folder (default for relative paths)
 * @returns {string|null} - The logo path or null if not found
 */
function getTeamLogo(teamName, basePath = '../../assets/images/Team Logos/') {
  const config = getTeamConfig(teamName);
  if (config && config.logo) {
    return basePath + config.logo;
  }
  return null;
}

/**
 * Get the colors for a team
 * @param {string} teamName - The team name
 * @returns {Object|null} - Object with accentColor and mainColor, or null if not found
 */
function getTeamColors(teamName) {
  const config = getTeamConfig(teamName);
  if (config) {
    return {
      accentColor: config.accentColor,
      mainColor: config.mainColor
    };
  }
  return null;
}

/**
 * Get all available logos for the settings page
 * @returns {Array} - Array of logo objects with file, name, accentColor, mainColor
 */
function getAvailableLogos() {
  // Create unique list based on logo files (to avoid duplicates from aliases)
  const seenLogos = new Set();
  const logos = [];

  for (const config of Object.values(TEAMS_CONFIG)) {
    if (!seenLogos.has(config.logo)) {
      seenLogos.add(config.logo);
      logos.push({
        file: config.logo,
        name: config.shortName,
        accentColor: config.accentColor,
        mainColor: config.mainColor
      });
    }
  }

  // Sort alphabetically by name
  return logos.sort((a, b) => a.name.localeCompare(b.name));
}

// Legacy support: Create teamLogos object for backward compatibility
const teamLogos = {};
for (const [key, config] of Object.entries(TEAMS_CONFIG)) {
  teamLogos[key] = config.logo;
}


// Export for module usage if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TEAMS_CONFIG,
    SCHOOLS_LIST,
    getTeamConfig,
    getTeamLogo,
    getTeamColors,
    getAvailableLogos,
    teamLogos
  };
}

// Expose to window for browser usage
if (typeof window !== 'undefined') {
  window.getTeamLogo = getTeamLogo;
  window.getTeamConfig = getTeamConfig;
  window.getTeamColors = getTeamColors;
}
