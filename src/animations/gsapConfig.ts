import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  // Default ease for luxury editorial feel
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.9,
  });
}

export { gsap, ScrollTrigger };
