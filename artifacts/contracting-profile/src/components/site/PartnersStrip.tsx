const logoFiles = import.meta.glob<string>('../../assets/partners/*.webp', { eager: true, import: 'default' });
const logo = (name: string) => logoFiles[`../../assets/partners/${name}.webp`];

// Logos as printed on the "شركاء النجاح" page of the company profile (p. 57).
const partners = [
  { file: 'nwc', w: 260, name: 'شركة المياه الوطنية' },
  { file: 'sec', w: 190, name: 'الشركة السعودية للكهرباء' },
  { file: 'alfanar', w: 251, name: 'الفنار' },
  { file: 'jeddah-cables', w: 206, name: 'شركة كابلات جدة' },
  { file: 'albabtain', w: 123, name: 'البابطين للطاقة والاتصالات' },
  { file: 'dawiyat', w: 200, name: 'ضوئيات المتكاملة' },
  { file: 'unimix', w: 76, name: 'الاتحاد للخرسانة الجاهزة (يونيمكس)' },
  { file: 'alwasail', w: 223, name: 'الوسائل' },
  { file: 'artic', w: 208, name: 'أرتك' },
  { file: 'pedrollo', w: 320, name: 'بيدرولو' },
  { file: 'sps', w: 130, name: 'SPS' },
  { file: 'shadow', w: 250, name: 'أبعاد الظل المحدودة' },
  { file: 'baamer', w: 93, name: 'باعامر للكهرباء' },
  { file: 'group', w: 207, name: 'T. Nagadi Group of Factories' },
];

export default function PartnersStrip() {
  return (
    <section id="partners" className="partners-strip" aria-labelledby="partners-title">
      <div className="container-wide partners-inner">
        <div className="partners-heading">
          <h2 id="partners-title">شركاء النجاح</h2>
        </div>
        <div className="partners-viewport" dir="rtl" tabIndex={0} aria-label="شعارات شركاء النجاح">
          <div className="partners-track">
            {[false, true].map((duplicate) => (
              <ul className="partners-list" key={String(duplicate)} aria-hidden={duplicate || undefined}>
                {partners.map((partner) => (
                  <li key={partner.file} data-testid={duplicate ? undefined : `img-partner-${partner.file}`}>
                    <img src={logo(partner.file)} alt={duplicate ? '' : partner.name} decoding="async" draggable={false} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
