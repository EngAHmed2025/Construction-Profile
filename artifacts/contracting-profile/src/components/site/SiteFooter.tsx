import { ArrowUpLeft, Download } from 'lucide-react';
import { contactConfig } from '@/contact';
import logo from '@/assets/diyar-logo.webp';

type FooterLink = { label: string; href: string };

export default function SiteFooter({ links }: { links: FooterLink[] }) {
  return (
    <footer className="site-footer">
      <div className="container-wide footer-grid">
        <div className="footer-brand">
          <a href="#home" className="footer-logo" data-testid="link-footer-home">
            <img src={logo} alt="" width={64} height={58} loading="lazy" />
            <span><strong>ديار الخبرة للمقاولات العامة</strong><small dir="ltr">DIYAR ALKHEBRA GENERAL CONTRACTING</small></span>
          </a>
          <p>أعمال البنية التحتية وتطوير المواقع في جدة: تهيئة، طرق، شبكات مرافق، إنارة، وتنسيق مواقع.</p>
        </div>
        <nav className="footer-col" aria-label="روابط سريعة">
          <h2>روابط سريعة</h2>
          {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          <a href="#contact">تواصل معنا</a>
          <a href={`${import.meta.env.BASE_URL}diyar-alkhebra-profile.pdf`} download data-testid="link-footer-profile"><Download size={15} /> تحميل ملف الشركة (PDF)</a>
        </nav>
        <div className="footer-col">
          <h2>التواصل</h2>
          <p><span>الهاتف</span><a href={contactConfig.phoneHref} dir="ltr" data-testid="link-footer-phone">{contactConfig.phone}</a></p>
          <p><span>الموقع</span><a href={contactConfig.websiteHref} target="_blank" rel="noopener noreferrer" dir="ltr">{contactConfig.website}</a></p>
          <p><span>العنوان</span>{contactConfig.address}</p>
          <p><span>السجل التجاري</span><bdi data-testid="text-footer-cr">{contactConfig.commercialRegistration}</bdi></p>
        </div>
      </div>
      <div className="container-wide footer-base">
        <span className="footer-copyright">جميع حقوق النشر محفوظة لشركة ديار الخبرة للمقاولات العامة <bdi>2026</bdi></span>
        <a href="#home" className="back-top" data-testid="link-back-top">العودة للأعلى <ArrowUpLeft size={15} /></a>
      </div>
    </footer>
  );
}
