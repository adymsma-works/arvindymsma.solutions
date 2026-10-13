import Icon from "../Icon.jsx";
import { CtaBand } from "../ui.jsx";
import { USES } from "../../data.js";

export default function Uses() {
  return (
    <>
      <header className="container page-head">
        <h1 className="h1">Uses</h1>
        <p className="lead">The tools I open every day and the stack I reach for on business systems. Software only; the desk is not that interesting.</p>
      </header>
      <section className="container uses-groups" style={{ marginTop: "clamp(2.5rem,5vw,4rem)" }} aria-label="Tools">
        {USES.map((g) => (
          <section className="uses-group" data-reveal aria-label={g.group} key={g.group}>
            <div>
              <h2>{g.group}</h2>
              <p>{g.note}</p>
            </div>
            <ul className="uses-items">
              {g.items.map(([ic, name, note]) => (
                <li key={name}>
                  <strong>
                    <Icon name={ic} />
                    {name}
                  </strong>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
      <CtaBand />
    </>
  );
}
