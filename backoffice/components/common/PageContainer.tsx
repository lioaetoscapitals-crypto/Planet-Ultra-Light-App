type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function PageContainer({ title, subtitle, children }: Props) {
  return (
    <section className="bo-page">
      <header className="bo-page-header">
        <h1 className="bo-page-title">{title}</h1>
        {subtitle ? <p className="bo-page-subtitle">{subtitle}</p> : null}
      </header>
      <div className="bo-page-body">{children}</div>
    </section>
  );
}
