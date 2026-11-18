import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { projects } from '@/projects';

const slideDurationMs = 6000;
const reducedMotion = '(prefers-reduced-motion: reduce)';
const featuredId = 'hamlan-674';
const slides = [...projects.filter((project) => project.id === featuredId), ...projects.filter((project) => project.id !== featuredId)]
  .flatMap(({ id, title, photos }) => {
    const photo = photos[0];
    if (!photo?.src) return [];
    const featured = id === featuredId;
    return [{
      id, title, caption: featured ? 'الطرق والإنارة بعد التنفيذ' : photo.caption,
      src: featured ? `${import.meta.env.BASE_URL}hero-finished.webp` : photo.src,
      thumb: featured ? `${import.meta.env.BASE_URL}hero-finished-sm.webp` : photo.thumb,
    }];
  });

export default function HeroProjects() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [frame, setFrame] = useState({ current: 0, previous: null as number | null });
  const [motionAllowed, setMotionAllowed] = useState(() => !window.matchMedia(reducedMotion).matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const slide = slides[frame.current];
  const rotating = motionAllowed && !hovered && !focused && visible && pageVisible && slides.length > 1;

  useEffect(() => {
    const media = window.matchMedia(reducedMotion);
    const onMotion = () => setMotionAllowed(!media.matches);
    const onVisibility = () => setPageVisible(!document.hidden);
    media.addEventListener('change', onMotion);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 },
    ) : null;
    if (root.current) observer?.observe(root.current);
    return () => {
      observer?.disconnect();
      media.removeEventListener('change', onMotion);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const next = slides[(active + 1) % slides.length];
    const preload = new Image();
    preload.fetchPriority = 'low';
    preload.src = window.matchMedia('(max-width: 767px)').matches && next.thumb ? next.thumb : next.src;
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % slides.length), slideDurationMs);
    return () => window.clearTimeout(timer);
  }, [active, rotating]);

  useEffect(() => {
    let cancelled = false;
    const next = slides[active];
    if (!next) return;
    const image = new Image();
    image.src = window.matchMedia('(max-width: 767px)').matches && next.thumb ? next.thumb : next.src;
    // Keep the current image visible until the replacement is decoded.
    void image.decode().then(() => {
      if (!cancelled) setFrame((current) => current.current === active
        ? current : { previous: current.current, current: active });
    }).catch(() => { /* Retain the last successfully loaded slide. */ });
    return () => { cancelled = true; };
  }, [active]);

  if (!slide) return null;

  const move = (direction: number) => {
    setActive((value) => (value + direction + slides.length) % slides.length);
  };
  return (
    <figure className="hero-photo hero-slideshow" ref={root} aria-label="صور مشروعات ديار الخبرة"
      onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      {frame.previous !== null && (
        <picture className="hero-slide-image" key={`previous-${slides[frame.previous].id}`} aria-hidden="true">
          <source media="(max-width: 767px)" srcSet={slides[frame.previous].thumb} />
          <img src={slides[frame.previous].src} alt="" width={1600} height={892} />
        </picture>
      )}
      <picture className={`hero-slide-image${frame.previous !== null ? ' is-entering' : ''}`} key={slide.id}>
        {slide.thumb && <source media="(max-width: 767px)" srcSet={slide.thumb} />}
        <img src={slide.src} alt={`${slide.title} — ${slide.caption}`} width={1600} height={892}
          fetchPriority={active === 0 ? 'high' : 'auto'} />
      </picture>
      {slides.length > 1 && <>
        <div className="hero-slide-controls" role="group" aria-label="التنقّل بين صور المشروعات">
          <button type="button" aria-label="الصورة السابقة" onClick={() => move(-1)}><ChevronRight size={18} aria-hidden="true" /></button>
          <button type="button" aria-label="الصورة التالية" onClick={() => move(1)}><ChevronLeft size={18} aria-hidden="true" /></button>
        </div>
        <span className="hero-slide-count" aria-hidden="true"><bdi dir="ltr">{String(frame.current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</bdi></span>
      </>}
      <figcaption aria-live={rotating ? 'off' : 'polite'}>
        <strong>{slide.title}</strong><span>{slide.caption}</span>
      </figcaption>
    </figure>
  );
}
