import { lazy, type MouseEvent, Suspense, useEffect, useRef, useState } from 'react';
import { ArrowUpLeft, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { projects, projectMeasure, type CompanyProject } from '@/projects';
import type { JeddahCityMapHandle } from '@/JeddahCityMap';
import StatusBadge from './StatusBadge';
import mousaCover from '@/assets/projects/mousa-cover.webp';

const loadMap = () => import('@/JeddahCityMap');
const JeddahCityMap = lazy(loadMap);
const isDesktop = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;

type Props = { onOpenProject: (projectId: string) => void };
type Filter = 'all' | 'done' | 'developing';

const filters: { id: Filter; label: string; match: (project: CompanyProject) => boolean }[] = [
  { id: 'all', label: 'الكل', match: () => true },
  { id: 'done', label: 'منفّذ', match: (project) => project.status === 'منفّذ' },
  { id: 'developing', label: 'قيد التطوير', match: (project) => project.status === 'قيد التطوير' || project.status === 'تحت التطوير' },
];

const frontRow = ['hamlan-674', 'yahya-alwisam', 'shams-al-arous'];
const planOnly = new Set(['alfal-alsawari', 'alwedad-almarwah', 'almarkaz-almanarat']);
const representative = projects.find(({ id }) => id === 'red-sea-village-alma')?.photos[0];
const orderedProjects = [
  ...frontRow.flatMap((id) => projects.filter((project) => project.id === id)),
  ...projects.filter((project) => !frontRow.includes(project.id) && !planOnly.has(project.id) && project.id !== 'obhur-complex'),
  ...projects.filter((project) => planOnly.has(project.id) || project.id === 'obhur-complex'),
];

function ProjectCard({ project, onOpen }: { project: CompanyProject; onOpen: (id: string, event: MouseEvent<HTMLAnchorElement>) => void }) {
  const measure = projectMeasure(project);
  const isRepresentative = project.id === 'obhur-complex';
  const cover = isRepresentative ? representative?.thumb : planOnly.has(project.id) ? undefined : ({
    'hamlan-674': project.photos[0]?.thumb,
    'yahya-alwisam': project.photos[7]?.thumb,
    'shams-al-arous': project.photos[5]?.thumb,
    'almousa-view': mousaCover,
  }[project.id] ?? project.photos[0]?.thumb);
  return (
    <a href={`/projects/${project.id}`} className="project-card" onClick={(event) => onOpen(project.id, event)} data-testid={`card-project-${project.id}`}>
      {cover && (
        <span className="project-card-media">
          <img src={cover} alt="" loading="lazy" decoding="async" width={720} height={540} />
          <span className="project-card-number">{project.number}</span>
          {isRepresentative
            ? <span className="project-card-count">صورة توضيحية لأعمال شبكات من مشروع آخر</span>
            : project.photos.length > 1 && <span className="project-card-count">{project.photos.length} صور</span>}
        </span>
      )}
      <span className="project-card-body">
        <span className="project-card-meta">
          {project.status && <StatusBadge status={project.status} />}
          {project.subcontract && <span className="role-badge">مقاول باطن</span>}
        </span>
        <strong className="project-card-title">{project.title}</strong>
        <span className="project-card-location">{project.district}</span>
        {measure && (
          <span className="project-card-measure"><b dir="ltr">{measure.value}</b><small>{measure.unit}</small></span>
        )}
        <span className="project-card-scope">{project.shortScope}</span>
        <span className="project-card-more">تفاصيل المشروع <ArrowUpLeft size={16} /></span>
      </span>
    </a>
  );
}

export default function ProjectsSection({ onOpenProject }: Props) {
  const [view, setView] = useState<'cards' | 'map'>('cards');
  const [filter, setFilter] = useState<Filter>('all');
  const cityMapRef = useRef<JeddahCityMapHandle>(null);
  const pending = useRef(false);
  const visible = orderedProjects.filter(filters.find((entry) => entry.id === filter)!.match);

  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { pending.current = false; }, [view]);

  // Warm the map chunk only when the projects section approaches the viewport on desktop.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node || !isDesktop() || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { void loadMap(); observer.disconnect(); }
    }, { rootMargin: '300px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Mobile is cards-only: fall back if the viewport shrinks while the map tab is open.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const sync = () => { if (query.matches) setView('cards'); };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const openFromCard = (projectId: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenProject(projectId);
  };
  const openFromPin = (projectId: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pending.current) return;
    const map = cityMapRef.current;
    if (!map || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onOpenProject(projectId); return; }
    pending.current = true;
    const done = () => { pending.current = false; onOpenProject(projectId); };
    void map.flyToProject(projectId).then(done, done);
  };

  return (
    <section ref={sectionRef} className="projects-section" id="projects" aria-labelledby="projects-title">
      <div className="container-wide">
        <div className="section-heading projects-heading">
          <div><span className="eyebrow">مشروعات · جدة</span><h2 id="projects-title">مساحات واسعة، <span>وتفاصيل تحت الأرض.</span></h2></div>
          <p>{projects.length} مشروعاً من ملف الشركة، بمساحاتها وحالاتها كما وردت. اختر مشروعاً لعرض صوره ونطاقه.</p>
        </div>

        <div className="projects-toolbar">
          <div className="view-tabs" role="tablist" aria-label="طريقة العرض">
            <button type="button" role="tab" aria-selected={view === 'cards'} className={view === 'cards' ? 'is-active' : ''} onClick={() => setView('cards')} data-testid="tab-projects-cards"><LayoutGrid size={16} /> البطاقات</button>
            <button type="button" role="tab" aria-selected={view === 'map'} className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')} data-testid="tab-projects-map"><MapIcon size={16} /> عرض على الخريطة</button>
          </div>
          {view === 'cards' && (
            <div className="status-filters" aria-label="تصفية حسب الحالة">
              {filters.map((entry) => (
                <button key={entry.id} type="button" aria-pressed={filter === entry.id} className={filter === entry.id ? 'is-active' : ''} onClick={() => setFilter(entry.id)} data-testid={`button-filter-${entry.id}`}>
                  {entry.label} <span>{projects.filter(entry.match).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {view === 'cards' ? (
          <div className="project-grid" data-testid="grid-projects">
            {visible.map((project) => <ProjectCard key={project.id} project={project} onOpen={openFromCard} />)}
          </div>
        ) : (
          <figure className="map-figure">
            <Suspense fallback={<div className="map-skeleton" aria-label="جارٍ تحميل الخريطة" />}>
              <JeddahCityMap ref={cityMapRef} projects={projects} onSelect={openFromPin} />
            </Suspense>
            <figcaption className="map-caption">مواضع توضيحية تقريبية</figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
