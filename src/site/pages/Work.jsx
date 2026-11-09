import { useState } from "react";
import Icon from "../Icon.jsx";
import { CtaBand, WorkCard } from "../ui.jsx";
import { ARCHIVE, KINDS, PROJECTS, url } from "../../data.js";

export default function Work() {
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const kinds = ["all", ...Object.keys(KINDS).filter((k) => ARCHIVE.some((a) => a.k === k))];
  const term = q.trim().toLowerCase();
  const rows = ARCHIVE.filter(
    (a) => (kind === "all" || a.k === kind) && (!term || `${a.n} ${a.d} ${a.w} ${a.y}`.toLowerCase().includes(term)),
  );
  const reset = () => {
    setKind("all");
    setQ("");
  };

  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Work</h1>
        <p className="lead">
          Case studies for the systems I can talk about in detail, and a short archive of everything else I have worked on since 2023.
        </p>
      </header>

      <section className="container" style={{ marginTop: "clamp(2.5rem,5vw,4rem)" }} aria-label="Case studies">
        <div className="work-grid work-grid--index">
          {PROJECTS.map((p, i) => (
            <WorkCard key={p.slug} p={p} i={i} priority={i === 0} />
          ))}
        </div>
      </section>

      <section className="section container" id="archive" aria-labelledby="archive-h">
        <div className="sec-head" data-reveal>
          <div>
            <h2 className="h2" id="archive-h">
              Everything else
            </h2>
            <p>Internships, school projects and the things I build for myself. Filter by kind, or search by name or tool.</p>
          </div>
        </div>
        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter by kind">
            {kinds.map((k) => (
              <button key={k} className="chip" type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
                {k === "all" ? "All" : KINDS[k]}
                <span className="count">{k === "all" ? ARCHIVE.length : ARCHIVE.filter((a) => a.k === k).length}</span>
              </button>
            ))}
          </div>
          <label className="search-field">
            <span className="visually-hidden">Search the archive</span>
            <Icon name="search" />
            <input className="input" type="search" placeholder="Search name or tool" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
        </div>
        <p className="result-count" aria-live="polite">
          {rows.length === ARCHIVE.length ? `${ARCHIVE.length} projects` : `${rows.length} of ${ARCHIVE.length} projects`}
        </p>
        {rows.length > 0 ? (
          <table className="archive">
            <thead>
              <tr>
                <th scope="col">Year</th>
                <th scope="col">Project</th>
                <th scope="col">Kind</th>
                <th scope="col">Built with</th>
                <th scope="col">
                  <span className="visually-hidden">Link</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.n}>
                  <td className="yr">{a.y}</td>
                  <td className="nm">
                    {a.n}
                    <small>{a.d}</small>
                  </td>
                  <td className="kd">{KINDS[a.k]}</td>
                  <td className="bw">{a.w}</td>
                  <td className="lk">
                    {a.slug ? (
                      <a href={url(`work/${a.slug}/`)}>
                        Case study <Icon name="arrow-right" />
                      </a>
                    ) : a.ext ? (
                      <a href={a.ext} target="_blank" rel="noopener">
                        GitHub <Icon name="arrow-up-right" />
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">
            <Icon name="search" sw={1.5} />
            <strong>Nothing matches that search</strong>
            <span>Try a tool like React or n8n.</span>
            <button className="btn btn-ghost btn-sm" type="button" onClick={reset}>
              Clear filters
            </button>
          </div>
        )}
      </section>

      <CtaBand />
    </>
  );
}
