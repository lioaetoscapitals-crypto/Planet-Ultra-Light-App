type Props = {
  title: string;
  subtitle?: string;
  showHeader?: boolean;
  children: React.ReactNode;
};

export default function PageContainer({ title, subtitle, showHeader = true, children }: Props) {
  return (
    <section className="bo-page">
      {showHeader ? (
        <header className="bo-page-header">
          <h1 className="bo-page-title">{title}</h1>
          {subtitle ? <p className="bo-page-subtitle">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="bo-page-body">{children}</div>
    </section>
  );
}
