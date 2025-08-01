// Spline Scene URLs for College Football Fantasy App
// Replace these with your actual Spline scene URLs

export const SPLINE_SCENES = {
  // Hero section - Football stadium/field
  STADIUM: '', // Empty string to prevent 404 errors
  
  // Conference logos for the showcase section
  CONFERENCE_LOGOS: '', // Empty string to prevent 404 errors
  
  // Future scenes (replace with actual URLs when created)
  FOOTBALL_FIELD: '', // Empty string to prevent 404 errors
  TROPHY: '', // Empty string to prevent 404 errors
  DRAFT_BOARD: '', // Empty string to prevent 404 errors
  TEAM_LOGOS: '', // Empty string to prevent 404 errors
} as const;

// Conference configuration for 3D scenes
export const CONFERENCES = {
  SEC: {
    name: 'SEC',
    color: 'bg-red-600',
    objectName: 'SEC', // Name of the object in Spline scene
  },
  BIG_TEN: {
    name: 'Big Ten',
    color: 'bg-blue-600',
    objectName: 'BigTen',
  },
  ACC: {
    name: 'ACC',
    color: 'bg-orange-600',
    objectName: 'ACC',
  },
  BIG_12: {
    name: 'Big 12',
    color: 'bg-purple-600',
    objectName: 'Big12',
  },
} as const;

// Animation settings
export const ANIMATION_CONFIG = {
  ROTATION_SPEED: 0.01,
  ANIMATION_INTERVAL: 16, // 60fps
  HOVER_SCALE: 1.2,
  CLICK_SCALE: 1.1,
} as const; 