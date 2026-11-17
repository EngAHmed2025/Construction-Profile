import type { CSSProperties } from 'react';
import AnimatedDiyarLogo from './AnimatedDiyarLogo';
import './return-to-site-loader.css';

export const brandRevealMs = 1500;

export default function ReturnToSiteLoader() {
  return (
    <div className="return-loader" dir="rtl" role="status" style={{ '--brand-reveal-time': `${brandRevealMs}ms` } as CSSProperties}>
      <div className="return-loader-content">
        <AnimatedDiyarLogo revealMs={brandRevealMs} />
        <span className="return-loader-caption">جارٍ تحميل موقع ديار الخبرة…</span>
        <span className="return-loader-line" aria-hidden="true" />
      </div>
    </div>
  );
}
