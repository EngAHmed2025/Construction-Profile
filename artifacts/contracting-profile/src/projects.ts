/*
 * Project data — transcribed from the company profile PDF
 * (Diyar_Al_Khebra_Company_Profile_2026, 66 pages). Source pages noted per project.
 *
 * Rules applied:
 * - `status` is set only where the profile states it: "قيد التطوير" / "تحت التطوير" on the
 *   project sheet, or "منفّذ" where the profile shows an aerial photo captioned "بعد التنفيذ".
 *   Projects with neither (قرية البحر الأحمر – ألما) have no status.
 * - `subcontract` is set where the sheet says "(مقاول باطن)"; `mainContractor` only where the
 *   sheet names it (شركة الدهلوي للمقاولات العامة).
 * - الوداد and المركاز: the profile's info table repeats "مخطط الفال" (copy error); the page
 *   headings are used as titles. Their areas come from their own sheets.
 * - Areas are written in the PDF with mixed separators ("199930,45"); normalised here.
 *   اليحيى's sheet gives 112,237.67 without a unit; it sits in the "مساحة المشروع" field (م²).
 * - ألما is measured by network length (25,000 m), not area, and is excluded from area totals.
 * - Photos are only those printed on each project's own pages (renderings, location maps
 *   and approved-plan drawings are excluded). مجمع أبحر الترفيهي has no site photo in the profile.
 * - Map positions are approximate, illustrative placements — not survey coordinates.
 */

const photoFiles = import.meta.glob<string>('./assets/projects/*.webp', { eager: true, import: 'default' });
const asset = (name: string) => photoFiles[`./assets/projects/${name}.webp`];

export type ProjectPhoto = { src: string; thumb: string; caption: string };
export type ProjectStatus = 'منفّذ' | 'قيد التطوير' | 'تحت التطوير';

export type CompanyProject = {
  id: string;
  number: number;
  title: string;
  district: string;
  category: string;
  status?: ProjectStatus;
  subcontract?: boolean;
  mainContractor?: string;
  authority?: string;
  areaM2?: number;
  networkLengthM?: number;
  shortScope: string;
  scope: string[];
  scopeNote?: string;
  photos: ProjectPhoto[];
  sourcePages: string;
  mapPosition: { x: number; y: number };
};

const photos = (prefix: string, captions: string[]): ProjectPhoto[] =>
  captions.map((caption, index) => ({ src: asset(`${prefix}-${index + 1}`), thumb: asset(`${prefix}-${index + 1}-sm`), caption }));

const FULL_SCOPE = [
  'أعمال النظافة والتسويات (القطع والردم وتسويات البلكات والقطع السكنية والتجارية).',
  'أعمال الطرق (الترابيات).',
  'أعمال السفلتة والأرصفة وممرات المشاة واللوحات والعلامات المرورية.',
  'أعمال شبكات الإنارة (إنارة الشوارع – إنارة ممرات المشاة – الإنارة الديكورية للحدائق).',
  'أعمال شبكات المياه وشبكات الصرف الصحي وشبكات الحريق.',
  'أعمال شبكات تصريف مياه الأمطار.',
  'أعمال شبكات الكهرباء (الجهد المنخفض والمتوسط) ومحطات التوزيع وأعمال الربط مع الشبكة.',
  'أعمال المناطق الخضراء والحدائق وألعاب الأطفال والمظلات وتشجير الطرق وشبكات الري وخزاناتها.',
  'أعمال شبكات الهاتف.',
];
const FULL_SHORT = 'تسويات، طرق وسفلتة، شبكات مياه وصرف وحريق وأمطار، كهرباء وإنارة، حدائق وري، هاتف.';
const DAHLAWI = 'شركة الدهلوي للمقاولات العامة';
const DURING = 'صور الموقع أثناء التطوير وتنفيذ البنية التحتية';
const AFTER_AERIAL = 'مصوّر جوي للمخطط بعد التنفيذ';

