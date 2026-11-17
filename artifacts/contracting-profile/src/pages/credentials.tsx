import { useEffect, useState } from 'react';
import { ArrowRight, FileText, ZoomIn, ZoomOut } from 'lucide-react';
import logo from '@/assets/diyar-logo.webp';
import { credentialDocuments as documents } from '@/credentialDocuments';
import './credentials.css';

export default function CredentialsPage() {
  const [selected, setSelected] = useState<number>(0);
  const [zoomed, setZoomed] = useState(false);
  const doc = documents[selected];
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'اعتمادات وشهادات | ديار الخبرة للمقاولات العامة';
    window.scrollTo(0, 0);
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="credentials-page" dir="rtl">
      <div className="container-wide">
        <header className="credentials-page-header">
          <img src={logo} alt="ديار الخبرة للمقاولات العامة" width={58} height={60} />
          <a className="site-action site-action-green" href={`${base}#about`}><ArrowRight size={17} aria-hidden="true" /> العودة إلى الموقع</a>
        </header>
        <div className="credentials-page-intro">
          <span className="eyebrow">ملف الشركة</span>
          <h1>اعتمادات وشهادات</h1>
          <p>اختر وثيقة للاطلاع عليها هنا. الوثائق المعروضة من ملف شركة ديار الخبرة للمقاولات العامة.</p>
        </div>
        <div className="credentials-reader">
          <div className="credentials-picker" role="group" aria-label="اختر وثيقة للاطلاع">
            {documents.map((item, index) => (
              <button key={item.page} type="button" aria-pressed={index === selected} aria-controls="credential-sheet" onClick={() => { setSelected(index); setZoomed(false); }}>
                <FileText size={18} aria-hidden="true" /> {item.name}
              </button>
            ))}
          </div>
          <section className="credentials-sheet" id="credential-sheet" aria-labelledby="credential-sheet-title">
            <div className="credentials-sheet-header">
              <h2 id="credential-sheet-title" aria-live="polite">{doc.name}</h2>
              <button type="button" className="site-action" onClick={() => setZoomed((value) => !value)}>
                {zoomed ? <ZoomOut size={18} aria-hidden="true" /> : <ZoomIn size={18} aria-hidden="true" />}
                {zoomed ? 'عرض كامل' : 'تكبير'}
              </button>
            </div>
            <div key={doc.page} className={`credentials-image${zoomed ? ' is-zoomed' : ''}`} tabIndex={zoomed ? 0 : undefined} role="region" aria-label="صورة الوثيقة">
              <img src={`${base}credentials/page-${doc.page}.webp`} alt={doc.name} width={1385} height={2000} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
