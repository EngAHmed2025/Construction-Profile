import illustrativePanorama from './assets/illustrative-infrastructure-panorama.svg';

export type CompanyProject = {
  id: string;
  title: string;
  type: string;
  city: string;
  shortDescription: string;
  area: string;
  panorama: string;
  mapPosition: { x: number; y: number };
};

export const projects: CompanyProject[] = [
  {
    id: 'obhur-complex',
    title: 'مجمع أبحر الترفيهي',
    type: 'مرافق وبنية تحتية',
    city: 'جدة',
    shortDescription: 'المشروع مُدرج تحت التطوير؛ أعمال ربط مياه الشرب وفق متطلبات شركة المياه الوطنية (NWC).',
    area: '95,377 م²',
    panorama: illustrativePanorama,
    mapPosition: { x: 68, y: 30 },
  },
  {
    id: 'abhur-hills',
    title: 'مخطط أبحر هيلز 147 ج/س',
    type: 'تطوير بنية تحتية',
    city: 'جدة',
    shortDescription: 'المشروع مُدرج تحت التطوير؛ نطاق واسع للبنية التحتية والطرق والفراغات العامة.',
    area: '392,087.60 م²',
    panorama: illustrativePanorama,
    mapPosition: { x: 47, y: 51 },
  },
  {
    id: 'plan-558',
    title: 'مخطط 558 ج/س',
    type: 'أعمال بنية تحتية',
    city: 'جدة',
    shortDescription: 'أعمال بنية تحتية متعددة التخصصات ضمن نطاق المخطط.',
    area: '315,543.48 م²',
    panorama: illustrativePanorama,
    mapPosition: { x: 72, y: 73 },
  },
  {
    id: 'shams-al-arous',
    title: 'مخطط شمس العروس 351',
    type: 'تأهيل وصيانة',
    city: 'المريخ / التيسير، جدة',
    shortDescription: 'أعمال إعادة تأهيل وصيانة، ومقاولة من الباطن مع الدهلوي.',
    area: '862,640.5 م²',
    panorama: illustrativePanorama,
    mapPosition: { x: 35, y: 68 },
  },
];
