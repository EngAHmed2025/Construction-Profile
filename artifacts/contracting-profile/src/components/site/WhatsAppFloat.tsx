import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { contactConfig, whatsappUrl } from '@/contact';
import WhatsAppIcon from './WhatsAppIcon';

export default function WhatsAppFloat() {
  const href = whatsappUrl();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (href) {
    return (
      <a className="wa-float" href={href} target="_blank" rel="noopener noreferrer" aria-label="تواصل عبر واتساب" data-testid="link-whatsapp-float">
        <WhatsAppIcon size={26} />
      </a>
    );
  }

  return (
    <div className="wa-float-wrap" ref={wrapRef}>
      {open && (
        <div className="wa-float-note" role="status" data-testid="status-whatsapp-unavailable">
          <button type="button" onClick={() => setOpen(false)} aria-label="إغلاق"><X size={15} /></button>
          <strong>واتساب غير متاح حالياً</strong>
          <p>الرقم المنشور هاتف ثابت لا يستقبل رسائل واتساب. تواصل معنا هاتفياً أو جهّز استفسارك من النموذج.</p>
          <a href={contactConfig.phoneHref} data-testid="link-whatsapp-call">اتصل: <span dir="ltr">{contactConfig.phone}</span></a>
          <a href="#contact" onClick={() => setOpen(false)} data-testid="link-whatsapp-to-contact">نموذج الاستفسار</a>
        </div>
      )}
      <button
        type="button"
        className="wa-float is-unavailable"
        aria-expanded={open}
        aria-label="واتساب — غير متاح حالياً"
        onClick={() => setOpen((value) => !value)}
        data-testid="button-whatsapp-float"
      >
        <WhatsAppIcon size={26} />
      </button>
    </div>
  );
}
