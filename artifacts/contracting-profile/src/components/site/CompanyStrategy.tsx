import { ClipboardList, Compass, Target } from 'lucide-react';
import './company-strategy.css';

export default function CompanyStrategy() {
  return (
    <section className="container-wide company-strategy" id="company-strategy" aria-labelledby="company-strategy-title">
      <header className="strategy-heading">
        <span className="eyebrow">توجّه الشركة</span>
        <h3 id="company-strategy-title">الرؤية والرسالة <span>والتخطيط</span></h3>
      </header>
      <div className="company-strategy-grid">
        <article className="strategy-card strategy-vision">
          <div className="strategy-card-top" aria-hidden="true"><span className="strategy-icon"><Compass size={23} /></span><span className="strategy-number">01</span></div>
          <h4>رؤيتنا</h4>
          <p>أن نكون شريكًا موثوقًا في تنفيذ مشاريع البنية التحتية وتطوير المخططات، وأن نُسهم في تهيئة أحياء ومواقع تخدم احتياجات المجتمع على المدى الطويل.</p>
        </article>
        <article className="strategy-card">
          <div className="strategy-card-top" aria-hidden="true"><span className="strategy-icon"><Target size={23} /></span><span className="strategy-number">02</span></div>
          <h4>رسالتنا</h4>
          <p>تنفيذ أعمال الطرق وشبكات الخدمات وتطوير المواقع وفق متطلبات كل مشروع، بالتنسيق مع الجهات المعنية، مع الالتزام بالجودة والسلامة في جميع مراحل العمل.</p>
        </article>
        <article className="strategy-card strategy-planning">
          <div className="strategy-card-top" aria-hidden="true"><span className="strategy-icon"><ClipboardList size={23} /></span><span className="strategy-number">03</span></div>
          <h4>التخطيط</h4>
          <ol className="strategy-steps" role="list">
            <li><span aria-hidden="true">١</span><div>مراجعة المخططات ومعاينة الموقع وتحديد المتطلبات قبل التنفيذ.</div></li>
            <li><span aria-hidden="true">٢</span><div>ترتيب مراحل العمل وتوزيع الفرق والمعدات بحسب أولويات المشروع.</div></li>
            <li><span aria-hidden="true">٣</span><div>متابعة التقدم والجودة وتوثيق نتائج الفحوصات حتى التسليم.</div></li>
          </ol>
        </article>
      </div>
    </section>
  );
}
