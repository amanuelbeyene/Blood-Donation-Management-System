interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

const SectionHeading = ({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) => (
  <div className={`space-y-3 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    {eyebrow && <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>}
    <h2 className="font-display text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h2>
    {description && <p className="text-lg text-slate-500">{description}</p>}
  </div>
);

export default SectionHeading;


