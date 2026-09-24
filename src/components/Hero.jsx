import { useEffect, useState } from "react";
import { links } from "../data";

const zone = { timeZone: "Asia/Manila" };
const clock = new Intl.DateTimeFormat("en-PH", { ...zone, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" });
const short = new Intl.DateTimeFormat("en-PH", { ...zone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const day = new Intl.DateTimeFormat("en-PH", { ...zone, weekday: "long", month: "long", day: "numeric", year: "numeric" });

export default function Hero() {
  const [now, setNow] = useState(() => new Date());
  const [punchIn] = useState(() => short.format(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="hero wrap">
      <div className="hero-copy">
        <h1>I build HR, attendance and workflow systems for real businesses.</h1>
        <p className="lead">
          I'm Arvin, a full-stack developer in Cebu City. Right now I'm building a cloud HRIS with biometric and
          face-recognition attendance at MSMA Solutions Department.
        </p>
        <div className="actions">
          <a className="btn primary" href={links.resume} download>Download resume</a>
          <a className="btn" href={`mailto:${links.email}`}>Email me</a>
        </div>
      </div>

      <aside className="card" aria-label="Daily time record">
        <p className="card-title">Daily time record</p>
        <dl className="card-rows">
          <div><dt>Name</dt><dd>Arvin D. Yapliong</dd></div>
          <div><dt>Role</dt><dd>IT Associate | Developer</dd></div>
          <div><dt>Department</dt><dd>MSMA Solutions Department</dd></div>
          <div><dt>Building now</dt><dd>Cloud HRIS with face-recognition attendance</dd></div>
          <div><dt>Station</dt><dd>Cebu City, Philippines</dd></div>
        </dl>
        <div className="card-time" aria-hidden="true">
          <span>{day.format(now)}</span>
          <strong>{clock.format(now)}</strong>
        </div>
        <div className="stamp" aria-hidden="true">
          <span>Clocked in</span>
          <b>{punchIn}</b>
        </div>
      </aside>
    </header>
  );
}
