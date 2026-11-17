import { useEffect, useId, useState, type CSSProperties } from 'react';
import logo from '@/assets/diyar-logo.png?inline';

const strokes = [
  { path: 'M278 102Q300 123 331 155Q354 175 331 192Q300 216 263 232Q250 239 240 215', width: 34, delay: 0, duration: 380 },
  { path: 'M263 143Q254 167 251 197Q246 219 213 226', width: 29, delay: 375, duration: 290 },
  { path: 'M207 23Q204 57 208 106L214 232', width: 29, delay: 665, duration: 285 },
  { path: 'M184 132Q176 151 178 179Q191 213 133 237Q100 255 45 269', width: 30, delay: 950, duration: 375 },
  { path: 'M230 244L236 252 M227 272L222 282', width: 31, delay: 1325, duration: 175 },
];

export default function AnimatedDiyarLogo({ revealMs }: { revealMs: number }) {
  const maskId = useId();
  const [complete, setComplete] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const timer = window.setTimeout(() => setComplete(true), revealMs);
    return () => window.clearTimeout(timer);
  }, [revealMs]);
  return (
    <svg className="return-loader-name" viewBox="32 8 329 289" aria-hidden="true" focusable="false">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="32" y="8" width="329" height="289">
          {strokes.map(({ path, width, duration, delay }) => (
            <path key={path} className="return-loader-pen" d={path} pathLength="1" fill="none" stroke="white"
              strokeWidth={width} strokeLinecap="round" strokeLinejoin="round"
              style={{ '--pen-duration': `${duration}ms`, '--pen-delay': `${delay}ms` } as CSSProperties} />
          ))}
        </mask>
      </defs>
      <image href={logo} width="430" height="392" mask={complete ? undefined : `url(#${maskId})`} />
    </svg>
  );
}
