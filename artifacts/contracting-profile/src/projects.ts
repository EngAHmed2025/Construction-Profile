import residencePanorama from './assets/panorama-residence.jpg';
import communityPanorama from './assets/panorama-community.jpg';
import commercialPanorama from './assets/panorama-commercial.jpg';

export type DemoProject = {
  id: string;
  title: string;
  type: string;
  city: string;
  shortDescription: string;
  panorama: string;
  demo: true;
  mapPosition: { x: number; y: number };
};

export const projects: DemoProject[] = [
  {
    id: 'residence',
    title: 'بيت في ضوء النهار',
    type: 'سكني',
    city: 'جدة',
    shortDescription: 'مشهد افتراضي لمساحة سكنية معاصرة وفناء داخلي.',
    panorama: residencePanorama,
    demo: true,
    mapPosition: { x: 68, y: 30 },
  },
  {
    id: 'community',
    title: 'مساحة للقاء',
    type: 'مجتمعي',
    city: 'جدة',
    shortDescription: 'تصوّر بصري لردهة واسعة ومساحة مهيأة للتجمع.',
    panorama: communityPanorama,
    demo: true,
    mapPosition: { x: 47, y: 51 },
  },
  {
    id: 'commercial',
    title: 'وجهة تتسع للفكرة',
    type: 'تجاري',
    city: 'جدة',
    shortDescription: 'مشهد توضيحي لردهة تجارية داخلية مضاءة طبيعياً.',
    panorama: commercialPanorama,
    demo: true,
    mapPosition: { x: 72, y: 73 },
  },
];
