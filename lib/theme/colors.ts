// League Home Color Palette
export const leagueColors = {
  // Main background colors from the palette
  primary: {
    light: '#C8B8B8',    // Light mauve/grey
    medium: '#D5D5C5',   // Light beige
    accent: '#D4E5D5',   // Pale mint green
    soft: '#C5D5DD',     // Soft blue-grey
    highlight: '#D63638' // Red accent
  },
  
  // Derived colors for UI elements
  background: {
    main: '#C8B8B8',
    secondary: '#D5D5C5',
    tertiary: '#D4E5D5',
    overlay: 'rgba(200, 184, 184, 0.95)',
    card: 'rgba(213, 213, 197, 0.4)'
  },
  
  text: {
    primary: '#2C2C2C',
    secondary: '#4A4A4A',
    muted: '#6B6B6B',
    inverse: '#FFFFFF'
  },
  
  border: {
    light: 'rgba(44, 44, 44, 0.1)',
    medium: 'rgba(44, 44, 44, 0.2)',
    dark: 'rgba(44, 44, 44, 0.3)'
  },
  
  interactive: {
    hover: 'rgba(214, 54, 56, 0.1)',
    active: 'rgba(214, 54, 56, 0.2)',
    focus: '#D63638'
  }
};

// Draft interface colors
export const draftColors = {
  background: {
    main: '#F5F5F5',
    sidebar: '#FFFFFF',
    header: '#2C2C2C'
  },
  
  positions: {
    QB: '#E74C3C',
    RB: '#3498DB',
    WR: '#2ECC71',
    TE: '#F39C12',
    K: '#9B59B6',
    DEF: '#34495E'
  },
  
  status: {
    available: '#27AE60',
    drafted: '#95A5A6',
    myPick: '#E74C3C',
    onClock: '#F39C12'
  }
};
