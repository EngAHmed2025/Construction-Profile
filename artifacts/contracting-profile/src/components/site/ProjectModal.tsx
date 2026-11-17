import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff, MapPin, X } from 'lucide-react';
import { projectMeasure, type CompanyProject } from '@/projects';
import { whatsappUrl } from '@/contact';
import StatusBadge from './StatusBadge';
import WhatsAppIcon from './WhatsAppIcon';

type Props = { project: CompanyProject | null; onClose: () => void; onInquire: (details: string) => void };

export default function ProjectModal({ project, onClose, onInquire }: Props) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [project?.id]);
  const photos = project?.photos ?? [];
  const photo = photos[index];
  const measure = project ? projectMeasure(project) : null;
  const step = (delta: number) => setIndex((value) => (value + delta + photos.length) % photos.length);

  const inquire = () => {
    if (!project) return;
    const message = `السلام عليكم، أرغب في الاستفسار عن مشروع مشابه لمشروع: ${project.title}`;
    const url = whatsappUrl(message);
    if (url) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
    onInquire(`مشروع مشابه لمشروع «${project.title}». `);
  };

  return (
    <Dialog.Root open={Boolean(project)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="pm-overlay" />
        <Dialog.Content className="pm-content" dir="rtl" aria-describedby={undefined} data-testid="modal-project"
          onKeyDown={(event) => { if (photos.length > 1 && event.key === 'ArrowLeft') step(1); if (photos.length > 1 && event.key === 'ArrowRight') step(-1); }}>
          {project && (
            <>
              <div className="pm-gallery">
                {photo ? (
                  <figure className="pm-main">
                    <img key={photo.src} src={photo.src} alt={`${project.title} — ${photo.caption}`} decoding="async" />
                    <figcaption>{photo.caption} <span>· من ملف الشركة</span></figcaption>
                    {photos.length > 1 && (
                      <>
                        <button type="button" className="pm-nav pm-prev" onClick={() => step(-1)} aria-label="الصورة السابقة" data-testid="button-photo-prev"><ChevronRight size={22} /></button>
                        <button type="button" className="pm-nav pm-next" onClick={() => step(1)} aria-label="الصورة التالية" data-testid="button-photo-next"><ChevronLeft size={22} /></button>
                        <span className="pm-counter" dir="ltr">{index + 1} / {photos.length}</span>
                      </>
                    )}
                  </figure>
                ) : (
                  <div className="pm-empty"><ImageOff size={30} strokeWidth={1.3} /><p>لا تتضمن صفحة المشروع في ملف الشركة صوراً للموقع.</p></div>
                )}
                {photos.length > 1 && (
                  <div className="pm-thumbs" role="list" aria-label="صور المشروع">
                    {photos.map((entry, photoIndex) => (
                      <button key={entry.src} type="button" role="listitem" className={photoIndex === index ? 'is-active' : ''} onClick={() => setIndex(photoIndex)} aria-label={`الصورة ${photoIndex + 1}: ${entry.caption}`} aria-current={photoIndex === index} data-testid={`button-thumb-${photoIndex + 1}`}>
                        <img src={entry.thumb} alt="" loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pm-info">
                <Dialog.Close className="pm-close" aria-label="إغلاق" data-testid="button-close-project"><X size={20} /></Dialog.Close>
                <div className="pm-badges">
                  <span className="pm-number">مشروع {project.number}</span>
                  {project.status && <StatusBadge status={project.status} />}
                  {project.subcontract && <span className="role-badge">مقاول باطن</span>}
                </div>
                <Dialog.Title className="pm-title">{project.title}</Dialog.Title>
                <p className="pm-location"><MapPin size={16} /> {project.district}</p>

                <dl className="pm-facts">
                  {measure && <div><dt>{measure.label}</dt><dd><b dir="ltr">{measure.value}</b> {measure.unit}</dd></div>}
                  <div><dt>التصنيف</dt><dd>{project.category}</dd></div>
                  {project.mainContractor && <div><dt>المقاول الرئيسي</dt><dd>{project.mainContractor}</dd></div>}
                  {project.authority && <div><dt>الجهة المعنية</dt><dd>{project.authority}</dd></div>}
                </dl>

                <h3 className="pm-subtitle">نطاق الأعمال</h3>
                <ul className="pm-scope">{project.scope.map((line) => <li key={line}>{line}</li>)}</ul>
                {project.scopeNote && <p className="pm-note">{project.scopeNote}</p>}

                <button type="button" className="site-action site-action-gold pm-cta" onClick={inquire} data-testid="button-inquire-similar">
                  {whatsappUrl() ? <WhatsAppIcon size={18} /> : <ArrowLeft size={17} />} استفسر عن مشروع مشابه
                </button>
                <p className="pm-source">المصدر: ملف الشركة التعريفي، صفحة <bdi>{project.sourcePages}</bdi></p>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
