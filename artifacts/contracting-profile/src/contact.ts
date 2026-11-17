/*
 * Company contact details — verified by the company (Nov 2026).
 * The published phone is a landline, so it is NOT used for WhatsApp. WhatsApp stays
 * disabled until a verified WhatsApp number is supplied via VITE_WHATSAPP_NUMBER
 * (international format 9665XXXXXXXX). No email address has been published, so none is shown.
 */

const env = import.meta.env as Record<string, string | undefined>;
const whatsappDigits = (env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const contactConfig = {
  whatsapp: /^9665\d{8}$/.test(whatsappDigits) ? whatsappDigits : null,
  phone: '+966 12 677 7684',
  phoneHref: 'tel:+966126777684',
  website: 'www.diyaralkhebra.com',
  websiteHref: 'https://www.diyaralkhebra.com',
  address: 'جدة – حي الشاطئ – شارع الأمير فيصل بن فهد',
  commercialRegistration: '4030435420',
};

export const DEFAULT_WHATSAPP_MESSAGE = 'السلام عليكم، أرغب في الاستفسار عن مشروع';

export function whatsappUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  if (!contactConfig.whatsapp) return null;
  return `https://wa.me/${contactConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}
