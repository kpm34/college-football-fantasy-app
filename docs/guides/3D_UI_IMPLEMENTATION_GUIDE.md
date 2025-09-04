## 3D UI Implementation Guide (Spline/Three.js/Anime.js)

### Purpose

A practical, copy-pasteable reference for adding tasteful 3D aesthetics and motion to our UI without breaking functionality or performance. Focus on: light surfaces, dark text, darker primary buttons, subtle depth, ESPN-quality mobile UX.

---

### Feature Catalog

1. 3D Buttons (press/hover microinteractions)

- Examples: Spline button components; Awwwards gallery microinteractions
- What it is: Slight depth, tilt on hover, bounce on press, strong focus ring
- How to implement
  - CSS: use `ui-button-3d` (done), add hover lift and active press
  - Optional Anime.js (lazy-loaded): on mousedown/up apply spring scale 0.98 → 1.00, easing `spring(1, 80, 10, 0)`
  - Accessibility: preserve focus outline, respect prefers-reduced-motion

2. Elevated Panels/Cards (3D surfaces)

- Examples: tinyPod product panels; Peter Tarka layered tiles
- What it is: Dual-shadow + faint inset highlight for perceived depth
- How to implement
  - CSS: use `ui-panel-3d` on containers; keep borders thin; text uses `--ui-ink`
  - Keep content static; no extra JS

3. Tiles/Cells with Pop-in Fill

- Examples: Scoreboards/draft boards with animated fills
- What it is: When a cell becomes “filled”, animate a quick scale/opacity pop and a specular sweep
- How to implement
  - CSS: apply `ui-tile-3d` baseline
  - On state change (e.g., newly drafted), add transient class `.pop-in` (keyframes: scale 0.96→1, opacity 0→1, 140ms)
  - Optional Anime.js: timeline for pop + sweep

4. Timer Alert Micro-Animation

- Examples: ESPN countdown urgency; subtle pulse under 10s
- What it is: Heartbeat scale + color emphasis under threshold
- How to implement
  - Add `critical` state → CSS keyframe `pulse` (scale 1.0↔1.04, 900ms)
  - Respect reduced-motion; no layout shift; keep font legible

5. Recent Picks Ticker (slide/fade)

- Examples: sports tickers, Framer case studies
- What it is: Newly added item slides in from the right with light fade
- How to implement
  - On insert, apply `.slide-in-right` (translateX 12px → 0, opacity 0→1, 160ms)
  - Optional stagger when multiple items add at once (Anime.js `stagger(40)`)

6. Parallax Ambient Layer (header)

- Examples: Spline hero backplates; Awwwards parallax
- What it is: Very subtle gradient or particles moving on scroll/tilt
- How to implement
  - CSS-only gradient layer behind sticky header; translateY on scroll via `position: sticky` + transform
  - Optional: Spline embed as non-interactive background; cap FPS; static fallback

7. Bottom Sheet (mobile player details)

- Examples: ESPN mobile modals; modern finance apps
- What it is: Tap row → bottom sheet with big CTA and key stats
- How to implement
  - Use existing modal; add `animate-slide-up` class; large touch targets (≥44px)
  - Avoid blocking the timer; keep an always-visible header timer

---

### Tools & When to Use

- Anime.js (microinteractions)
  - Best for: button press, list stagger, in/out transitions
  - Pros: tiny, simple timelines; Cons: still extra JS → lazy-load
- Spline (3D asset embeds)
  - Best for: hero accents and ambient backgrounds
  - Pros: design-first, quick wins; Cons: runtime cost → pause when hidden, static fallback
- React Three Fiber / Three.js (custom 3D)
  - Best for: bespoke widgets; avoid in core draft flow
  - Pros: full control; Cons: largest complexity/perf budget
- GSAP/ScrollTrigger (optional)
  - Best for: scroll-linked hero visuals; avoid in draft room

Decision matrix

- Micro UI motion → Anime.js or CSS keyframes
- Decorative accent → Spline (gated, paused, fallback)
- Interactive 3D widget → R3F/Three.js (separate route or lazy chunk)

---

### Implementation Recipes (copy-paste)

Button press bounce (Anime.js)

```ts
import('animejs').then(({ default: anime }) => {
  const press = (el: HTMLElement) =>
    anime({
      targets: el,
      scale: [0.98, 1],
      duration: 180,
      easing: 'easeOutQuad',
    })
  // usage: onMouseDown -> scale 0.98; onMouseUp -> press(el)
})
```

Recent pick slide-in (CSS)

```css
.slide-in-right {
  animation: slide-in-right 160ms ease-out;
}
@keyframes slide-in-right {
  from {
    transform: translateX(12px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

Cell pop-in (CSS)

```css
.pop-in {
  animation: pop-in 140ms ease-out;
}
@keyframes pop-in {
  from {
    transform: scale(0.96);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

Timer pulse (CSS)

```css
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}
.timer-critical {
  animation: pulse 900ms ease-in-out infinite;
}
```

Spline embed checklist

- Use Spline viewer/iframe with `loading="lazy"`
- `pointer-events: none` when purely decorative
- Pause/unmount on visibility change (`IntersectionObserver`)
- Provide `<picture>` PNG/SVG fallback for low-power devices

---

### Performance & Accessibility Checklist

- Respect `prefers-reduced-motion` (disable non-essential animations)
- Lazy-load animation libs; tree-shake imports
- Keep added JS per route < 30KB
- Avoid layout shift; animate transforms/opacity
- Maintain AA contrast; large touch targets; keyboard focus visible
- No scroll hijacking in the draft room

---

### Rollout Strategy

- Gate with feature flags: `draftUiV2`, `draftUiV2_animations`
- Canary to internal users; monitor Sentry, Core Web Vitals, Appwrite Realtime throughput
- Provide toggle in admin to disable animations if needed

---

### References (curated)

- Anime.js docs: `https://animejs.com/documentation/`
- Spline: `https://spline.design/`
- Awwwards 3D inspiration: `https://www.awwwards.com/`
- Three.js Journey: `https://threejs-journey.com/`
- Case studies: tinyPod, Peter Tarka, Clou Architects, Noomo Labs (3D sites)
