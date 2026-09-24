import Section from "./Section";
import { stack, workflows, approach } from "../data";

export default function Stack() {
  return (
    <>
      <Section id="stack" title="Stack">
        <dl className="stack">
          {stack.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>

        <h3 className="sub">Workflows I build with n8n</h3>
        <ul className="ledger">
          {workflows.map((w) => (
            <li key={w.when}>
              <h4>{w.when}</h4>
              <p>{w.then}</p>
            </li>
          ))}
        </ul>
        <p className="note">I use AI tools such as Claude Code to speed up development, debugging and documentation.</p>
      </Section>

      <Section id="approach" title="How I work">
        <ol className="steps">
          {approach.map(([t, d], i) => (
            <li key={t}>
              <span>{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
