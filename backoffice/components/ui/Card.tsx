type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function Card({ title, subtitle, children }: Props) {
  return (
    <article className="bo-card">
      {title ? <h3 className="bo-card-title">{title}</h3> : null}
      {subtitle ? <p className="bo-card-subtitle">{subtitle}</p> : null}
      <div className="bo-card-body">{children}</div>
    </article>
  );
}
