// League Home Color Palette (updated from new swatches)
export const leagueColors = {
  primary: {
    mauve: '#C8A2A8',      // Soft mauve/dusty rose
    sand: '#D4C4B8',       // Warm sand/beige
    mint: '#C8DDD4',       // Soft mint green
    sky: '#B8D4DC',        // Light sky blue
    crimson: '#DC143C',    // Bright crimson red
    highlight: '#DC143C'
  },
  accent: {
    pink: '#C8A2A8',       // Using mauve as accent pink
    blue: '#B8D4DC',       // Sky blue for accents
    green: '#C8DDD4'       // Mint for success states
  },
  background: {
    main: '#F5F0EB',       // Light warm background
    secondary: '#D4C4B8',  // Sand color for sections
    tertiary: '#C8DDD4',   // Mint for alternate sections
    overlay: 'rgba(212, 196, 184, 0.9)',
    card: 'rgba(200, 162, 168, 0.15)'
  },
  text: {
    primary: '#2C2428',    // Dark charcoal
    secondary: '#5A4A52',  // Medium gray-brown
    muted: '#8A7A82',      // Muted gray-purple
    inverse: '#FFFFFF'
  },
  border: {
    light: 'rgba(200, 162, 168, 0.2)',
    medium: 'rgba(200, 162, 168, 0.35)',
    dark: 'rgba(200, 162, 168, 0.5)'
  },
  interactive: {
    hover: 'rgba(220, 20, 60, 0.15)',
    active: 'rgba(220, 20, 60, 0.25)',
    focus: '#DC143C'
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
