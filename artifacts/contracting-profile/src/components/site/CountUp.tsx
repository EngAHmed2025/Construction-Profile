import { useEffect, useState } from 'react';
import { formatNumber } from '@/projects';

const durationMs = 1600;
const reducedMotion = '(prefers-reduced-motion: reduce)';

export default function CountUp({ value }: { value: number }) {
  const [current, setCurrent] = useState(() => window.matchMedia(reducedMotion).matches ? value : 0);

  useEffect(() => {
    const motion = window.matchMedia(reducedMotion);
    if (motion.matches) {
      setCurrent(value);
      return;
    }
    let frame = 0;
    let started: number | undefined;
    const tick = (now: number) => {
      started ??= now;
      const progress = Math.min((now - started) / durationMs, 1);
      setCurrent(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    const stopForReducedMotion = () => {
      if (!motion.matches) return;
      cancelAnimationFrame(frame);
      setCurrent(value);
    };
    frame = requestAnimationFrame(tick);
    motion.addEventListener('change', stopForReducedMotion);
    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', stopForReducedMotion);
    };
  }, [value]);

  return <>
    <span className="sr-only">{formatNumber(value)}</span>
    <bdi dir="ltr" aria-hidden="true">{formatNumber(current)}</bdi>
  </>;
}
