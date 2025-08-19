// League Home Color Palette (simplified)
export const leagueColors = {
  primary: {
    mauve: '#9CA3AF',      // Simple gray
    sand: '#D1D5DB',       // Light gray
    mint: '#10B981',       // Simple green
    sky: '#3B82F6',        // Simple blue
    crimson: '#EF4444',    // Simple red
    highlight: '#EF4444'
  },
  accent: {
    pink: '#EC4899',       // Simple pink
    blue: '#3B82F6',       // Simple blue
    green: '#10B981'       // Simple green
  },
  background: {
    main: '#FFFFFF',       // White
    secondary: '#F3F4F6',  // Light gray
    tertiary: '#E5E7EB',   // Gray
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: 'rgba(0, 0, 0, 0.05)'
  },
  text: {
    primary: '#111827',    // Dark gray
    secondary: '#4B5563',  // Medium gray
    muted: '#9CA3AF',      // Muted gray
    inverse: '#FFFFFF'
  },
  border: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)'
  },
  success: {
    light: '#D1FAE5',  // Light green
    main: '#10B981'    // Green
  },
  interactive: {
    hover: 'rgba(0, 0, 0, 0.05)',
    active: 'rgba(0, 0, 0, 0.1)',
    focus: '#3B82F6'
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
