import Section from "./Section";
import { stack, workflows, approach } from "../data";

export default function Stack() {
  return (
    <>
      <Section id="stack" title="Stack">
        <dl className="stack">
          {stack.map(([k, items]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd><ul className="chips">{items.map((i) => <li key={i}>{i}</li>)}</ul></dd>
            </div>
          ))}
        </dl>

        <h3 className="sub">Workflows I build with n8n</h3>
        <ul className="ledger">
          {workflows.map((w) => (
            <li key={w.when}>
              <h4><span className="when">When</span> {w.when.replace(/^A /, "a ")}</h4>
              <p><span className="when">Then</span> {w.then}</p>
            </li>
          ))}
        </ul>
        <p className="note">I use AI tools such as Claude Code to speed up development, debugging and documentation.</p>
      </Section>

      <Section id="approach" title="How I work">
        <ol className="steps">
          {approach.map(([t, d], i) => (
            <li key={t}>
              <span aria-hidden="true">{i + 1}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </Section>
    </>
  );
}