export const projects: CompanyProject[] = [
  {
    id: 'obhur-complex', number: 1, title: 'مجمع أبحر الترفيهي', district: 'أبحر، جدة', category: 'شبكات مياه',
    status: 'قيد التطوير', authority: 'شركة المياه الوطنية (NWC)', areaM2: 95377,
    shortScope: 'أعمال ربط مياه الشرب وفق متطلبات شركة المياه الوطنية.',
    scope: ['تنفيذ أعمال ربط مياه الشرب وفق المواصفات والمخططات المعتمدة ونطاق العمل ومصفوفة النطاق، والأكواد والمعايير ذات الصلة وأنظمة المملكة ومستندات المناقصة، وبما يتوافق مع متطلبات شركة المياه الوطنية (NWC).'],
    scopeNote: 'النطاق وارد في الملف باللغة الإنجليزية؛ المعروض ترجمة له.',
    photos: [], sourcePages: '10', mapPosition: { x: 60, y: 14 },
  },
  {
    id: 'abhur-hills', number: 2, title: 'مخطط أبحر هيلز 147 ج/س', district: 'شارع الأمير مشعل بن ماجد، جدة', category: 'بنية تحتية متكاملة',
    status: 'قيد التطوير', areaM2: 392087.6, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('abhur-hills', [DURING, DURING]), sourcePages: '11–12', mapPosition: { x: 50, y: 24 },
  },
  {
    id: 'plan-558', number: 3, title: 'مخطط 558 ج/س', district: 'جدة', category: 'بنية تحتية متكاملة',
    status: 'قيد التطوير', areaM2: 315543.48, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('plan-558', [DURING, DURING, DURING, DURING]), sourcePages: '13–15', mapPosition: { x: 70, y: 40 },
  },
  {
    id: 'tharawat-alshamal', number: 4, title: 'شبكة المياه والصرف الصحي بمخطط ثروات الشمال', district: 'حي الياقوت (أبحر الشمالية)، جدة', category: 'شبكات مياه وصرف',
    status: 'تحت التطوير', subcontract: true, areaM2: 932000,
    shortScope: 'شبكات المياه والصرف الصحي والحريق.',
    scope: ['أعمال شبكات المياه وشبكات الصرف الصحي وشبكات الحريق.'],
    photos: photos('tharawat', ['أعمال تنفيذ الشبكات أثناء التنفيذ', 'أعمال تنفيذ الشبكات أثناء التنفيذ', 'أعمال تنفيذ الشبكات أثناء التنفيذ', 'أعمال تنفيذ الشبكات أثناء التنفيذ']),
    sourcePages: '53–55', mapPosition: { x: 40, y: 12 },
  },
  {
    id: 'hamlan-674', number: 5, title: 'مخطط الهملان 674 ج/س', district: 'حي الفيحاء، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', areaM2: 107477.86, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('hamlan', [
      'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية',
      'أعمال تنفيذ الطرق والأرصفة بالموقع', 'أعمال تنفيذ الطرق والأرصفة بالموقع',
      'أعمال تنفيذ محطات الكهرباء بالموقع', 'أعمال تنفيذ محطات الكهرباء بالموقع',
      'أعمال تنفيذ الحدائق بالموقع', 'أعمال تنفيذ الحدائق بالموقع',
    ]),
    sourcePages: '16–21', mapPosition: { x: 64, y: 80 },
  },
  {
    id: 'yahya-alwisam', number: 6, title: 'مخطط اليحيى', district: 'حي الوسام (الرياض)، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', areaM2: 112237.67, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('yahya', [
      'أعمال الطرق والرصف بعد التنفيذ', 'تركيب مظلات ومقاعد الحدائق', 'أعمال مناطق ألعاب الأطفال',
      'أعمال تركيب شبكات تصريف الأمطار', 'تنفيذ شبكات الصرف الصحي', 'تنفيذ شبكات الصرف الصحي',
      'أعمال تنفيذ الحدائق', 'أعمال الدهانات والعلامات المرورية',
    ]),
    sourcePages: '22–31', mapPosition: { x: 30, y: 30 },
  },
  {
    id: 'alfal-alsawari', number: 7, title: 'مخطط الفال', district: 'حي الصواري (أبحر الشمالية)، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', subcontract: true, mainContractor: DAHLAWI, areaM2: 199930.45, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('fal', [AFTER_AERIAL]), sourcePages: '37–38', mapPosition: { x: 26, y: 8 },
  },
  {
    id: 'almousa-view', number: 8, title: 'مخطط الموسى فيو', district: 'حي الرياض، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', subcontract: true, mainContractor: DAHLAWI, areaM2: 91059.07, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('mousa', ['المشروع بعد التنفيذ', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية']),
    sourcePages: '39–42', mapPosition: { x: 40, y: 36 },
  },
  {
    id: 'shams-al-arous', number: 9, title: 'مخطط شمس العروس 351 ج/س', district: 'حي المريخ (التيسير)، جدة', category: 'إعادة تأهيل وصيانة',
    status: 'منفّذ', subcontract: true, mainContractor: DAHLAWI, areaM2: 862640.5,
    shortScope: 'إعادة تأهيل وصيانة: ' + FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('shams', [
      'أعمال تنفيذ الطرق', 'أعمال تنفيذ الشبكات', 'أعمال تنفيذ الطرق', 'أعمال تنفيذ الشبكات',
      'أعمال تنفيذ الشبكات', 'أعمال تنفيذ الطرق', 'صور الموقع بعد التطوير وتنفيذ البنية التحتية', 'أعمال تنفيذ الشبكات',
    ]),
    sourcePages: '43–48', mapPosition: { x: 52, y: 90 },
  },
  {
    id: 'alwedad-almarwah', number: 10, title: 'مخطط الوداد', district: 'حي المروة، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', subcontract: true, mainContractor: DAHLAWI, areaM2: 229195.14, shortScope: FULL_SHORT, scope: FULL_SCOPE,
    photos: photos('wedad', [AFTER_AERIAL]), sourcePages: '49–50', mapPosition: { x: 58, y: 54 },
  },
  {
    id: 'almarkaz-almanarat', number: 11, title: 'مخطط المركاز', district: 'حي المنارات، جدة', category: 'بنية تحتية متكاملة',
    status: 'منفّذ', subcontract: true, mainContractor: DAHLAWI, areaM2: 720682.38,
    shortScope: 'طرق وسفلتة، شبكات مياه وصرف وحريق وأمطار، كهرباء وإنارة، حدائق وري، هاتف.', scope: FULL_SCOPE.slice(1),
    photos: photos('markaz', [AFTER_AERIAL]), sourcePages: '51–52', mapPosition: { x: 46, y: 62 },
  },
  {
    id: 'red-sea-village-alma', number: 12, title: 'قرية البحر الأحمر (ألما)', district: 'جدة', category: 'شبكات مياه وصرف',
    subcontract: true, mainContractor: DAHLAWI, networkLengthM: 25000,
    shortScope: 'شبكات المياه والصرف الصحي والحريق وتصريف الأمطار.',
    scope: ['أعمال شبكات المياه وشبكات الصرف الصحي وشبكات الحريق.', 'أعمال شبكات تصريف مياه الأمطار.'],
    photos: photos('alma', ['أعمال تنفيذ شبكة الأمطار', 'أعمال تنفيذ شبكة الأمطار', 'أعمال تنفيذ شبكة الأمطار', 'أعمال تنفيذ شبكة الأمطار', 'أعمال التنفيذ', 'أعمال التنفيذ']),
    sourcePages: '32–36', mapPosition: { x: 18, y: 46 },
  },
];

export const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);

export const projectMeasure = (project: CompanyProject) =>
  project.areaM2 !== undefined
    ? { value: formatNumber(project.areaM2), unit: 'م²', label: 'مساحة المشروع' }
    : project.networkLengthM !== undefined
      ? { value: formatNumber(project.networkLengthM), unit: 'م طولي', label: 'أطوال الشبكات' }
      : null;

export const totalAreaM2 = projects.reduce((sum, project) => sum + (project.areaM2 ?? 0), 0);
