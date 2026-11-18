import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, ArrowUpLeft, Building2, Check, Copy, FileBadge, Globe, MapPin, Phone, Send } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { contactConfig, whatsappUrl } from '@/contact';
import WhatsAppIcon from './WhatsAppIcon';

export const projectTypes = ['بنية تحتية', 'طرق', 'شبكات مياه وصرف', 'كهرباء وإنارة', 'تنسيق مواقع', 'أخرى'] as const;

const schema = z.object({
  name: z.string().trim().min(2, 'اكتب الاسم'),
  phone: z.string().trim().refine((value) => /^(?:\+?966|0)?5\d{8}$/.test(value.replace(/[\s-]/g, '')), 'أدخل رقم جوال سعودي صحيح، مثل 05XXXXXXXX'),
  projectType: z.enum(projectTypes, { errorMap: () => ({ message: 'اختر نوع المشروع' }) }),
  details: z.string().trim().min(10, 'أضف نبذة قصيرة (10 أحرف على الأقل)').max(800, 'النبذة طويلة؛ اختصرها إلى 800 حرف'),
});
type InquiryValues = z.infer<typeof schema>;

const formatMessage = (values: InquiryValues) => [
  'السلام عليكم، أرغب في الاستفسار عن مشروع',
  '',
  `الاسم: ${values.name}`,
  `رقم الجوال: ${values.phone}`,
  `نوع المشروع: ${values.projectType}`,
  `نبذة عن المشروع: ${values.details}`,
].join('\n');

function ContactCard({ icon, label, value, href, ltr = false, primary = false, testId }: {
  icon: ReactNode; label: string; value: string; href?: string; ltr?: boolean; primary?: boolean; testId: string;
}) {
  const external = href?.startsWith('https://');
  const className = `contact-detail${primary ? ' contact-detail-primary' : ''}`;
  const content = (
    <>
      <span className="contact-detail-icon" aria-hidden="true">{icon}</span>
      <span className="contact-detail-copy">
        <small>{label}</small>
        <strong><bdi dir={ltr ? 'ltr' : 'rtl'}>{value}</bdi></strong>
      </span>
      {href && <ArrowUpLeft size={16} className="contact-detail-arrow" aria-hidden="true" />}
    </>
  );
  return href
    ? <a className={className} data-testid={testId} href={href}
        target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{content}</a>
    : <div className={className} data-testid={testId}>{content}</div>;
}

export default function ContactSection({ inquiry }: { inquiry: { details: string } | null }) {
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const form = useForm<InquiryValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', projectType: undefined, details: '' },
  });

  const { setFocus, setValue } = form;
  useEffect(() => {
    if (!inquiry) return;
    setValue('details', inquiry.details, { shouldDirty: true });
    document.getElementById('contact')?.scrollIntoView({ block: 'start' });
    setFocus('details');
  }, [inquiry, setFocus, setValue]);

  const onSubmit = (values: InquiryValues) => {
    const message = formatMessage(values);
    const url = whatsappUrl(message);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setPendingMessage(null);
      return;
    }
    setCopied(false);
    setPendingMessage(message);
  };

  const copyMessage = () => {
    if (!pendingMessage) return;
    void navigator.clipboard?.writeText(pendingMessage).then(() => setCopied(true), () => setCopied(false));
  };

  const whatsappReady = Boolean(contactConfig.whatsapp);

  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-pattern" aria-hidden="true" />
      <div className="container-wide contact-grid">
        <div className="contact-copy">
          <span className="eyebrow">تواصل معنا</span>
          <h2 id="contact-title">لديك مشروع؟<br /><em>لنبدأ من نطاقه.</em></h2>
          <p>اتصل بنا مباشرة، أو جهّز نبذة عن مشروعك ونوع الأعمال المطلوبة من خلال النموذج.</p>
          <div className="contact-details" aria-label="بيانات التواصل">
            <ContactCard icon={<Phone size={19} />} label="اتصل بنا" value={contactConfig.phone} href={contactConfig.phoneHref} ltr primary testId="text-contact-phone" />
            <ContactCard icon={<Globe size={19} />} label="الموقع الإلكتروني" value={contactConfig.website} href={contactConfig.websiteHref} ltr testId="text-contact-website" />
            <ContactCard icon={<MapPin size={19} />} label="العنوان" value={contactConfig.address} testId="text-contact-address" />
            <ContactCard icon={<FileBadge size={19} />} label="السجل التجاري" value={contactConfig.commercialRegistration} ltr testId="text-contact-cr" />
          </div>
        </div>

        <div className="contact-panel">
          <div className="contact-panel-head">
            <Building2 size={20} strokeWidth={1.6} />
            <div><h3>تواصل معانا</h3></div>
          </div>
          <Form {...form}>
            <form className="inquiry-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="inquiry-field">
                  <FormLabel>الاسم</FormLabel>
                  <FormControl><input {...field} autoComplete="name" placeholder="الاسم الكامل" data-testid="input-inquiry-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem className="inquiry-field">
                  <FormLabel>رقم الجوال</FormLabel>
                  <FormControl><input {...field} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="05XXXXXXXX" data-testid="input-inquiry-phone" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="projectType" render={({ field }) => (
                <FormItem className="inquiry-field inquiry-field-wide">
                  <FormLabel>نوع المشروع</FormLabel>
                  <FormControl>
                    <select {...field} value={field.value ?? ''} data-testid="select-inquiry-type">
                      <option value="" disabled>اختر نوع المشروع</option>
                      {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="details" render={({ field }) => (
                <FormItem className="inquiry-field inquiry-field-wide">
                  <FormLabel>نبذة عن المشروع</FormLabel>
                  <FormControl><textarea {...field} rows={4} placeholder="الموقع، المساحة التقريبية، ونطاق الأعمال المطلوب" data-testid="input-inquiry-details" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <button type="submit" className="site-action site-action-green inquiry-submit" data-testid="button-inquiry-submit">
                {whatsappReady ? <WhatsAppIcon size={18} /> : <Send size={17} />}
                <span>{whatsappReady ? 'أرسل عبر واتساب' : 'جهّز رسالة الاستفسار'}</span>
              </button>
            </form>
          </Form>

          {pendingMessage && (
            <div className="inquiry-unavailable" role="status" data-testid="status-inquiry-unavailable">
              <AlertCircle size={18} />
              <div>
                <strong>رسالتك جاهزة — لم تُرسل بعد</strong>
                <p>استقبال الرسائل عبر واتساب غير متاح حالياً، ولم يُرسل استفسارك إلى أي جهة. انسخ الرسالة أو اتصل بنا على الرقم الموحّد.</p>
                <pre dir="rtl">{pendingMessage}</pre>
                <div className="inquiry-message-actions">
                  <button type="button" onClick={copyMessage} className="inquiry-copy" data-testid="button-inquiry-copy">
                    {copied ? <Check size={15} /> : <Copy size={15} />}<span aria-live="polite">{copied ? 'تم النسخ' : 'انسخ نص الرسالة'}</span>
                  </button>
                  <a href={contactConfig.phoneHref} className="inquiry-call" data-testid="link-inquiry-call"><Phone size={15} /><span dir="ltr">{contactConfig.phone}</span></a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
