import { ArrowUpLeft, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { lazy, type MouseEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { googleProjectUrl, projects, projectMeasure, type CompanyProject } from '@/projects';
import StatusBadge from './StatusBadge';
import mousaCover from '@/assets/projects/mousa-cover.webp';

const ProjectsMap = lazy(() => import('./ProjectsMap'));
const photoIntervalMs = 2300;

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
const preferredPhoto: Record<string, number> = { 'yahya-alwisam': 7, 'shams-al-arous': 5 };
const orderedProjects = [
  ...frontRow.flatMap((id) => projects.filter((project) => project.id === id)),
  ...projects.filter((project) => !frontRow.includes(project.id) && !planOnly.has(project.id) && project.id !== 'obhur-complex'),
  ...projects.filter((project) => planOnly.has(project.id) || project.id === 'obhur-complex'),
];

function ProjectCard({ project, onOpen }: { project: CompanyProject; onOpen: (id: string, event: MouseEvent<HTMLAnchorElement>) => void }) {
  const measure = projectMeasure(project);
  const [previewing, setPreviewing] = useState(false);
  const [{ current: photoIndex, previous }, setPhoto] = useState<{ current: number; previous: number | null }>({ current: 0, previous: null });
  const isRepresentative = project.id === 'obhur-complex';
  const previews = useMemo(() => {
    const image = (photo: CompanyProject['photos'][number]) => photo.thumb || photo.src;
    if (isRepresentative) return representative ? [image(representative)] : [];
    if (planOnly.has(project.id)) return [];
    const featured = preferredPhoto[project.id] ?? 0;
    const preferred = project.photos[featured];
    if (project.id === 'almousa-view') return [mousaCover, ...project.photos.map(image)];
    if (!preferred) return project.photos.map(image);
    return [image(preferred), ...project.photos.filter((_, index) => index !== featured).map(image)];
  }, [isRepresentative, project.id, project.photos]);
  const photoCount = previews.length;
  const cover = previews[photoIndex];
  const previousCover = previous === null ? null : previews[previous];

  useEffect(() => {
    if (!previewing || photoCount < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    let cancelled = false;
    let timer = 0;
    let index = 0;

    const queueNext = () => {
      index = (index + 1) % photoCount;
      const next = new Image();
      next.src = previews[index];
      const decoded = next.decode().then(() => true, () => false);
      timer = window.setTimeout(async () => {
        const ready = await decoded;
        if (cancelled) return;
        if (ready) {
          const upcoming = index;
          setPhoto(({ current }) => current === upcoming ? { current, previous: null } : { current: upcoming, previous: current });
        }
        queueNext();
      }, photoIntervalMs);
    };
    const stop = () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    const onMotionChange = () => {
      if (motion.matches) { stop(); setPreviewing(false); setPhoto({ current: 0, previous: null }); }
    };
    motion.addEventListener('change', onMotionChange);
    queueNext();
    return () => {
      stop();
      motion.removeEventListener('change', onMotionChange);
    };
  }, [previewing, photoCount, previews]);

  return (
    <a href={`/projects/${project.id}`} className="project-card" onClick={(event) => onOpen(project.id, event)} data-testid={`card-project-${project.id}`}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && photoCount > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPreviewing(true);
      }}
      onPointerLeave={() => {
        if (!previewing) return;
        setPreviewing(false);
        setPhoto(({ current }) => ({ current: 0, previous: current === 0 ? null : current }));
      }}>
      {cover && <span className="project-card-media">
        {previousCover && <img key={previous} className="project-card-photo" src={previousCover} alt="" width={720} height={540} />}
        <img key={photoIndex} className={`project-card-photo${previousCover ? ' project-card-photo-enter' : ''}`}
          src={cover} alt="" loading={previousCover ? 'eager' : 'lazy'} decoding="async" width={720} height={540} />
        <span className="project-card-number">{project.number}</span>
        {(isRepresentative || photoCount > 1) && <span className="project-card-count">
          {isRepresentative ? 'صورة توضيحية لأعمال شبكات من مشروع آخر' : previewing ? <bdi dir="ltr">{photoIndex + 1} / {photoCount}</bdi> : <>{photoCount} صور</>}
        </span>}
      </span>}
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
  const [view, setView] = useState<'cards' | 'map'>(() =>
    new URLSearchParams(window.location.search).get('view') === 'cards' ? 'cards' : 'map',
  );
  const [filter, setFilter] = useState<Filter>('all');
  const visible = orderedProjects.filter(filters.find((entry) => entry.id === filter)!.match);

  const openFromCard = (projectId: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpenProject(projectId);
  };

  return (
    <section className="projects-section" id="projects" aria-labelledby="projects-title">
      <div className="container-wide">
        <div className="section-heading projects-heading">
          <div><span className="eyebrow">مشروعات · جدة</span><h2 id="projects-title">مساحات واسعة، <span>وتفاصيل تحت الأرض.</span></h2></div>
          <p>{projects.length} مشروعاً من ملف الشركة، بمساحاتها وحالاتها كما وردت. اختر مشروعاً لعرض صوره ونطاقه.</p>
        </div>

        <div className="projects-toolbar">
          <div className="view-tabs" role="tablist" aria-label="طريقة العرض">
            <button type="button" role="tab" aria-selected={view === 'map'} className={view === 'map' ? 'is-active' : ''} onClick={() => setView('map')} data-testid="tab-projects-map"><MapIcon size={16} /> عرض على الخريطة</button>
            <button type="button" role="tab" aria-selected={view === 'cards'} className={view === 'cards' ? 'is-active' : ''} onClick={() => setView('cards')} data-testid="tab-projects-cards"><LayoutGrid size={16} /> البطاقات</button>
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
      </div>

      {view === 'cards' ? (
        <div className="container-wide">
          <div className="project-grid" data-testid="grid-projects">
            {visible.map((project) => <ProjectCard key={project.id} project={project} onOpen={openFromCard} />)}
          </div>
        </div>
        ) : (
          <Suspense fallback={<div className="container-wide map-skeleton" role="status" aria-label="جارٍ تحميل الخريطة" />}>
            <ProjectsMap onOpenProject={onOpenProject} fallback={
              <div className="project-grid" data-testid="grid-map-fallback">
                {projects.map((project) => (
                  <div className="map-fallback-item" key={project.id}>
                    <ProjectCard project={project} onOpen={openFromCard} />
                    <a className="map-fallback-link" target="_blank" rel="noopener noreferrer"
                      href={googleProjectUrl(project)}>
                      عرض على خرائط جوجل{!project.coordinates && ' — الحي فقط'}
                    </a>
                  </div>
                ))}
              </div>
            } />
          </Suspense>
        )}
    </section>
  );
}
