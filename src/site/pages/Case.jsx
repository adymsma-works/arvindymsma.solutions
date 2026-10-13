import { useEffect } from "react";
import Icon from "../Icon.jsx";
import { CtaBand, Shot } from "../ui.jsx";
import { num } from "../hooks.js";
import { KINDS, PROJECTS, findProject, url } from "../../data.js";

function Figure({ f }) {
  if (!f) return null;
  if (f.type === "flow")
    return (
      <figure className="figure" data-reveal>
        <div className="diagram">
          {f.steps.map(([t, s]) => (
            <div className="node" key={t}>
              <strong>{t}</strong>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <figcaption>{f.caption}</figcaption>
      </figure>
    );
  return null;
}

const SECTIONS = [
  ["problem", "The problem"],
  ["approach", "Approach"],
  ["details", "Details"],
  ["results", "Results"],
  ["looking-back", "Looking back"],
];

export default function Case({ slug }) {
  const p = findProject(slug) || PROJECTS[0];
  const next = PROJECTS[(PROJECTS.indexOf(p) + 1) % PROJECTS.length];

  // table-of-contents highlighter
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const links = [...document.querySelectorAll(".case-toc a")];
    const map = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((a) => {
            a.classList.remove("is-current");
            a.removeAttribute("aria-current");
          });
          const a = map[e.target.id];
          if (a) {
            a.classList.add("is-current");
            a.setAttribute("aria-current", "true");
          }
        }),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    document.querySelectorAll(".case-section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <article>
        <header className="container page-head">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href={url("work/")}>
              <Icon name="arrow-left" sw={2} />
              Work
            </a>
            <span className="sep" aria-hidden="true">
              /
            </span>
            <span aria-current="page">{p.name}</span>
          </nav>
          <div className="case-head">
            <div>
              <p className="kicker">
                {KINDS[p.kind]}, {p.years}
              </p>
              <h1 className="h1" style={{ marginTop: ".9rem" }}>
                {p.name}
              </h1>
              <p className="lead">{p.intro}</p>
            </div>
            <dl className="facts">
              {p.facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="case-cover">
            <Shot p={p} eager wf={0.9} x="7%" y="9%" label={`${p.name} interface: ${p.summary}`} />
          </div>
          {p.outcomes.length > 0 && (
            <div className="outcomes" data-reveal>
              {p.outcomes.map((o) => (
                <div className="outcome" key={o.label}>
                  <strong data-count={o.v} data-prefix={o.prefix || ""} data-suffix={o.suffix || ""}>
                    {(o.prefix || "") + num(o.v) + (o.suffix || "")}
                  </strong>
                  <span>{o.label}</span>
                </div>
              ))}
            </div>
          )}
        </header>

        <div className="container case-body">
          <nav className="case-toc" aria-label="On this page">
            <ul style={{ listStyle: "none", display: "grid", gap: ".2rem" }}>
              {SECTIONS.map(([id, t]) => (
                <li key={id}>
                  <a href={`#cs-${id}`}>{t}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <section className="case-section" id="cs-problem" data-reveal>
              <h2>The problem</h2>
              {p.problem.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <ul className="constraints">
                {p.constraints.map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}</strong>
                    {v}
                  </li>
                ))}
              </ul>
            </section>

            <section className="case-section" id="cs-approach">
              <h2 data-reveal>Approach</h2>
              <ol className="decisions" data-reveal>
                {p.approach.map(([ic, t, d]) => (
                  <li key={t}>
                    <span className="ic-wrap">
                      <Icon name={ic} />
                    </span>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Figure f={p.figure} />
            </section>

            <section className="case-section" id="cs-details">
              <h2 data-reveal>Details</h2>
              <div className="gallery">
                {p.gallery.map((g, i) => (
                  <figure className="figure" data-reveal style={{ marginTop: 0, "--i": i }} key={g.piece}>
                    <Shot p={p} piece={g.piece} pw={g.pw} k={g.k} decorative cls={i ? "shot--tall" : ""} />
                    <figcaption>{g.label}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <section className="case-section" id="cs-results">
              <h2 data-reveal>Results</h2>
              {p.results.map((t) => (
                <p data-reveal key={t}>
                  {t}
                </p>
              ))}
            </section>

            <section className="case-section" id="cs-looking-back" data-reveal>
              <h2>Looking back</h2>
              <p>{p.reflection}</p>
            </section>
          </div>
        </div>

        <div className="container next-case" data-reveal>
          <a href={url(`work/${next.slug}/`)}>
            <div>
              <p className="kicker">Next case study</p>
              <h2>{next.name}</h2>
              <p>{next.summary}</p>
              <span className="work-more" style={{ marginTop: "1.25rem" }}>
                Read it <Icon name="arrow-right" />
              </span>
            </div>
            <Shot p={next} wf={1.1} x="8%" y="10%" decorative />
          </a>
        </div>
      </article>
      <CtaBand />
    </>
  );
}
