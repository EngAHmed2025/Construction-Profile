import { ArrowUpLeft, Award, ClipboardCheck, Droplets, FileSignature, Landmark } from 'lucide-react';

// Categories of documents reproduced in the company profile (pp. 58–66).
// Listed as text only — the scans carry signatures and stamps and are not republished here.
const credentials = [
  { icon: Droplets, title: 'اعتمادات شركة المياه الوطنية', text: 'اعتماد ديار الخبرة لدى شركة المياه الوطنية لمشروع مخطط شمس العروس.' },
  { icon: Landmark, title: 'اعتمادات أمانة محافظة جدة', text: 'خطاب عدم ممانعة لاعتماد ديار الخبرة مقاولاً لمخطط الهملان، وخطاب اعتمادها مقاولاً لمخطط اليحيى.' },
  { icon: ClipboardCheck, title: 'محاضر لجان الاستلام', text: 'محضر لجنة استلام أعمال المياه والصرف لمخطط الموسى فيو، وقرار استلام أعمال المياه والصرف لمخطط اليحيى.' },
  { icon: Award, title: 'شهادة تأهيل مطوّر عقاري', text: 'شهادة تأهيل مطوّر عقاري صادرة لديار الخبرة، ضمن وثائق ملف الشركة.' },
  { icon: FileSignature, title: 'اتفاقية هيئة الاتصالات والفضاء والتقنية', text: 'اتفاقية مع هيئة الاتصالات والفضاء والتقنية (CST).' },
];

export default function Credentials() {
  return (
    <div className="credentials-block" aria-labelledby="credentials-title">
      <h3 id="credentials-title">اعتمادات وشهادات</h3>
      <ul>
        {credentials.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <div><strong>{title}</strong><p>{text}</p></div>
          </li>
        ))}
      </ul>
      <a
        className="site-action site-action-green credentials-documents"
        href={`${import.meta.env.BASE_URL}diyar-alkhebra-profile.pdf#page=58`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="عرض وثائق الاعتماد (PDF، يفتح في تبويب جديد)"
      >
        عرض وثائق الاعتماد <ArrowUpLeft size={16} aria-hidden="true" />
      </a>
    </div>
  );
}
