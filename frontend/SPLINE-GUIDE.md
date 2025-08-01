# Spline Integration Guide for College Football Fantasy App

## 🎨 Spline Scene Ideas

### 1. **Hero Stadium Scene**
- 3D football stadium with animated crowd
- Floating team logos
- Dynamic lighting (day/night games)
- Camera fly-through animation

### 2. **Draft Room**
- 3D draft board with player cards
- Animated timer countdown
- Team logos floating when selected
- Confetti animation on draft pick

### 3. **Trophy Room**
- 3D trophies for league winners
- Animated pedestals
- Particle effects for achievements
- Interactive trophy inspection

### 4. **Live Game Tracker**
- 3D football field
- Player positions in real-time
- Touchdown animations
- Score display with particle effects

## 🛠️ How to Create & Export from Spline

1. **Create Your Scene** at https://app.spline.design
2. **Export Options**:
   - Click "Export" → "Code"
   - Choose "React Component"
   - Copy the scene URL

3. **Add to Your App**:
```tsx
<SplineScene 
  sceneUrl="https://prod.spline.design/YOUR-SCENE-ID/scene.splinecode"
  className="w-full h-[600px]"
/>
```

## 📦 Optimization Tips

### 1. **Keep Scenes Lightweight**
- Use low-poly models
- Optimize textures (max 1024x1024)
- Limit particle effects

### 2. **Loading States**
```tsx
<Suspense fallback={<LoadingSpinner />}>
  <SplineScene sceneUrl={url} />
</Suspense>
```

### 3. **Mobile Performance**
- Create simplified mobile versions
- Use `loading="lazy"` for below-fold scenes
- Consider static fallbacks for low-end devices

## 🎯 Specific Implementations

### Conference Logo Carousel
```tsx
// Create a Spline scene with 4 floating logos
const ConferenceShowcase = () => {
  const handleLoad = (spline: Application) => {
    // Rotate logos continuously
    const logos = ['SEC', 'BigTen', 'ACC', 'Big12'];
    logos.forEach(name => {
      const logo = spline.findObjectByName(name);
      if (logo) {
        // Add rotation animation
        setInterval(() => {
          logo.rotation.y += 0.01;
        }, 16);
      }
    });
  };

  return (
    <SplineScene 
      sceneUrl={SplineScenes.TEAM_LOGOS}
      onLoad={handleLoad}
    />
  );
};
```

### Interactive Draft Board
```tsx
const DraftBoard = () => {
  const handleLoad = (spline: Application) => {
    // Make player cards clickable
    const handlePick = (e: any) => {
      const obj = e.target;
      if (obj.name.startsWith('player-')) {
        // Animate selection
        obj.scale.set(1.2, 1.2, 1.2);
        // Trigger draft pick
        console.log('Drafted:', obj.name);
      }
    };
    
    spline.addEventListener('mouseDown', handlePick);
  };

  return <SplineScene sceneUrl={SplineScenes.DRAFT_BOARD} onLoad={handleLoad} />;
};
```

## 🔗 Connecting to Backend

### Live Score Updates
```tsx
useEffect(() => {
  // Subscribe to live scores
  const socket = new WebSocket('ws://localhost:3000/live');
  
  socket.onmessage = (event) => {
    const { homeScore, awayScore } = JSON.parse(event.data);
    
    // Update Spline scene
    if (splineRef.current) {
      const homeText = splineRef.current.findObjectByName('HomeScore');
      const awayText = splineRef.current.findObjectByName('AwayScore');
      
      if (homeText) homeText.text = homeScore.toString();
      if (awayText) awayText.text = awayScore.toString();
    }
  };
}, []);
```

## 🚀 Next Steps

1. **Create Your First Scene**
   - Start with a simple 3D football or team logo
   - Export and test in the app

2. **Build the Hero Scene**
   - Stadium or field visualization
   - Add to homepage

3. **Interactive Elements**
   - Draft board with clickable cards
   - Live game field with player positions

4. **Performance Testing**
   - Test on mobile devices
   - Optimize based on load times