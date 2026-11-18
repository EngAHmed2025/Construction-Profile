import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export default function SmoothScroll() {
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scroll: Lenis | undefined;
    const syncLock = () => {
      if (document.body.hasAttribute('data-scroll-locked')) scroll?.stop();
      else scroll?.start();
    };
    const configure = () => {
      scroll?.destroy();
      scroll = undefined;
      if (motion.matches) return;
      scroll = new Lenis({
        autoRaf: true,
        smoothWheel: true,
        syncTouch: false,
        lerp: 0.13,
        allowNestedScroll: true,
        anchors: { offset: -84 },
        prevent: (node) => Boolean(node.closest('[role="dialog"], [role="alertdialog"], gmp-map-3d, .projects-map')),
      });
      syncLock();
    };
    configure();
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-scroll-locked'] });
    motion.addEventListener('change', configure);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', configure);
      scroll?.destroy();
    };
  }, []);
  return null;
}
