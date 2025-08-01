# 🏈 Spline Football Scene Creation Guide

## Creating a Football-Shaped Scene in Spline

### Step 1: Create the Football Shape

1. **Open Spline** and create a new scene
2. **Add a Sphere** as the base shape
3. **Transform to Football Shape:**
   - Scale: X: 1.8, Y: 1.0, Z: 0.6 (creates oval shape)
   - Rotation: X: -15°, Y: 0°, Z: 0° (football angle)
   - Position: X: 0, Y: 0, Z: 0

### Step 2: Add Football Laces

1. **Create Lace Strips:**
   - Add 4-5 thin rectangular shapes
   - Position them along the center of the football
   - Scale: X: 0.8, Y: 0.02, Z: 0.02
   - Color: White (#FFFFFF)

2. **Arrange Laces:**
   - Space them evenly along the football
   - Rotate slightly to follow the football curve

### Step 3: Add Chrome Material

1. **Apply Chrome Material:**
   - Select the football sphere
   - Add a new material
   - Type: Metallic
   - Color: Silver/Gray (#C0C0C0)
   - Roughness: 0.1
   - Metalness: 1.0

2. **Add Shine Effect:**
   - Add a Fresnel layer
   - Color: White (#FFFFFF)
   - Intensity: 0.3

### Step 4: Create Stadium Elements

1. **Add Stadium Base:**
   - Create a large plane for the field
   - Scale: X: 10, Y: 1, Z: 8
   - Material: Green (#228B22) for grass

2. **Add Stadium Seats:**
   - Create curved shapes for seating
   - Position around the field
   - Color: Gray (#808080)

3. **Add Stadium Lights:**
   - Create point lights
   - Position above the stadium
   - Color: Warm white (#FFE4B5)

### Step 5: Add Animation

1. **Football Rotation:**
   - Select the football
   - Add rotation animation
   - Duration: 4 seconds
   - Easing: Ease-in-out
   - Loop: Yes

2. **Stadium Float:**
   - Select stadium elements
   - Add subtle up/down movement
   - Duration: 6 seconds
   - Easing: Ease-in-out

### Step 6: Export and Get URL

1. **Export as Code:**
   - Click Export → Code
   - Choose "Vanilla JS"
   - Wait for URL generation

2. **Copy the URL:**
   - Copy the generated URL
   - Replace in `frontend/lib/spline-constants.ts`

### Step 7: Update Your App

Replace the scene URL in your app:

```typescript
// In frontend/lib/spline-constants.ts
export const SPLINE_SCENES = {
  HERO_SCENE: 'YOUR_NEW_FOOTBALL_SCENE_URL',
  // ... other scenes
};
```

## 🎯 Scene Specifications

### Football Dimensions:
- **Width:** 200px (1.8x scale)
- **Height:** 120px (1.0x scale) 
- **Depth:** 80px (0.6x scale)
- **Rotation:** X: -15°, Y: 0°, Z: 0°

### Stadium Elements:
- **Field:** 800x600px green surface
- **Seats:** Gray curved seating areas
- **Lights:** Warm white point lights
- **Position:** Behind football (Z: -200)

### Materials:
- **Football:** Chrome metallic with shine
- **Field:** Green grass texture
- **Seats:** Gray matte material
- **Lights:** Warm white glow

## 🚀 Tips for Best Results

1. **Use proper lighting** for chrome materials
2. **Add subtle animations** for realism
3. **Optimize polygon count** for performance
4. **Test on different devices** for compatibility
5. **Use proper scaling** for web display

## 📱 Integration Notes

- The scene will load with opacity 30% in the background
- Football will rotate continuously
- Stadium elements will float gently
- All animations are smooth and performant 