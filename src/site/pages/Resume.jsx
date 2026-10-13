import Icon from "../Icon.jsx";
import { KINDS, PROJECTS, SITE, SKILLS, XP, links, url } from "../../data.js";

export default function Resume() {
  return (
    <>
      <header className="container page-head">
        <nav className="crumbs" aria-label="Breadcrumb">
          <a href={url("about/")}>
            <Icon name="arrow-left" sw={2} />
            About
          </a>
          <span className="sep" aria-hidden="true">
            /
          </span>
          <span aria-current="page">Résumé</span>
        </nav>
        <h1 className="h1">Résumé</h1>
        <p className="lead">The one-page version. For the stories behind these lines, read the case studies.</p>
        <div className="hero-ctas">
          <a className="btn btn-primary" href={links.resume} download>
            <Icon name="download" />
            Download PDF
          </a>
          <a className="btn btn-ghost" href={links.vcard} download>
            <Icon name="id-card" />
            Save contact
          </a>
        </div>
      </header>
      <section className="container" aria-label="Résumé" style={{ marginTop: "clamp(2rem,4vw,3rem)" }}>
        <article className="resume">
          <div className="resume-top">
            <div>
              <h2>{SITE.name}</h2>
              <p>
                {SITE.role}. {SITE.tagline}
              </p>
            </div>
            <ul className="resume-contact">
              <li>
                <Icon name="mail" />
                <a href={`mailto:${links.email}`}>{links.email}</a>
              </li>
              <li>
                <Icon name="phone" />
                <a href={`tel:${links.phone}`}>{links.phoneLocal}</a>
              </li>
              <li>
                <Icon name="map-pin" />
                {SITE.location}
              </li>
              <li>
                <Icon name="git-branch" />
                <a href={links.github} target="_blank" rel="noopener">
                  github.com/adymsma-works
                </a>
              </li>
            </ul>
          </div>
          <section className="resume-sec">
            <h3>Summary</h3>
            <p>{SITE.summary}</p>
          </section>
          <section className="resume-sec">
            <h3>Experience</h3>
            <div>
              {XP.map((x) => (
                <div className="resume-job" key={x.id}>
                  <header>
                    <h4>
                      {x.role} <span>@ {x.co}</span>
                    </h4>
                    <span className="meta">{x.when}</span>
                  </header>
                  <ul>
                    {x.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <section className="resume-sec">
            <h3>Selected projects</h3>
            <div>
              {PROJECTS.map((p) => (
                <div className="resume-job" key={p.slug}>
                  <header>
                    <h4>
                      <a className="link" href={url(`work/${p.slug}/`)}>
                        {p.name}
                      </a>
                    </h4>
                    <span className="meta">
                      {KINDS[p.kind]}, {p.years}
                    </span>
                  </header>
                  <p style={{ marginTop: ".4rem", fontSize: ".93rem", color: "var(--soft)" }}>{p.summary}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="resume-sec">
            <h3>Skills</h3>
            <div className="skills">
              {SKILLS.map(([k, v]) => (
                <div key={k}>
                  <strong>{k}</strong>
                  {v}
                </div>
              ))}
            </div>
          </section>
          <section className="resume-sec">
            <h3>Education and certifications</h3>
            <div style={{ display: "grid", gap: ".5rem" }}>
              {SITE.education.map(([t, w]) => (
                <div style={{ fontSize: ".93rem" }} key={t}>
                  <strong style={{ color: "var(--bright)", fontWeight: 550 }}>{t}</strong>, {w}
                </div>
              ))}
            </div>
          </section>
        </article>
      </section>
    </>
  );
}
