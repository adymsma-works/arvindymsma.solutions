export default function Section({ id, title, children, tone }) {
  return (
    <section id={id} className={`sec${tone ? ` ${tone}` : ""}`} aria-labelledby={`${id}-h`}>
      <div className="wrap sec-grid">
        <h2 id={`${id}-h`} className="sec-title">{title}</h2>
        <div className="sec-body">{children}</div>
      </div>
    </section>
  );
}
