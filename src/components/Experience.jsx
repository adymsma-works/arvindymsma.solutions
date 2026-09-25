import Section from "./Section";
import { timesheet, education } from "../data";

export default function Experience() {
  return (
    <Section id="experience" title="Experience">
      <ol className="sheet">
        {timesheet.map((r) => (
          <li key={r.role} className={r.active ? "on" : undefined}>
            <span className="period">{r.period}</span>
            <div>
              <h3>{r.role}</h3>
              <p className="meta">{r.org}</p>
              <p>{r.text}</p>
            </div>
            {r.active && <span className="status live">Still clocked in</span>}
          </li>
        ))}
      </ol>

      <h3 className="sub">Education and certifications</h3>
      <ul className="edu">
        {education.map((e) => (
          <li key={e.title}>
            <h4>{e.title}</h4>
            <p className="meta">{e.where}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
