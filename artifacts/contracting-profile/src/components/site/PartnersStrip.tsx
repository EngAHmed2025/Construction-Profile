import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const logoFiles = import.meta.glob<string>('../../assets/partners/*.webp', { eager: true, import: 'default' });
const logo = (name: string) => logoFiles[`../../assets/partners/${name}.webp`];

// Logos as printed on the "شركاء النجاح" page of the company profile (p. 57).
const partners = [
  { file: 'nwc', w: 260, name: 'شركة المياه الوطنية' },
  { file: 'sec', w: 190, name: 'الشركة السعودية للكهرباء' },
  { file: 'alfanar', w: 251, name: 'الفنار' },
  { file: 'jeddah-cables', w: 206, name: 'شركة كابلات جدة' },
  { file: 'albabtain', w: 123, name: 'البابطين للطاقة والاتصالات' },
  { file: 'dawiyat', w: 200, name: 'ضوئيات المتكاملة' },
  { file: 'unimix', w: 76, name: 'الاتحاد للخرسانة الجاهزة (يونيمكس)' },
  { file: 'alwasail', w: 223, name: 'الوسائل' },
  { file: 'artic', w: 208, name: 'أرتك' },
  { file: 'pedrollo', w: 320, name: 'بيدرولو' },
  { file: 'sps', w: 130, name: 'SPS' },
  { file: 'shadow', w: 250, name: 'أبعاد الظل المحدودة' },
  { file: 'baamer', w: 93, name: 'باعامر للكهرباء' },
  { file: 'group', w: 207, name: 'T. Nagadi Group of Factories' },
];

export default function PartnersStrip() {
  const [viewportRef, carousel] = useEmblaCarousel({ direction: 'rtl', loop: true, align: 'start', breakpoints: { '(prefers-reduced-motion: reduce)': { duration: 0 } } });
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!carousel) return;
    const start = () => setDragging(true);
    const end = () => setDragging(false);
    carousel.on('pointerDown', start).on('pointerUp', end);
    return () => { carousel.off('pointerDown', start).off('pointerUp', end); };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || hovered || dragging) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const timer = window.setInterval(() => {
      if (!motion.matches && !document.hidden && !document.activeElement?.closest('.partners-strip')) carousel.scrollNext();
    }, 2600);
    return () => window.clearInterval(timer);
  }, [carousel, hovered, dragging]);

  return (
    <section id="partners" className="partners-strip" aria-labelledby="partners-title"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="container-wide partners-inner">
        <div className="partners-heading">
          <h2 id="partners-title">شركاء النجاح</h2>
          <div className="partners-controls" role="group" aria-label="التحكم في عرض الشعارات">
            <button type="button" aria-label="الشعار السابق" onClick={() => carousel?.scrollPrev()}><ChevronRight size={17} aria-hidden="true" /></button>
            <button type="button" aria-label="الشعار التالي" onClick={() => carousel?.scrollNext()}><ChevronLeft size={17} aria-hidden="true" /></button>
          </div>
        </div>
        <div className="partners-viewport" dir="rtl" ref={viewportRef}>
          <ul className="partners-list">
            {partners.map((partner) => (
              <li key={partner.file} data-testid={`img-partner-${partner.file}`}>
                <span className="partner-logo-face">
                  <img src={logo(partner.file)} alt={partner.name} decoding="async" width={partner.w} height={72} draggable={false} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
