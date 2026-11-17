import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpLeft,
  BadgeCheck,
  Building2,
  Check,
  ClipboardCheck,
  Compass,
  HardHat,
  Layers3,
  MapPin,
  Menu,
  Ruler,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useRoute,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import heroImage from './assets/architecture-hero.jpg';
import { projects } from './projects';
import JeddahCityMap, { type JeddahCityMapHandle } from './JeddahCityMap';

const queryClient = new QueryClient();

const navigation = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'مشروعات مختارة', href: '#projects' },
  { label: 'من نحن', href: '#about' },
  { label: 'خدماتنا', href: '#services' },
  { label: 'منهجنا', href: '#approach' },
];

function BrandMark() {
  return (
    <a href="#home" className="brand" aria-label="مدار للمقاولات — الصفحة الرئيسية" data-testid="link-brand-home">
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 42 42" fill="none">
          <path d="M6 32.5V10.8L21 4l15 6.8v21.7" stroke="currentColor" strokeWidth="1.7" />
          <path d="M13 32.5V16l8-3.7 8 3.7v16.5M5 32.5h32M18 32.5V23h6v9.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M21 4v8.3" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>مدار</strong>
        <small>للمقاولات</small>
      </span>
    </a>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [, projectParams] = useRoute('/projects/:id');
  const cityMapRef = useRef<JeddahCityMapHandle>(null);
  const projectNavigationPending = useRef(false);
  const activeProject = projects.find((project) => project.id === projectParams?.id) ?? null;

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('.site-shell main > section:not(.hero)'),
    );
    sections.forEach((section) => section.classList.add('section-reveal'));

    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in-view');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeProject) return;
    document.getElementById('projects')?.scrollIntoView({
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
    window.setTimeout(() => {
      document.getElementById('projects')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'center',
      });
    }, 0);
  };

  const enterProject = (
    projectId: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    if (projectNavigationPending.current) return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !cityMapRef.current
    ) {
      navigateToProject(projectId);
      return;
    }

    projectNavigationPending.current = true;
    void cityMapRef.current
      .flyToProject(projectId)
      .then(() => navigateToProject(projectId), () => navigateToProject(projectId));
  };

  if (projectParams && !activeProject) return <NotFound />;

  return (
    <div className="site-shell grain" dir="rtl">
      <header className="site-header">
        <div className="container-wide header-inner">
          <BrandMark />
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="التنقل الرئيسي">
            {navigation.map((item) => (
              <a
                key={item.href}
                className="nav-link"
                href={item.href}
                onClick={closeMenu}
                data-testid={`link-nav-${item.href.slice(1)}`}
              >
                {item.label}
              </a>
            ))}
            <a className="mobile-nav-cta" href="#contact" onClick={closeMenu} data-testid="link-mobile-contact">
              تواصل معنا <ArrowLeft size={16} aria-hidden="true" />
            </a>
          </nav>
          <a href="#contact" className="header-cta" data-testid="link-header-contact">
            <span>لنبدأ مشروعك</span>
            <ArrowUpLeft size={16} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            data-testid="button-menu-toggle"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
        <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="قائمة الهاتف">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMenu} data-testid={`link-mobile-${item.href.slice(1)}`}>
              {item.label}<ArrowLeft size={15} aria-hidden="true" />
            </a>
          ))}
          <a href="#contact" onClick={closeMenu} data-testid="link-mobile-nav-contact">
            تواصل معنا<ArrowLeft size={15} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home" aria-labelledby="hero-title">
          <div className="hero-image-wrap">
            <img src={heroImage} alt="مبنى حديث قيد الإنشاء بواجهات حجرية وأعمدة واضحة" className="hero-image" />
          </div>
          <div className="hero-shade" />
          <div className="container-wide hero-content">
            <div className="hero-copy">
              <p className="hero-kicker reveal"><span /> من الفكرة إلى المكان</p>
              <h1 id="hero-title" className="reveal reveal-delay-1">
                نبني ما<br />
                <em>يدوم.</em>
              </h1>
              <p className="hero-description reveal reveal-delay-2">
                مدار للمقاولات، شريكك في تحويل المخططات إلى واقع متقن؛
                بعناية تبدأ من أول تفصيلة ولا تنتهي عند تسليم المفتاح.
              </p>
              <div className="hero-actions reveal reveal-delay-2">
                <a href="#projects" className="button button-light" data-testid="link-hero-projects">
                  اكتشف أعمالنا <ArrowLeft size={17} aria-hidden="true" />
                </a>
                <a href="#about" className="hero-text-link" data-testid="link-hero-about">
                  تعرّف على مدار <ArrowDown size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="hero-side-note" aria-hidden="true">
              <span>مدار للمقاولات</span>
              <span className="hero-side-line" />
              <span>حيث تبدأ الحكاية</span>
            </div>
            <div className="hero-index" aria-hidden="true">
              <span>٠١</span><span className="index-line" /><span>٠٦</span>
            </div>
          </div>
          <a href="#projects" className="scroll-cue" aria-label="انتقل إلى مشروعات مدار" data-testid="link-scroll-projects">
            <span>استكشف مشروعاتنا</span><ArrowDown size={15} aria-hidden="true" />
          </a>
        </section>

        <section className="projects-section" id="projects" aria-labelledby="projects-title">
          <div className="container-wide">
            <div className="projects-heading">
              <div>
                <span className="eyebrow">مساحات لها معنى</span>
                <h2 id="projects-title" className="section-title">أعمال تبدأ<br />بـ <span>رؤية واضحة.</span></h2>
              </div>
              <p>نماذج بصرية توضيحية لمشروعات مدار.<br />تُستبدل بصور وأعمال الشركة المعتمدة.</p>
            </div>
            <div className="map-explainer">
              <span className="map-city"><MapPin size={16} aria-hidden="true" /> مدينة جدة</span>
              <p>مجسّم ثلاثي الأبعاد توضيحي لجدة؛ مواقع المشروعات تقريبية وليست عناوين فعلية.</p>
            </div>
            <div className="projects-map-layout">
              <JeddahCityMap
                ref={cityMapRef}
                projects={projects}
                onSelect={enterProject}
                activeProject={activeProject}
                onCloseProject={closeProject}
              />
              <div className="map-project-list" aria-label="مشاهد افتراضية">
                {projects.map((project, index) => (
                  <a href={`/projects/${project.id}`} className="map-project-row" key={project.id} onClick={(event) => enterProject(project.id, event)} data-testid={`link-project-${project.id}`}>
                    <span className="map-project-index">٠{index + 1}</span>
                    <span className="map-project-copy">
                      <span className="map-project-type">{project.type} <span>— {project.city}</span></span>
                      <strong>{project.title}</strong>
                      <small>{project.shortDescription}</small>
                    </span>
                    <ArrowUpLeft size={18} aria-hidden="true" />
                  </a>
                ))}
                <p className="map-demo-note">جميع المشاهد والصور والنقاط هنا لأغراض العرض التجريبي فقط.</p>
              </div>
            </div>
            <div className="projects-endnote"><span /> اختر نقطة لاستكشاف مشهد بانورامي بزاوية ٣٦٠°.</div>
          </div>
        </section>

        <section className="intro-section" id="about" aria-labelledby="about-title">
          <div className="container-wide intro-grid">
            <div className="intro-aside">
              <span className="eyebrow">مدار في سطور</span>
              <div className="intro-stamp" aria-hidden="true">
                <span>فكرة</span><span className="stamp-line" /><span>مكان</span>
              </div>
            </div>
            <div className="intro-main">
              <h2 id="about-title" className="section-title">
                نبني بعقلٍ<br />يرى <span>ما وراء المخطط.</span>
              </h2>
              <div className="intro-bottom">
                <p>
                  في مدار، نؤمن أن البناء الجيد يبدأ بالإنصات. نفهم احتياج كل عميل،
                  ونوازن بين الرؤية والواقع، ثم نمضي بخطوات مدروسة نحو مساحة تعمل
                  كما ينبغي وتبقى جميلة مع الزمن.
                </p>
                <a href="#approach" className="underlined-link" data-testid="link-about-approach">
                  كيف نعمل <ArrowLeft size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="intro-note">
              <span className="note-number">مـ / ٠١</span>
              <p>شريك مسؤول<br />في كل مرحلة.</p>
              <span className="note-rule" />
            </div>
          </div>
        </section>

        <section className="services-section" id="services" aria-labelledby="services-title">
          <div className="container-wide">
            <div className="section-heading-row">
              <div>
                <span className="eyebrow">ما نتقنه</span>
                <h2 id="services-title" className="section-title">حلول متكاملة،<br /><span>من أول خط.</span></h2>
              </div>
              <p className="section-intro">
                خدمات مترابطة تمنح المشروع مساراً واضحاً؛ من دراسة الاحتياج حتى أدق
                أعمال التنفيذ والتشطيب.
              </p>
            </div>
            <div className="services-list">
              <article className="service-row" data-testid="service-construction">
                <span className="service-number">٠١</span>
                <span className="service-icon"><Building2 size={25} strokeWidth={1.5} /></span>
                <div className="service-copy">
                  <h3>تنفيذ المباني</h3>
                  <p>أعمال إنشائية ومعمارية للمشروعات السكنية والتجارية، بتنسيق دقيق بين الفرق والمراحل.</p>
                </div>
                <a href="#contact" aria-label="استفسر عن تنفيذ المباني" className="service-arrow" data-testid="link-service-construction"><ArrowUpLeft size={19} /></a>
              </article>
              <article className="service-row" data-testid="service-fitout">
                <span className="service-number">٠٢</span>
                <span className="service-icon"><Ruler size={25} strokeWidth={1.5} /></span>
                <div className="service-copy">
                  <h3>التشطيبات الداخلية</h3>
                  <p>اختيار المواد، ضبط التفاصيل، وتنفيذ المساحات بما يترجم الرؤية إلى تجربة يومية.</p>
                </div>
                <a href="#contact" aria-label="استفسر عن التشطيبات الداخلية" className="service-arrow" data-testid="link-service-fitout"><ArrowUpLeft size={19} /></a>
              </article>
              <article className="service-row" data-testid="service-management">
                <span className="service-number">٠٣</span>
                <span className="service-icon"><ClipboardCheck size={25} strokeWidth={1.5} /></span>
                <div className="service-copy">
                  <h3>إدارة المشروع</h3>
                  <p>تنظيم النطاق والجدول والتنسيق بين الأطراف، مع متابعة واضحة في كل نقطة تسليم.</p>
                </div>
                <a href="#contact" aria-label="استفسر عن إدارة المشروع" className="service-arrow" data-testid="link-service-management"><ArrowUpLeft size={19} /></a>
              </article>
              <article className="service-row" data-testid="service-renovation">
                <span className="service-number">٠٤</span>
                <span className="service-icon"><Layers3 size={25} strokeWidth={1.5} /></span>
                <div className="service-copy">
                  <h3>التجديد وإعادة التأهيل</h3>
                  <p>تطوير المباني القائمة بعناية، واحترام ما فيها من قيمة، وإعدادها لاحتياجات جديدة.</p>
                </div>
                <a href="#contact" aria-label="استفسر عن التجديد وإعادة التأهيل" className="service-arrow" data-testid="link-service-renovation"><ArrowUpLeft size={19} /></a>
              </article>
            </div>
            <p className="service-footnote">تُحدّد نطاقات الخدمات النهائية وفق احتياج المشروع واتفاق الطرفين.</p>
          </div>
        </section>

        <section className="approach-section" id="approach" aria-labelledby="approach-title">
          <div className="container-wide approach-grid">
            <div className="approach-visual">
              <div className="approach-image">
                <img src={heroImage} alt="تفاصيل واجهة حجرية وأعمدة في موقع بناء" />
                <div className="visual-label"><span>من الموقع</span><span>تفاصيل تصنع الفرق</span></div>
              </div>
              <div className="approach-stamp" aria-hidden="true"><Compass size={28} strokeWidth={1.25} /><span>على<br />مسارٍ واضح</span></div>
            </div>
            <div className="approach-content">
              <span className="eyebrow">طريقتنا في العمل</span>
              <h2 id="approach-title" className="section-title">ثقة تُبنى<br /><span>خطوة بخطوة.</span></h2>
              <p className="approach-lead">لا نختصر الطريق على حساب النتيجة. نعمل بإيقاع منظم، ونبقي الصورة واضحة أمامك من البداية وحتى التسليم.</p>
              <div className="principles">
                <div className="principle">
                  <span className="principle-icon"><HardHat size={20} strokeWidth={1.5} /></span>
                  <div><h3>سلامة قبل كل شيء</h3><p>ممارسات عمل مسؤولة واهتمام بموقع آمن ومنظم.</p></div>
                  <Check size={17} className="principle-check" aria-hidden="true" />
                </div>
                <div className="principle">
                  <span className="principle-icon"><BadgeCheck size={20} strokeWidth={1.5} /></span>
                  <div><h3>جودة يمكن ملاحظتها</h3><p>مراجعة الأعمال والتفاصيل وفق النطاق المتفق عليه.</p></div>
                  <Check size={17} className="principle-check" aria-hidden="true" />
                </div>
                <div className="principle">
                  <span className="principle-icon"><ShieldCheck size={20} strokeWidth={1.5} /></span>
                  <div><h3>وضوح في التواصل</h3><p>تحديثات منتظمة وقرارات موثقة طوال رحلة المشروع.</p></div>
                  <Check size={17} className="principle-check" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="process-section" aria-labelledby="process-title">
          <div className="container-wide">
            <div className="process-head">
              <span className="eyebrow">رحلة المشروع</span>
              <h2 id="process-title" className="section-title">من أول سؤال<br />إلى <span>آخر تفصيلة.</span></h2>
              <p>خطوات عملية تمنح كل طرف فهماً مشتركاً لما سيحدث تالياً.</p>
            </div>
            <div className="process-steps">
              <article className="process-step">
                <span className="step-index">المرحلة ٠١</span><span className="step-line" />
                <h3>نستمع ونفهم</h3><p>نجمع احتياجاتك، نراجع الموقع والمخططات، ونحدد ما يهم المشروع فعلاً.</p>
              </article>
              <article className="process-step">
                <span className="step-index">المرحلة ٠٢</span><span className="step-line" />
                <h3>نخطط ونتفق</h3><p>نوضح نطاق العمل والمراحل والتوقعات قبل أن تبدأ أعمال التنفيذ.</p>
              </article>
              <article className="process-step">
                <span className="step-index">المرحلة ٠٣</span><span className="step-line" />
                <h3>ننفذ ونتابع</h3><p>ننسق الفرق، نراجع جودة الأعمال، ونبقيك على اطلاع بتقدم المشروع.</p>
              </article>
              <article className="process-step">
                <span className="step-index">المرحلة ٠٤</span><span className="step-line" />
                <h3>نراجع ونسلّم</h3><p>نتحقق من التفاصيل، نعالج الملاحظات، ونسلّم وفق ما تم الاتفاق عليه.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <div className="contact-ornament" aria-hidden="true"><span /><span /><span /></div>
          <div className="container-wide contact-grid">
            <div className="contact-copy">
              <span className="eyebrow">خطوتك الأولى</span>
              <h2 id="contact-title">عندك فكرة؟<br /><em>لنبنِها معاً.</em></h2>
              <p>أخبرنا عن مشروعك، وسنبدأ بحوار واضح حول احتياجك والخطوة المناسبة التالية.</p>
              <a href="#contact-details" className="button button-light contact-button" data-testid="link-contact-details">
                تفاصيل التواصل <ArrowLeft size={17} aria-hidden="true" />
              </a>
            </div>
            <div className="contact-details" id="contact-details">
              <div className="contact-detail">
                <span className="detail-index">أ</span>
                <div><span className="detail-label">المقر</span><p>يُضاف عنوان المقر المعتمد هنا</p></div>
              </div>
              <div className="contact-detail">
                <span className="detail-index">ب</span>
                <div><span className="detail-label">الهاتف</span><p>يُضاف رقم التواصل المعتمد هنا</p></div>
              </div>
              <div className="contact-detail">
                <span className="detail-index">ج</span>
                <div><span className="detail-label">البريد الإلكتروني</span><p>يُضاف البريد الرسمي هنا</p></div>
              </div>
              <p className="contact-replace-note">تُستكمل بيانات التواصل بعد اعتماد معلومات الشركة.</p>
            </div>
          </div>
          <div className="contact-bottom container-wide">
            <span>مدار للمقاولات</span><span className="contact-bottom-line" /><span>نحو بناءٍ يدوم</span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container-wide footer-inner">
          <BrandMark />
          <p>مدار للمقاولات <span>—</span> صفحة تعريفية قابلة للتخصيص</p>
          <a href="#home" className="back-top" data-testid="link-back-top">إلى الأعلى <ArrowUpLeft size={16} aria-hidden="true" /></a>
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects/:id" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
