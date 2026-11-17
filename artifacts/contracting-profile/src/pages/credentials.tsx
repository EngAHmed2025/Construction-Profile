import { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, FileText, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';
import logo from '@/assets/diyar-logo.webp';
import { credentialDocuments as documents } from '@/credentialDocuments';
import './credentials.css';

export default function CredentialsPage({ onReturn }: { onReturn: (hash?: string) => void }) {
  const [selected, setSelected] = useState<number>(0);
  const [zoomed, setZoomed] = useState(false);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const doc = documents[selected];
  const base = import.meta.env.BASE_URL;
  const handleReturn = (event: React.MouseEvent<HTMLAnchorElement>, hash?: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onReturn(hash);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  function choose(index: number) {
    if (index === selected) return;
    setSelected(index);
    setZoomed(false);
    setFailed(false);
    setRetry(0);
  }

  return (
    <main className="credentials-page" dir="rtl">
      <header className="credentials-page-header">
        <div className="container-wide credentials-nav">
          <a className="credentials-brand" href={base} onClick={handleReturn}>
            <img src={logo} alt="" width={48} height={48} /><span><strong>ديار الخبرة</strong><small>للمقاولات العامة</small></span>
          </a>
          <a className="credentials-back" href={`${base}#about`} onClick={(event) => handleReturn(event, '#about')}><ArrowRight size={17} aria-hidden="true" /> العودة إلى الموقع</a>
        </div>
      </header>
      <div className="credentials-page-intro">
        <div className="container-wide credentials-intro-content">
          <div>
            <span className="eyebrow">ملف الشركة</span>
            <h1>اعتمادات وشهادات</h1>
            <p>اطّلع على وثائق التأهيل والاعتماد وخطابات الجهات المعنية ضمن ملف ديار الخبرة للمقاولات العامة.</p>
          </div>
          <ShieldCheck aria-hidden="true" className="credentials-intro-icon" strokeWidth={1} />
        </div>
      </div>
      <div className="container-wide credentials-reader">
          <aside className="credentials-index" aria-labelledby="credentials-index-title">
            <div className="credentials-index-heading"><h2 id="credentials-index-title">فهرس الوثائق</h2><span>{documents.length} وثائق</span></div>
            <div className="credentials-picker" role="group" aria-label="اختر وثيقة للاطلاع">
            {documents.map((item, index) => (
              <button key={item.page} type="button" aria-pressed={index === selected} aria-controls="credential-sheet" onClick={() => choose(index)}>
                <span className="credentials-row-icon"><FileText size={16} aria-hidden="true" /></span><span>{item.name}</span>
              </button>
            ))}
            </div>
            <label className="credentials-mobile-picker">
              <span className="sr-only">اختر وثيقة للاطلاع</span>
              <select value={selected} onChange={(event) => choose(Number(event.target.value))} aria-controls="credential-sheet">
                {documents.map((item, index) => <option key={item.page} value={index}>{item.name}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </aside>
          <section className="credentials-sheet" id="credential-sheet" aria-labelledby="credential-sheet-title">
            <div className="credentials-sheet-header">
              <div><span className="credentials-sheet-kicker">الوثيقة {selected + 1} من {documents.length}</span>
                <h2 id="credential-sheet-title" aria-live="polite">{doc.name}</h2></div>
              <button type="button" className="credentials-zoom" disabled={failed} onClick={() => setZoomed((value) => !value)}>
                {zoomed ? <ZoomOut size={18} aria-hidden="true" /> : <ZoomIn size={18} aria-hidden="true" />}
                {zoomed ? 'ملاءمة العرض' : 'تكبير'}
              </button>
            </div>
            {failed ? <div className="credentials-error" role="status">
              <p>تعذّر عرض الوثيقة.</p>
              <button type="button" className="credentials-zoom" onClick={() => { setRetry(retry + 1); setFailed(false); }}>إعادة المحاولة</button>
            </div> : <div key={`${doc.page}-${zoomed}-${retry}`} className={`credentials-image${zoomed ? ' is-zoomed' : ''}`} tabIndex={zoomed ? 0 : undefined} role="region" aria-label="صورة الوثيقة">
              <img src={`${base}credentials/page-${doc.page}.webp${retry ? `?retry=${retry}` : ''}`} onError={() => { setFailed(true); setZoomed(false); }} alt={doc.name} width={1385} height={2000} />
            </div>}
          </section>
      </div>
    </main>
  );
}
