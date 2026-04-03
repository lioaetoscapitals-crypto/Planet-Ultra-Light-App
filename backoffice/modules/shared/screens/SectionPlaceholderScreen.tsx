type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionPlaceholderScreen({ title, subtitle }: Props) {
  return (
    <section className="bo-page">
      <div className="bo-page-header">
        <h1 className="bo-page-title">{title}</h1>
        <p className="bo-page-subtitle">
          {subtitle ?? "This section is connected and ready for module-specific implementation."}
        </p>
      </div>
      <div className="bo-page-body">
        <article className="bo-card">
          <h3 className="bo-card-title">{title}</h3>
          <p className="bo-card-subtitle">
            Navigation is now mapped from the Figma information architecture. We can extend this page with table, form,
            filters, and workflows next.
          </p>
        </article>
      </div>
    </section>
  );
}

