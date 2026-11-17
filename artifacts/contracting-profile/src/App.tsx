import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDown, ArrowDownLeft, ArrowLeft, ArrowUpLeft, BadgeCheck, Check,
  CircleDot, Droplets, HardHat, Layers3, MapPin, Menu,
  MoveUpLeft, Route as RouteIcon, ShieldCheck, Signpost, X, Zap,
} from 'lucide-react';
import { Route, Switch, useRoute, useLocation, Router as WouterRouter } from 'wouter';
import logo from './assets/diyar-logo.png';
import { projects } from './projects';
import JeddahCityMap, { type JeddahCityMapHandle } from './JeddahCityMap';

const queryClient = new QueryClient();

const navigation = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المشروعات', href: '#projects' },
  { label: 'عن ديار الخبرة', href: '#about' },
  { label: 'نطاق الأعمال', href: '#services' },
  { label: 'منهج التنفيذ', href: '#approach' },
];

const services = [
  { title: 'تهيئة الموقع والأعمال الترابية', text: 'تنظيف الموقع، التسوية، وأعمال الحفر والردم والقطع والإحلال ضمن نطاق المشروع.', icon: Layers3 },
  { title: 'الطرق والفراغات العامة', text: 'تنفيذ الطرق والأرصفة والرصف، وعناصر تنظيم الحركة واللوحات المرورية.', icon: RouteIcon },
  { title: 'شبكات المياه والصرف', text: 'شبكات المياه والصرف الصحي، وربط المياه وفق متطلبات الجهة المعنية ونطاق العمل.', icon: Droplets },
  { title: 'شبكات الحريق وتصريف الأمطار', text: 'أعمال شبكات مكافحة الحريق وتصريف مياه الأمطار ضمن بنية الموقع التحتية.', icon: ShieldCheck },
  { title: 'الكهرباء والإنارة', text: 'شبكات الجهد المنخفض والمتوسط والتوزيع، وإنارة الشوارع والمساحات الخارجية.', icon: Zap },
  { title: 'تنسيق المواقع والري', text: 'أعمال التشجير والحدائق وشبكات الري، إلى جانب شبكات الهاتف.', icon: Signpost },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a href="#home" className={`brand${compact ? ' brand-compact' : ''}`} aria-label="ديار الخبرة للمقاولات العامة — الرئيسية" data-testid="link-brand-home">
      <span className="brand-logo-wrap"><img src={logo} alt="" /></span>
      <span className="brand-copy" dir="rtl">
        <strong>ديار الخبرة</strong>
        <small>للمقاولات العامة</small>
      </span>
    </a>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryCopied, setInquiryCopied] = useState(false);
  const [, setLocation] = useLocation();
  const [, projectParams] = useRoute('/projects/:id');
  const cityMapRef = useRef<JeddahCityMapHandle>(null);
  const projectNavigationPending = useRef(false);
  const activeProject = projects.find((project) => project.id === projectParams?.id) ?? null;

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.site-shell main > section:not(.hero)'));
    sections.forEach((section) => section.classList.add('section-reveal'));
    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeProject) document.getElementById('projects')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
  }, [activeProject?.id]);

  const closeMenu = () => setMenuOpen(false);
  const navigateToProject = (projectId: string) => {
    projectNavigationPending.current = false;
    setLocation(`/projects/${projectId}`);
  };
  const closeProject = () => {
    projectNavigationPending.current = false;
    setLocation('/#projects');
    window.setTimeout(() => document.getElementById('projects')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    }), 0);
  };
  const enterProject = (projectId: string, event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (projectNavigationPending.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !cityMapRef.current) {
      navigateToProject(projectId);
      return;
    }
    projectNavigationPending.current = true;
    void cityMapRef.current.flyToProject(projectId)
      .then(() => navigateToProject(projectId), () => navigateToProject(projectId));
  };
  if (projectParams && !activeProject) return <NotFound />;

  return (
    <div className="site-shell" dir="rtl">
      <header className="site-header">
        <div className="container-wide header-inner">
          <BrandMark />
          <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="التنقل الرئيسي">
            {navigation.map((item) => <a key={item.href} className="nav-link" href={item.href} onClick={closeMenu}>{item.label}</a>)}
          </nav>
          <a href="#contact" className="header-cta">استفسر عن مشروع <ArrowUpLeft size={16} /></a>
          <button type="button" className="menu-toggle" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav className={`mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="قائمة الهاتف">
          {navigation.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}<ArrowLeft size={15} /></a>)}
          <a href="#contact" onClick={closeMenu}>تواصل للاستفسار<ArrowLeft size={15} /></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-blueprint" aria-hidden="true">
            <div className="blueprint-lines" /><span className="blueprint-road road-one" /><span className="blueprint-road road-two" />
            <span className="blueprint-parcel parcel-one" /><span className="blueprint-parcel parcel-two" /><span className="blueprint-parcel parcel-three" />
            <span className="blueprint-mark mark-one" /><span className="blueprint-mark mark-two" /><span className="blueprint-mark mark-three" />
          </div>
          <div className="hero-shade" />
          <div className="hero-topline container-wide"><span className="hero-location"><MapPin size={14} /> جدة، المملكة العربية السعودية</span><span>مقاولات عامة · بنية تحتية</span></div>
          <div className="container-wide hero-content">
            <div className="hero-copy">
              <p className="hero-kicker"><span /> خبرة ميدانية في أعمال البنية التحتية</p>
              <h1 id="hero-title">نبني البنية<br /><em>التي تمضي بها الحياة.</em></h1>
              <p className="hero-description">ديار الخبرة للمقاولات العامة. أعمال مواقع، طرق، وشبكات خدمات تُنفّذ بمنهج واضح من أول تجهيز الموقع إلى تفاصيله العامة.</p>
              <div className="hero-actions">
                <a href="#projects" className="button button-gold">تعرّف على مشروعاتنا <ArrowLeft size={17} /></a>
                <a href="#services" className="hero-text-link">نطاق أعمالنا <ArrowDownLeft size={16} /></a>
              </div>
            </div>
            <div className="hero-brand-stamp"><img src={logo} alt="ديار الخبرة للمقاولات العامة" /><span>DIYAR ALKHEBRA<br />GENERAL CONTRACTING</span></div>
            <div className="hero-coordinates" aria-hidden="true"><span>FIELD / INFRASTRUCTURE</span><span>JEDDAH · SAUDI ARABIA</span></div>
          </div>
          <a href="#projects" className="scroll-cue"><span>انتقل إلى مشروعاتنا</span><ArrowDown size={15} /></a>
        </section>

        <section className="proof-band" aria-label="ملامح نطاق العمل">
          <div className="container-wide proof-inner">
            <p>نطاق متكامل<br /><strong>للموقع والبنية التحتية</strong></p>
            <span className="proof-divider" />
            <p><strong>أعمال ميدانية</strong><br />مرتبطة باحتياج كل مخطط</p>
            <span className="proof-divider" />
            <p><strong>جدة</strong><br />مشروعات ومخططات داخل المدينة</p>
            <span className="proof-note">لا نعرض أرقاماً أو إنجازات غير موثّقة.</span>
          </div>
        </section>

        <section className="projects-section" id="projects" aria-labelledby="projects-title">
          <div className="container-wide">
            <div className="section-heading projects-heading">
              <div><span className="eyebrow">مشروعات مختارة · جدة</span><h2 id="projects-title">مساحات واسعة،<br /><span>وتفاصيل تحت الأرض.</span></h2></div>
              <p>نماذج من نطاقات العمل الواردة في ملف الشركة. تظهر علامات الخريطة لتسهيل الاستكشاف فقط؛ ولا تمثل مواقع المشروع الفعلية.</p>
            </div>
            <div className="map-explainer">
              <span className="map-city"><MapPin size={16} /> جدة <i>— خريطة توضيحية</i></span>
              <p>المواضع تقريبية وغير جغرافية، ولا تصلح للملاحة أو تحديد العناوين.</p>
            </div>
            <div className="projects-map-layout">
              <JeddahCityMap ref={cityMapRef} projects={projects} onSelect={enterProject} activeProject={activeProject} onCloseProject={closeProject} />
              <div className="map-project-list" aria-label="مشروعات الشركة">
                {projects.map((project, index) => (
                  <a href={`/projects/${project.id}`} className="map-project-row" key={project.id} onClick={(event) => enterProject(project.id, event)} data-testid={`link-project-${project.id}`}>
                    <span className="map-project-index">٠{index + 1}</span>
                    <span className="map-project-copy">
                      <span className="map-project-type">{project.type}<span> · {project.city}</span></span>
                      <strong>{project.title}</strong>
                      <small>{project.shortDescription}</small>
                      <small className="project-area">{project.area}</small>
                    </span>
                    <ArrowUpLeft size={18} />
                  </a>
                ))}
                <p className="map-demo-note">مشهد العرض البانورامي توضيحي عام، وليس تصويراً لمواقع مشروعات الشركة. نقاط الخريطة تقريبية.</p>
              </div>
            </div>
            <div className="projects-endnote"><span /> اختر نقطة أو مشروعاً لفتح المشهد البانورامي التوضيحي.</div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="container-wide about-grid">
            <div className="about-index"><span className="eyebrow">من نحن</span><strong>ديار<br />الخبرة</strong><i>مقاولات عامة</i></div>
            <div className="about-main">
              <p className="eyebrow">شركة مقاولات عامة · جدة</p>
              <h2>نعمل حيث تبدأ<br /><span>البنية التحتية.</span></h2>
              <p className="about-lead">ديار الخبرة للمقاولات العامة شركة تعمل في تنفيذ أعمال البنية التحتية وتطوير المواقع. يجمع نطاقها بين الأعمال الترابية والطرق وشبكات المرافق، وصولاً إلى الإنارة وتنسيق المواقع.</p>
              <p className="about-copy">تتطلب مشروعات التطوير تنسيقاً دقيقاً بين عناصر متعددة داخل موقع واحد. لذلك نعرض نطاقاتنا كما هي: أعمال مترابطة تبدأ من تهيئة الأرض وتستمر عبر خدمات الموقع وشبكاته.</p>
            </div>
            <div className="about-side-note"><span>01 / COMPANY PROFILE</span><p>عملٌ يبدأ من الأرض<br />ويخدم المكان كله.</p><MoveUpLeft size={25} /></div>
          </div>
        </section>

        <section className="services-section" id="services" aria-labelledby="services-title">
          <div className="container-wide">
            <div className="section-heading services-heading">
              <div><span className="eyebrow">نطاق الأعمال</span><h2 id="services-title">خدمات مترابطة.<br /><span>موقع يعمل كما خُطّط له.</span></h2></div>
              <p>تتحدد تفاصيل التنفيذ وفق مستندات المشروع ومتطلباته والجهات المعنية.</p>
            </div>
            <div className="services-grid">
              {services.map((service, index) => {
                const Icon = service.icon;
                return <article className="service-card" key={service.title}>
                  <div className="service-top"><span>٠{index + 1}</span><Icon size={23} strokeWidth={1.45} /></div>
                  <h3>{service.title}</h3><p>{service.text}</p>
                  <a href="#contact" aria-label={`استفسر عن ${service.title}`}><ArrowUpLeft size={17} /></a>
                </article>;
              })}
            </div>
            <div className="service-note"><CircleDot size={15} /><span>كما يشمل نطاق الشركة شبكات الهاتف وأعمال المرافق المرتبطة بالموقع.</span></div>
          </div>
        </section>

        <section className="featured-project" aria-labelledby="featured-title">
          <div className="featured-grid-lines" aria-hidden="true" />
          <div className="container-wide featured-inner">
            <div className="featured-label"><span>01</span><span>PROJECT FILE</span></div>
            <div className="featured-content">
              <span className="eyebrow">مثال على تنوع نطاق الأعمال</span>
              <h2 id="featured-title">منصة لمرافق<br /><em>تخدم مخططاً كاملاً.</em></h2>
              <p>في مشروع أبْحر هيلز، يجتمع نطاق البنية التحتية مع الطرق والفراغات العامة. مساحة المخطط وفق ملف الشركة 392,087.60 م²، والمشروع مُدرج تحت التطوير.</p>
              <a href="/projects/abhur-hills" onClick={(event) => enterProject('abhur-hills', event)} className="featured-link">استكشف تفاصيل المشروع <ArrowLeft size={16} /></a>
            </div>
            <div className="featured-spec">
              <span>مخطط أبحر هيلز</span><strong>392,087.60</strong><small>متر مربع · مساحة المخطط</small>
              <i /><span className="status-pill"><span /> تحت التطوير</span>
            </div>
          </div>
        </section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="container-wide approach-grid">
            <div className="approach-heading">
              <span className="eyebrow">منهج التنفيذ</span>
              <h2 id="approach-title">التفاصيل لا تعمل<br /><span>منفصلة عن بعضها.</span></h2>
              <p>تنفيذ أعمال الموقع يتطلب وضوح النطاق وتتابعاً عملياً بين المراحل وتنسيقاً مستمراً بين عناصر البنية التحتية.</p>
              <div className="approach-seal"><HardHat size={26} /><span>عمل ميداني<br />بتنسيق مسؤول</span></div>
            </div>
            <div className="approach-steps">
              <article><span>١</span><div><h3>قراءة الموقع والنطاق</h3><p>مراجعة متطلبات المشروع ومستنداته وحدود الأعمال ذات الصلة.</p></div><Check size={17} /></article>
              <article><span>٢</span><div><h3>تتابع الأعمال</h3><p>تنظيم أعمال التهيئة والشبكات والطرق بما يدعم الترابط بين مكونات الموقع.</p></div><Check size={17} /></article>
              <article><span>٣</span><div><h3>تنسيق التنفيذ</h3><p>متابعة الأعمال الميدانية والتنسيق بين تخصصات المرافق ضمن نطاق المشروع.</p></div><Check size={17} /></article>
              <article><span>٤</span><div><h3>مراجعة النطاق</h3><p>التحقق من الأعمال المنفذة وفق المتطلبات والمستندات المعتمدة للمشروع.</p></div><Check size={17} /></article>
            </div>
          </div>
        </section>

        <section className="credentials-section">
          <div className="container-wide credentials-inner">
            <BadgeCheck size={27} strokeWidth={1.3} />
            <div><span className="eyebrow">من ملف الشركة</span><h2>معلومات المشاريع كما وردت.</h2></div>
            <p>نحافظ على وصف دقيق للحالة والمساحة ونطاق العمل. لا تُعرض المشروعات على أنها مكتملة ما لم يرد ذلك صراحةً في المصدر.</p>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-pattern" aria-hidden="true" />
          <div className="container-wide contact-grid">
            <div className="contact-copy"><span className="eyebrow">خطوة الاستفسار الأولى</span><h2 id="contact-title">لديك مشروع؟<br /><em>لنبدأ من نطاقه.</em></h2><p>أرسل نبذة عن المشروع ونطاق الأعمال المطلوب، وسيتضح مسار التواصل المناسب. لا تتوفر بيانات هاتف أو بريد منشورة في هذه الصفحة.</p></div>
            <div className="contact-panel">
              <span className="contact-number">01 — INQUIRY</span>
              <h3>استفسار عام</h3>
              <p>للاستفسارات المتعلقة بمشروعات البنية التحتية والمقاولات العامة.</p>
              <button type="button" className="inquiry-link" onClick={() => {
                const request = 'السلام عليكم، أرغب بالاستفسار عن مشروع مقاولات عامة / بنية تحتية. نبذة المشروع: ';
                if (navigator.clipboard?.writeText) {
                  void navigator.clipboard.writeText(request).then(() => setInquiryCopied(true), () => setInquiryCopied(false));
                } else {
                  const field = document.createElement('textarea');
                  field.value = request;
                  field.setAttribute('readonly', '');
                  field.style.position = 'fixed';
                  field.style.opacity = '0';
                  document.body.appendChild(field);
                  field.select();
                  setInquiryCopied(document.execCommand('copy'));
                  field.remove();
                }
              }} aria-label="نسخ صيغة استفسار عام">
                {inquiryCopied ? 'نُسخت صيغة الاستفسار — أرسلها عبر قناة الشركة المعتمدة' : 'انسخ صيغة استفسار عام'} <ArrowLeft size={17} />
              </button>
              <small>بيانات التواصل المباشرة غير منشورة هنا. الصيغة المنسوخة لا تُرسل تلقائياً؛ أرسلها إلى الشركة عبر قناتها المعتمدة.</small>
            </div>
          </div>
          <div className="container-wide contact-bottom"><span>ديار الخبرة للمقاولات العامة</span><i /><span>DIYAR ALKHEBRA GENERAL CONTRACTING</span></div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container-wide footer-inner"><BrandMark compact /><p>أعمال بنية تحتية ومقاولات عامة · جدة</p><a href="#home" className="back-top">العودة للأعلى <ArrowUpLeft size={15} /></a></div>
      </footer>
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/projects/:id" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
