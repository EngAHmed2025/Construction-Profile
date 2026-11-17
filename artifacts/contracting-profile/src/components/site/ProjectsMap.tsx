import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpLeft, MapPin, Maximize, Minimize, Minus, Navigation2, Plus } from 'lucide-react';
import { findNearbyPanorama, hasMapsKey, loadGoogleMaps, mapsAuthFailure, type Coordinates, type Map3D } from '@/lib/googleMaps';
import { googleProjectUrl, projects, projectMeasure, type CompanyProject } from '@/projects';
import StatusBadge from './StatusBadge';
import './projects-map.css';

const center = { lat: 21.665, lng: 39.197 };
const compactViewport = '(max-width: 767px), (pointer: coarse)';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const verified = projects.filter((p): p is CompanyProject & { coordinates: Coordinates } => p.coordinates !== undefined);
const districtOnly = projects.filter((p) => !p.coordinates);
const compactNames: Record<string, string> = { 'obhur-complex': 'أبحر', 'alfal-alsawari': 'الفال', 'shams-al-arous': 'شمس العروس' };

function markerArtwork(number: number) {
  const template = document.createElement('template');
  template.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="15.5" fill="#dbb869" stroke="#263e34" stroke-width="3"/>
    <text x="18" y="23" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="700" fill="#263e34">${Number(number)}</text>
  </svg>`;
  return template;
}

export default function ProjectsMap({ onOpenProject, fallback }: { onOpenProject: (id: string) => void; fallback: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement>(null);
  const compass = useRef<SVGSVGElement>(null);
  const [fullscreen, setFullscreen] = useState<'native' | 'expanded' | null>(null);
  const [phase, setPhase] = useState<'idle' | 'loading' | 'ready' | 'failed'>(() =>
    window.matchMedia(compactViewport).matches ? 'idle' : hasMapsKey ? 'loading' : 'failed');
  const [started, setStarted] = useState(phase === 'loading');
  const [selected, setSelected] = useState<CompanyProject | null>(null);
  const [flying, setFlying] = useState<string | null>(null);
  const [panoramas, setPanoramas] = useState<Record<string, string>>({});
  const map = useRef<Map3D | null>(null);
  const cancelFlight = useRef<(() => void) | null>(null);
  const flightId = useRef(0);

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === frameRef.current ? 'native' : null);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  useEffect(() => {
    if (fullscreen !== 'expanded') return;
    const exit = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(null); };
    window.addEventListener('keydown', exit);
    return () => window.removeEventListener('keydown', exit);
  }, [fullscreen]);

  async function toggleFullscreen() {
    const frame = frameRef.current;
    if (fullscreen === 'native') { await document.exitFullscreen(); return; }
    if (fullscreen === 'expanded') { setFullscreen(null); return; }
    try {
      if (!frame?.requestFullscreen) { setFullscreen('expanded'); return; }
      await frame.requestFullscreen();
    } catch { setFullscreen('expanded'); }
  }

  async function zoom(multiplier: number) {
    const element = map.current;
    if (!element) return;
    try { await element.stopCameraAnimation(); } catch { /* The zoom still works without a flight. */ }
    if (map.current === element) element.range = Math.min(250000, Math.max(200, element.range * multiplier));
  }

  async function visit(project: typeof verified[number]) {
    const element = map.current;
    if (!element) return;
    const id = ++flightId.current;
    listRef.current?.scrollTo({ top: 0 });
    cancelFlight.current?.();
    setSelected(null);
    setFlying(project.title);
    const camera = { center: project.coordinates, range: 1050, tilt: 52, heading: 0 };
    const arrive = () => {
      if (id !== flightId.current || map.current !== element) return;
      setFlying(null);
      setSelected(project);
    };
    try {
      await element.stopCameraAnimation();
      if (id !== flightId.current || map.current !== element) return;
      if (reduceMotion()) {
        Object.assign(element, camera);
        arrive();
        return;
      }
      const finish = () => {
        cancel();
        arrive();
      };
      const timer = window.setTimeout(finish, 2400);
      const cancel = () => {
        window.clearTimeout(timer);
        element.removeEventListener('gmp-animationend', finish);
        cancelFlight.current = null;
      };
      cancelFlight.current = cancel;
      element.addEventListener('gmp-animationend', finish, { once: true });
      element.flyCameraTo({ endCamera: camera, durationMillis: 1500 });
    } catch {
      if (id !== flightId.current || map.current !== element) return;
      cancelFlight.current?.();
      Object.assign(element, camera);
      arrive();
    }
  }

  useEffect(() => {
    const node = host.current;
    if (!started || !node) return;
    const controller = new AbortController();
    const { signal } = controller;
    const cleanup = () => {
      controller.abort();
      window.clearTimeout(timer);
      cancelFlight.current?.();
      map.current = null;
      node.replaceChildren();
    };
    const fail = () => {
      if (signal.aborted) return;
      cleanup();
      setPhase('failed');
    };
    const timer = window.setTimeout(fail, 30000);
    window.addEventListener(mapsAuthFailure, fail, { signal });
    let rendered = false;

    void loadGoogleMaps().then(async (maps) => {
      const lib = await maps.importLibrary('maps3d');
      if (signal.aborted) return;
      const animateIntro = !reduceMotion();
      // Fit the same project corridor into the tall mobile viewport and leave room for the desktop list.
      const portrait = node.clientWidth < 768;
      const range = portrait ? 53000 * Math.max(1, node.clientHeight / node.clientWidth * 1.83) : 55000;
      const overview = { center: portrait ? center : { lat: center.lat - 0.04, lng: center.lng + 0.029 }, range, tilt: 35, heading: 53 };
      const element = new lib.Map3DElement({
        ...overview, ...(animateIntro && { range: range * 1.06, tilt: 29 }),
        mode: 'SATELLITE', gestureHandling: 'COOPERATIVE', defaultUIHidden: true,
      });
      element.setAttribute('aria-label', 'خريطة جدة ثلاثية الأبعاد من جوجل');
      element.addEventListener('gmp-error', fail, { signal });
      element.addEventListener('gmp-headingchange', () => {
        if (compass.current) compass.current.style.transform = `rotate(${-element.heading}deg)`;
      }, { signal });
      element.addEventListener('gmp-steadychange', (event) => {
        if (rendered || !(event as Event & { isSteady?: boolean }).isSteady) return;
        rendered = true;
        clearTimeout(timer);
        setPhase('ready');
        if (animateIntro) element.flyCameraTo({ endCamera: overview, durationMillis: 1250 });
        void maps.importLibrary('streetView').then(({ StreetViewService }) => {
          if (signal.aborted) return;
          const service = new StreetViewService();
          for (const project of verified) {
            void findNearbyPanorama(service, project.coordinates).then((url) => {
              if (url && !signal.aborted) setPanoramas((previous) => ({ ...previous, [project.id]: url }));
            }).catch(() => { /* No panorama button unless coverage is confirmed. */ });
          }
        }).catch(() => { /* Street View access is independent of map access. */ });
      }, { signal });
      map.current = element;
      for (const project of verified) {
        const compact = window.matchMedia('(max-width: 555px)').matches;
        const label = compact || project.id === 'shams-al-arous' ? compactNames[project.id] ?? project.title : project.title;
        const marker = new lib.Marker3DInteractiveElement({ position: project.coordinates, label });
        marker.append(markerArtwork(project.number));
        marker.setAttribute('aria-label', project.title);
        marker.addEventListener('gmp-click', () => { void visit(project); }, { signal });
        element.append(marker);
      }
      node.append(element);
    }).catch(fail);

    return cleanup;
  }, [started]);

  if (phase === 'failed') return (
    <div className="container-wide map-fallback">
      <p role="status">تعذّر عرض خريطة جوجل ثلاثية الأبعاد حاليًا. تقدر تتصفح بطاقات المشروعات وتفتح المواقع أو الأحياء في خرائط جوجل.</p>
      {fallback}
    </div>
  );

  const measure = selected && projectMeasure(selected);
  return (
    <div className="projects-map-layout">
        <div ref={frameRef} className={`projects-map-frame${fullscreen === 'expanded' ? ' is-expanded' : ''}`}>
        <header className="map-panel-heading">
          <h3>خريطة المشروعات</h3>
          <p>تعرّف على مواقع أعمالنا في جدة.</p>
        </header>
          {phase === 'idle' ? <div className="map-load-prompt">
            <MapPin aria-hidden="true" size={30} />
            <p>حمّل الخريطة عند الحاجة لتوفير بيانات الموبايل.</p>
            <button type="button" className="site-action site-action-green" onClick={() => { setPhase('loading'); setStarted(true); }}>تحميل الخريطة</button>
          </div> : <div ref={host} className="projects-map-host" />}
          {phase === 'loading' && <p className="map-loading" role="status">جارٍ تحميل خريطة جدة من جوجل…</p>}
          {phase === 'ready' && <>
            <div className="map-edge-fades" aria-hidden="true"><i /><i /><i /></div>
            <div className="map-zoom-buttons" role="group" aria-label="أدوات الخريطة">
              <button type="button" title="تكبير الخريطة" aria-label="تكبير الخريطة" disabled={Boolean(flying)} onClick={() => { void zoom(0.73); }}><Plus size={18} aria-hidden="true" /></button>
              <button type="button" title="تصغير الخريطة" aria-label="تصغير الخريطة" disabled={Boolean(flying)} onClick={() => { void zoom(1 / 0.73); }}><Minus size={18} aria-hidden="true" /></button>
              <button type="button" title="توجيه الخريطة شمالاً" aria-label="توجيه الخريطة شمالاً" disabled={Boolean(flying)}
                onClick={() => { if (map.current) map.current.heading = 0; }}><Navigation2 ref={compass} size={17} aria-hidden="true" style={{ transform: `rotate(${-(map.current?.heading ?? 0)}deg)` }} /></button>
              <button type="button" title={fullscreen ? 'إغلاق ملء الشاشة' : 'ملء الشاشة'} aria-label={fullscreen ? 'إغلاق ملء الشاشة' : 'ملء الشاشة'}
                onClick={() => { void toggleFullscreen(); }}>{fullscreen ? <Minimize size={17} aria-hidden="true" /> : <Maximize size={17} aria-hidden="true" />}</button>
            </div>
          </>}
        </div>
      <aside className="map-districts" ref={listRef} aria-labelledby="map-project-list-title">
        <h4 id="map-project-list-title">المشروعات في جدة</h4>
        {phase === 'ready' && <ul className="map-verified">
          {verified.map((p) => <li key={p.id}>
            <button className="map-list-row" type="button" aria-pressed={selected?.id === p.id || flying === p.title} onClick={() => { void visit(p); }}>
              <span className="map-marker-number">{p.number}</span><strong>{p.title}</strong><span className="map-tag">على الخريطة</span>
            </button>
          </li>)}
        </ul>}
        {flying && <p role="status" className="map-caption">جارٍ الانتقال إلى {flying}…</p>}
        {selected && <article className="map-selected-project" aria-live="polite">
          <h3>{selected.title}</h3>
          <div className="map-project-facts">
            {measure && <span>{measure.label}: <bdi>{measure.value}</bdi> {measure.unit}</span>}
            {selected.status ? <StatusBadge status={selected.status} /> : <span>الحالة غير مذكورة</span>}
          </div>
          <div className="map-project-actions">
            <a className="site-action site-action-green" href={`/projects/${selected.id}`} onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onOpenProject(selected.id);
            }}>تفاصيل المشروع <ArrowUpLeft size={15} aria-hidden="true" /></a>
            {panoramas[selected.id] && <div className="map-panorama">
              <a className="site-action map-location-button" href={panoramas[selected.id]} target="_blank" rel="noopener noreferrer" aria-describedby="street-view-source">عرض 360°</a>
              <small id="street-view-source">تصوير محيط الموقع من جوجل</small>
            </div>}
          </div>
        </article>}
        <h5 id="district-projects-title">الموقع على مستوى الحي</h5>
        <ul aria-labelledby="district-projects-title">
          {districtOnly.map((p) => <li key={p.id}>
            <a className="map-list-row" href={googleProjectUrl(p)} target="_blank" rel="noopener noreferrer" aria-label={`${p.title} — عرض ${p.district} على خرائط جوجل`}>
              <MapPin size={16} aria-hidden="true" className="map-district-row-icon" />
              <span className="map-district-copy"><strong>{p.title}</strong><small>{p.district}</small></span>
              <ArrowUpLeft size={14} aria-hidden="true" className="map-district-arrow" />
            </a>
          </li>)}
        </ul>
      </aside>
      <p className="container-wide map-caption map-usage-note">العلامات لا تمثّل حدود أعمال الشركة. <span>للتكبير، استخدم الأزرار أو <bdi>Ctrl</bdi> مع عجلة الماوس.</span></p>
    </div>
  );
}
