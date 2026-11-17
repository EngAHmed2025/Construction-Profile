import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpLeft, Award, ClipboardCheck, Droplets, FileSignature, Landmark, X } from 'lucide-react';
import { Link } from 'wouter';
import { credentialDocuments } from '@/credentialDocuments';

// Categories of documents reproduced in the company profile (pp. 58–66).
// The home section summarizes the documents; the dedicated page shows the scans.
const credentials = [
  { icon: Droplets, title: 'اعتمادات شركة المياه الوطنية', text: 'اعتماد ديار الخبرة لدى شركة المياه الوطنية لمشروع مخطط شمس العروس.' },
  { icon: Landmark, title: 'اعتمادات أمانة محافظة جدة', text: 'خطاب عدم ممانعة لاعتماد ديار الخبرة مقاولاً لمخطط الهملان، وخطاب اعتمادها مقاولاً لمخطط اليحيى.' },
  { icon: ClipboardCheck, title: 'محاضر لجان الاستلام', text: 'محضر لجنة استلام أعمال المياه والصرف لمخطط الموسى فيو، وقرار استلام أعمال المياه والصرف لمخطط اليحيى.' },
  { icon: Award, title: 'شهادة تأهيل مطوّر عقاري', text: 'شهادة تأهيل مطوّر عقاري صادرة لديار الخبرة، ضمن وثائق ملف الشركة.' },
  { icon: FileSignature, title: 'اتفاقية هيئة الاتصالات والفضاء والتقنية', text: 'اتفاقية مع هيئة الاتصالات والفضاء والتقنية (CST).' },
];

export default function Credentials() {
  const [selected, setSelected] = useState<(typeof credentialDocuments)[number] | null>(null);
  const returnFocus = useRef<HTMLButtonElement>(null);
  const base = `${import.meta.env.BASE_URL}credentials/`;
  return (
    <div className="credentials-block" aria-labelledby="credentials-title">
      <h3 id="credentials-title">اعتمادات وشهادات</h3>
      <div className="credentials-preview-layout">
      <ul>
        {credentials.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <div><strong>{title}</strong><p>{text}</p></div>
          </li>
        ))}
      </ul>
      <Dialog.Root open={selected !== null} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <div className="credentials-preview-grid" aria-label="معاينة وثائق الاعتماد">
          {credentialDocuments.map((doc) => (
            <button key={doc.page} type="button" aria-label={`عرض ${doc.name}`} onClick={(event) => { returnFocus.current = event.currentTarget; setSelected(doc); }}>
              <img src={`${base}page-${doc.page}-sm.webp`} alt="" loading="lazy" decoding="async" />
              <span>{doc.name}</span>
            </button>
          ))}
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className="pm-overlay" />
          <Dialog.Content className="credential-lightbox" dir="rtl" aria-describedby={undefined} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }}>
            {selected && (
              <>
                <header>
                  <Dialog.Title>{selected.name}</Dialog.Title>
                  <Dialog.Close aria-label="إغلاق الوثيقة"><X size={20} /></Dialog.Close>
                </header>
                <div className="credential-lightbox-image" role="region" aria-label="صورة الوثيقة الكاملة" tabIndex={0}>
                  <img src={`${base}page-${selected.page}.webp`} alt={selected.name} />
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      </div>
      <Link
        className="site-action site-action-green credentials-documents"
        href="/credentials"
      >
        عرض وثائق الاعتماد <ArrowUpLeft size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
