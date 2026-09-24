import Section from "./Section";
import { hris, otherProjects } from "../data";

export default function Work() {
  return (
    <Section id="work" title="Work">
      <article className="feature">
        <h3>{hris.name}</h3>
        <p className="meta">{hris.meta}</p>
        <p>{hris.summary}</p>

        <h4>What it does</h4>
        <ul className="checks">
          {hris.features.map((f) => <li key={f}>{f}</li>)}
        </ul>

        <h4>How it fits together</h4>
        <ol className="flow" aria-label="System layers, from users to database">
          {hris.layers.map((l) => <li key={l}>{l}</li>)}
        </ol>
        <p className="note">n8n workflows run alongside the API for notifications and process automation.</p>
        <p className="note">Built with {hris.built}.</p>
      </article>

      <h3 className="sub">Other projects</h3>
      <ul className="ledger">
        {otherProjects.map((p) => (
          <li key={p.name}>
            <div>
              <h4>{p.name}</h4>
              <p className="meta">{p.role}</p>
            </div>
            <p>{p.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
