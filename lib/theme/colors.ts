// League Home Color Palette (from user-provided swatches)
// Swatches approximated to hex: coral #DE6656, brown #6B4A35, taupe #B4A6A6,
// crimson #B41F24, ice #CBD9DB
export const leagueColors = {
  primary: {
    coral: '#DE6656',
    brown: '#6B4A35',
    taupe: '#B4A6A6',
    crimson: '#B41F24',
    ice: '#CBD9DB',
    highlight: '#DE6656'
  },
  background: {
    main: '#CBD9DB',     // ice
    secondary: '#B4A6A6',
    tertiary: '#6B4A35',
    overlay: 'rgba(203, 217, 219, 0.9)',
    card: 'rgba(180, 166, 166, 0.35)'
  },
  text: {
    primary: '#2B201B',
    secondary: '#4A3A31',
    muted: '#6C5951',
    inverse: '#FFFFFF'
  },
  border: {
    light: 'rgba(107, 74, 53, 0.2)',
    medium: 'rgba(107, 74, 53, 0.35)',
    dark: 'rgba(107, 74, 53, 0.5)'
  },
  interactive: {
    hover: 'rgba(222, 102, 86, 0.15)',
    active: 'rgba(222, 102, 86, 0.25)',
    focus: '#B41F24'
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
