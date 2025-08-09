"use client";
import type { Variants } from 'framer-motion';
import gsap from 'gsap';
import Lenis from 'lenis';

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const stagger: Variants = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export function revealOnScroll(selector: string, options: gsap.TweenVars = {}): void {
  if (typeof window === 'undefined') return;
  const targets = document.querySelectorAll<HTMLElement>(selector);
  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', ...options }
    );
  });
}

export function initLenis() {
  if (typeof window === 'undefined') return;
  const lenis = new Lenis({
    smoothWheel: true
  });
  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return lenis;
}
