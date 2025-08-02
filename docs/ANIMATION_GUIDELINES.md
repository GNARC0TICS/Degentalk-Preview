# Animation Library Guidelines

## Overview
DegenTalk uses a **hybrid animation approach** combining Framer Motion and GSAP for optimal performance and developer experience.

## When to Use Each Library

### 🎭 Framer Motion
Best for **declarative, React-integrated animations**

#### Use Cases:
1. **AnimatePresence** - Exit animations, component transitions
   ```tsx
   <AnimatePresence mode="wait">
     <motion.div key={id} exit={{ opacity: 0 }} />
   </AnimatePresence>
   ```

2. **Auto-height animations** - FAQ accordions, expanding content
   ```tsx
   <motion.div animate={{ height: isOpen ? "auto" : 0 }} />
   ```

3. **Complex state orchestration** - Multi-step animations
   ```tsx
   const variants = {
     hidden: { opacity: 0, y: 20 },
     visible: { opacity: 1, y: 0 }
   };
   ```

4. **Layout animations** - Smooth position/size changes
   ```tsx
   <motion.div layout layoutId="shared-element" />
   ```

5. **Gesture animations** - Drag, pan, hover with spring physics
   ```tsx
   <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} />
   ```

### 🚀 GSAP
Best for **performance-critical and complex timeline animations**

#### Use Cases:
1. **Scroll-triggered animations** - Parallax, reveal effects
   ```tsx
   useEffect(() => {
     gsap.to(element, {
       scrollTrigger: { trigger: element, start: "top 80%" },
       opacity: 1, y: 0
     });
   }, []);
   ```

2. **Text animations** - Underlines, typewriter, morphing
   ```tsx
   gsap.to(".underline", { 
     scaleX: 1, 
     transformOrigin: "left center",
     duration: 0.3 
   });
   ```

3. **Performance-critical animations** - Many elements, complex paths
   ```tsx
   gsap.timeline()
     .to(".cards", { opacity: 1, stagger: 0.1 })
     .to(".hero-text", { y: 0 }, "-=0.5");
   ```

4. **Canvas/WebGL animations** - Advanced visual effects

5. **BannerCard optimizations** - Already implemented with intersection observer

### 🎨 CSS Animations
Best for **simple, always-running animations**

#### Use Cases:
1. **Loading spinners**
   ```css
   .spinner { animation: spin 1s linear infinite; }
   ```

2. **Gradient shifts**
   ```css
   .gradient { animation: gradient-shift 3s ease infinite; }
   ```

3. **Simple hover states**
   ```css
   .button:hover { transform: translateY(-2px); }
   ```

## Decision Tree

```
Is it a React component state change?
├─ Yes → Does it need exit animations?
│   ├─ Yes → Framer Motion (AnimatePresence)
│   └─ No → Is it performance-critical?
│       ├─ Yes → GSAP
│       └─ No → Framer Motion (simpler API)
└─ No → Is it scroll-triggered?
    ├─ Yes → GSAP (ScrollTrigger)
    └─ No → Is it always running?
        ├─ Yes → CSS Animation
        └─ No → GSAP
```

## Performance Guidelines

1. **Avoid mixing** libraries on the same element
2. **Use CSS** for simple hover/focus states when possible
3. **Lazy load** animation libraries when feasible
4. **Batch animations** to reduce reflows
5. **Use `will-change`** sparingly and remove after animation

## Code Examples

### Framer Motion: Quote Rotation
```tsx
<AnimatePresence mode="wait">
  <motion.h1
    key={currentQuote}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5 }}
  >
    {quotes[currentQuote]}
  </motion.h1>
</AnimatePresence>
```

### GSAP: Scroll-triggered Section
```tsx
const sectionRef = useScrollAnimation('fadeInUp', { threshold: 0.2 });

return <section ref={sectionRef}>Content</section>;
```

### Hybrid: Complex Component
```tsx
// Framer Motion for state changes
<motion.div animate={{ opacity: isVisible ? 1 : 0 }}>
  {/* GSAP for text effect */}
  <h2 ref={textRef}>Title</h2>
</motion.div>

// In useEffect
gsap.to(textRef.current, { 
  backgroundPosition: "100% 0", 
  duration: 1 
});
```

## Migration Notes

- Keep existing Framer Motion animations that work well
- Only migrate to GSAP when there's a clear performance benefit
- Test animations on low-end devices
- Monitor bundle size impact

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [GSAP Docs](https://greensock.com/docs/)
- Internal: `/lib/animations.ts` for GSAP utilities
- Internal: `AnimatedWrapper` component for common patterns