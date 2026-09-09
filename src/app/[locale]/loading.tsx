export default function Loading() {
  return (
    <section className="section" aria-busy="true">
      <div className="section__inner">
        <p role="status">VD BARRISOL</p>
        <div className="loading-skeleton" />
      </div>
    </section>
  );
}
