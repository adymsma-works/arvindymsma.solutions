import { useEffect, useState } from "react";
import { links } from "../data";
import { profile } from "../profile";

const zone = { timeZone: profile.timeZone };
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
    <header className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="eyebrow">{profile.headline} · {profile.city}</p>
        <h1>I build HR, attendance and workflow systems for real businesses.</h1>
        <p className="lead">
          I'm {profile.firstName}. Right now I'm building a cloud HRIS with biometric and face-recognition
          attendance at {profile.org}.
        </p>
        <div className="actions">
          <a className="btn primary" href={links.resume} download>Download resume <span aria-hidden="true">↓</span></a>
          <a className="btn" href={`mailto:${links.email}`}>Email me</a>
        </div>
      </div>

      <aside className="dtr" aria-label="Daily time record">
        <p className="dtr-title">Daily time record</p>
        <dl className="dtr-rows">
          <div><dt>Name</dt><dd>{profile.name}</dd></div>
          <div><dt>Role</dt><dd>{profile.role}</dd></div>
          <div><dt>Department</dt><dd>{profile.org}</dd></div>
          <div><dt>Building now</dt><dd>Cloud HRIS with face-recognition attendance</dd></div>
          <div><dt>Station</dt><dd>{profile.city}, {profile.country}</dd></div>
        </dl>
        <div className="dtr-time" aria-hidden="true">
          <span>{day.format(now)} · PHT</span>
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
