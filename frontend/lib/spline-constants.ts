// Spline Scene URLs
export const SPLINE_SCENES = {
  // Current scene - will be replaced with football-shaped scene
  HERO_SCENE: 'https://prod.spline.design/JlsVpBPjLj-iOBRj/scene.splinecode',
  
  // New football-shaped scene (placeholder - you'll need to create this in Spline)
  FOOTBALL_STADIUM: 'https://prod.spline.design/FOOTBALL_STADIUM_URL/scene.splinecode',
  
  // Conference logos scene
  CONFERENCE_LOGOS: 'https://prod.spline.design/CONFERENCE_LOGOS_URL/scene.splinecode',
};

// Conference configurations for 3D scenes
export const CONFERENCES = {
  SEC: {
    name: 'SEC',
    color: '#FF0000',
    logo: '🏈',
    gradient: 'from-red-600 to-red-800',
  },
  'Big Ten': {
    name: 'Big Ten',
    color: '#0000FF',
    logo: '🏈',
    gradient: 'from-blue-600 to-blue-800',
  },
  ACC: {
    name: 'ACC',
    color: '#FF8C00',
    logo: '🏈',
    gradient: 'from-orange-600 to-orange-800',
  },
  'Big 12': {
    name: 'Big 12',
    color: '#800080',
    logo: '🏈',
    gradient: 'from-purple-600 to-purple-800',
  },
};

// Animation settings
export const ANIMATION_SETTINGS = {
  FOOTBALL_ROTATION: {
    duration: 4,
    easing: 'ease-in-out',
  },
  STADIUM_FLOAT: {
    duration: 6,
    easing: 'ease-in-out',
  },
  CONFERENCE_HOVER: {
    duration: 0.3,
    easing: 'ease-out',
  },
};

// Scene dimensions and positioning
export const SCENE_DIMENSIONS = {
  FOOTBALL: {
    width: 200,
    height: 120,
    depth: 80,
    rotation: { x: -15, y: 0, z: 0 },
  },
  STADIUM: {
    width: 800,
    height: 400,
    depth: 600,
    position: { x: 0, y: -100, z: -200 },
  },
}; 