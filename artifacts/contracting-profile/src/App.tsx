import { lazy, type ReactNode, Suspense, useEffect, useRef, useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import {
  ArrowLeft, ArrowUpLeft, Check, Download, Droplets, HardHat, Layers3, Menu,
  Route as RouteIcon, ShieldCheck, Signpost, X, Zap,
} from 'lucide-react';
import { Route, Switch, useRoute, useLocation, Router as WouterRouter } from 'wouter';
import logo from './assets/diyar-logo.webp';
import { formatNumber, projects, totalAreaM2 } from './projects';
import Credentials from '@/components/site/Credentials';
import PartnersStrip from '@/components/site/PartnersStrip';
import ProjectsSection from '@/components/site/ProjectsSection';
import SiteFooter from '@/components/site/SiteFooter';
import WhatsAppFloat from '@/components/site/WhatsAppFloat';
import CredentialsPage from '@/pages/credentials';

const ContactSection = lazy(() => import('@/components/site/ContactSection'));
const ProjectModal = lazy(() => import('@/components/site/ProjectModal'));
const heroPhoto = `${import.meta.env.BASE_URL}hero-finished.webp`;
const heroPhotoSmall = `${import.meta.env.BASE_URL}hero-finished-sm.webp`;

const navigation = [
  { label: 'المشروعات', href: '#projects' },
  { label: 'نطاق الأعمال', href: '#services' },
  { label: 'منهج التنفيذ', href: '#approach' },
  { label: 'عن ديار الخبرة', href: '#about' },
];

const services = [
  { title: 'تهيئة الموقع والأعمال الترابية', text: 'تنظيف الموقع، التسوية، وأعمال الحفر والردم والقطع والإحلال ضمن نطاق المشروع.', icon: Layers3 },
  { title: 'الطرق والفراغات العامة', text: 'تنفيذ الطرق والأرصفة والرصف، وعناصر تنظيم الحركة واللوحات المرورية.', icon: RouteIcon },
  { title: 'شبكات المياه والصرف', text: 'شبكات المياه والصرف الصحي، وربط المياه وفق متطلبات الجهة المعنية ونطاق العمل.', icon: Droplets },
  { title: 'شبكات الحريق وتصريف الأمطار', text: 'أعمال شبكات مكافحة الحريق وتصريف مياه الأمطار ضمن بنية الموقع التحتية.', icon: ShieldCheck },
  { title: 'الكهرباء والإنارة', text: 'شبكات الجهد المنخفض والمتوسط ومحطات التوزيع، وإنارة الشوارع والمساحات الخارجية.', icon: Zap },
  { title: 'تنسيق المواقع والري', text: 'التشجير والحدائق وألعاب الأطفال والمظلات وشبكات الري، إلى جانب شبكات الهاتف.', icon: Signpost },
];

const steps = [
  { title: 'قراءة الموقع والنطاق', text: 'مراجعة متطلبات المشروع ومستنداته وحدود الأعمال ذات الصلة.' },
  { title: 'تتابع الأعمال', text: 'تنظيم أعمال التهيئة والشبكات والطرق بما يدعم الترابط بين مكونات الموقع.' },
  { title: 'تنسيق التنفيذ', text: 'متابعة الأعمال الميدانية والتنسيق بين تخصصات المرافق ضمن نطاق المشروع.' },
  { title: 'الاستلام والتسليم', text: 'التحقق من الأعمال المنفذة وفق المتطلبات والمستندات المعتمدة، وصولاً إلى محاضر الاستلام.' },
];

const completedCount = projects.filter((project) => project.status === 'منفّذ').length;

function BrandMark() {
  return (
    <a href="#home" className="brand" aria-label="ديار الخبرة للمقاولات العامة — الرئيسية" data-testid="link-brand-home">
      <span className="brand-logo-wrap"><img src={logo} alt="" width={50} height={46} /></span>
      <span className="brand-copy" dir="rtl">
        <strong>ديار الخبرة</strong>
        <small>للمقاولات العامة</small>
      </span>
    </a>
  );
}

function DeferredContact({ inquiry }: { inquiry: { details: string } | null }) {
  const placeholder = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible || inquiry) return;
    const target = placeholder.current;
    if (!target || !('IntersectionObserver' in window) || window.location.hash === '#contact') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { rootMargin: '400px 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, [visible, inquiry]);

  const fallback = <section ref={placeholder} className="contact-section contact-skeleton" id="contact" aria-busy="true" />;
  if (!visible && !inquiry) return fallback;
  return <Suspense fallback={fallback}><ContactSection inquiry={inquiry} /></Suspense>;
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiry, setInquiry] = useState<{ details: string } | null>(null);
  const [, setLocation] = useLocation();
  const [, projectParams] = useRoute('/projects/:id');
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
    if (activeProject) document.title = `${activeProject.title} | ديار الخبرة للمقاولات العامة`;
    else document.title = 'ديار الخبرة للمقاولات العامة | بنية تحتية وأعمال مواقع في جدة';
  }, [activeProject]);

  const closeMenu = () => setMenuOpen(false);
  const openProject = (projectId: string) => setLocation(`/projects/${projectId}`);
  const closeProject = () => setLocation('/');
  const inquireAboutProject = (details: string) => {
    setInquiry({ details });
    setLocation('/#contact');
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
          <a href="#contact" className="site-action site-action-green header-cta" data-testid="link-header-inquiry">استفسر عن مشروع <ArrowLeft size={16} /></a>
          <button type="button" className="menu-toggle" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} data-testid="button-menu-toggle">
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
        <nav className={`mobile-nav${menuOpen ? ' is-open' : ''}`} aria-label="قائمة الهاتف">
          {navigation.map((item) => <a key={item.href} href={item.href} onClick={closeMenu}>{item.label}<ArrowLeft size={15} /></a>)}
          <a href="#contact" onClick={closeMenu}>استفسر عن مشروع<ArrowLeft size={15} /></a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-blueprint" aria-hidden="true">
            <div className="blueprint-lines" /><span className="blueprint-road road-one" /><span className="blueprint-road road-two" />
          </div>
          <div className="hero-shade" />
          <div className="container-wide hero-content">
            <div className="hero-copy">
              <p className="hero-kicker"><span /> خبرة ميدانية في أعمال البنية التحتية · جدة</p>
              <h1 id="hero-title">نبني البنية <em>التي تمضي بها الحياة.</em></h1>
              <p className="hero-description">ديار الخبرة للمقاولات العامة. أعمال مواقع، طرق، وشبكات خدمات تُنفّذ بمنهج واضح من أول تجهيز الموقع إلى تفاصيله العامة.</p>
              <div className="hero-actions">
                <a href="#contact" className="site-action site-action-gold" data-testid="link-hero-inquiry">استفسر عن مشروعك <ArrowLeft size={17} /></a>
                <a href="#projects" className="hero-text-link" data-testid="link-hero-projects">تعرّف على مشروعاتنا <ArrowUpLeft size={16} /></a>
              </div>
            </div>
            <figure className="hero-photo">
              <picture>
                <source media="(max-width: 767px)" srcSet={heroPhotoSmall} />
                <img src={heroPhoto} alt="طريق مرصوف ومضاء في مخطط الهملان بجدة بعد التنفيذ" width={1074} height={599} fetchPriority="high" />
              </picture>
              <figcaption>مخطط الهملان 674 ج/س — الطرق والإنارة بعد التنفيذ</figcaption>
            </figure>
          </div>
        </section>

        <section className="trust-strip" aria-label="أرقام من ملف الشركة">
          <div className="container-wide trust-inner">
            <div className="trust-item"><strong><bdi dir="ltr">{formatNumber(Math.round(totalAreaM2))}</bdi></strong><span>إجمالي مساحات المشروعات المدرجة (م²)</span></div>
            <div className="trust-item"><strong>{projects.length}</strong><span>مشروعاً في ملف الشركة، منها {completedCount} منفّذة</span></div>
            <div className="trust-item"><strong>جدة</strong><span>جميع المشروعات داخل المدينة</span></div>
            <div className="trust-item"><strong>NWC</strong><span>اعتمادات لدى شركة المياه الوطنية وأمانة جدة</span></div>
          </div>
        </section>

        <PartnersStrip />

        <ProjectsSection onOpenProject={openProject} />

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
                  <div className="service-top"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={23} strokeWidth={1.45} /></div>
                  <h3>{service.title}</h3><p>{service.text}</p>
                  <a href="#contact" aria-label={`استفسر عن ${service.title}`} data-testid={`link-service-${index + 1}`}><ArrowUpLeft size={17} /></a>
                </article>;
              })}
            </div>
          </div>
        </section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="container-wide approach-grid">
            <div className="approach-heading">
              <span className="eyebrow">منهج التنفيذ</span>
              <h2 id="approach-title">التفاصيل لا تعمل <span>منفصلة عن بعضها.</span></h2>
              <p>تنفيذ أعمال الموقع يتطلب وضوح النطاق وتتابعاً عملياً بين المراحل وتنسيقاً مستمراً بين عناصر البنية التحتية.</p>
              <div className="approach-seal"><HardHat size={26} /><span>عمل ميداني<br />بتنسيق مسؤول</span></div>
            </div>
            <div className="approach-steps">
              {steps.map((step, index) => (
                <article key={step.title}><span>{index + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div><Check size={17} /></article>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="container-wide about-layout">
            <div className="about-main">
              <span className="eyebrow">عن ديار الخبرة</span>
              <h2 id="about-title">نعمل حيث تبدأ <span>البنية التحتية.</span></h2>
              <p className="about-lead">ديار الخبرة للمقاولات العامة شركة سعودية مقرها جدة، تنفّذ أعمال البنية التحتية وتطوير المخططات: من التسويات والطرق إلى شبكات المياه والصرف والكهرباء والإنارة وتنسيق المواقع، بفريق من المهندسين والفنيين وإدارات للمشاريع والجودة والمساحة والمعدات.</p>
              <a href={`${import.meta.env.BASE_URL}diyar-alkhebra-profile.pdf`} download className="site-action site-action-green profile-download" data-testid="link-download-profile"><Download size={17} /> تحميل ملف الشركة <small>PDF · 4.6 MB</small></a>
            </div>
            <Credentials />
          </div>
        </section>

        <DeferredContact inquiry={inquiry} />
      </main>
      <SiteFooter links={navigation} />
      <WhatsAppFloat />
      {activeProject && <Suspense fallback={null}><ProjectModal project={activeProject} onClose={closeProject} onInquire={inquireAboutProject} /></Suspense>}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/credentials" component={CredentialsPage} /><Route path="/projects/:id" component={Home} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter>;
}

export default App;
