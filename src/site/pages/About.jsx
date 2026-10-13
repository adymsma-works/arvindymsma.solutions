import Icon from "../Icon.jsx";
import { CtaBand, Rail } from "../ui.jsx";
import { MILESTONES, url } from "../../data.js";

export default function About() {
  return (
    <>
      <section className="container page-head about-grid" aria-labelledby="about-title">
        <figure className="about-photo">
          <div className="portrait-frame">
            <img
              src={url("images/portrait-avatar.webp")}
              alt="My avatar: a glossy green bunny with closed eyes and black headphones, sitting on a wet stone slab."
              width="900"
              height="1125"
              loading="lazy"
              decoding="async"
            />
          </div>
          <figcaption>My avatar, mid-playlist. It shows up in the animation on the home page too.</figcaption>
        </figure>
        <div className="about-copy">
          <h1 className="h1" id="about-title">
            I'm Arvin. I build the systems HR opens first thing in the morning.
          </h1>
          <div className="prose">
            <p className="lede">
              I am a full-stack developer in Cebu City, working as an IT associate and developer at MSMA Solutions Department, where I am
              building a cloud HRIS with biometric and face-recognition attendance.
            </p>
            <p>
              Before that I was a web developer intern at Alpha Insurance &amp; Surety, where I led a <a href={url("work/bail-bonds-records/")}>bail bonds and
              records system</a>, and a software implementor intern at Cebu Innosoft Solutions, rolling out <a href={url("work/pos-implementation/")}>POS
              systems</a> and training the people who used them. I finished my BS in Information Technology at the University of Cebu in 2025.
            </p>
            <p>
              I like work where a manual step can disappear: a form that replaces re-typing, a workflow that sends the email nobody remembers
              to send. I use AI tools such as Claude Code to move faster on development, debugging and documentation, and I still read every
              line it writes.
            </p>
          </div>
          <ul className="principles" aria-label="How I work">
            <li>
              <strong>Understand the routine first</strong>
              <span>I start with the business requirements and how the work is done today, before designing anything.</span>
            </li>
            <li>
              <strong>Automate the repeat</strong>
              <span>If people type the same thing twice, it should probably be a workflow.</span>
            </li>
            <li>
              <strong>Keep improving after launch</strong>
              <span>Launch is when the real requirements show up. I keep refining the system after it ships.</span>
            </li>
          </ul>
          <div className="hero-ctas" style={{ marginTop: "2.5rem" }}>
            <a className="btn btn-primary" href={url("contact/")}>
              Get in touch
            </a>
            <a className="btn btn-ghost" href={url("resume/")}>
              Read the résumé
            </a>
          </div>
        </div>
      </section>

      <section className="section container milestones-wrap" id="milestones" aria-labelledby="ms-h">
        <div className="sec-intro" data-reveal>
          <h2 className="h2" id="ms-h">
            Milestones
          </h2>
          <p>A changelog of the career so far, newest first. Short, because it is early.</p>
        </div>
        <div className="timeline" data-reveal style={{ "--i": 1 }}>
          <Rail dir="v" />
          <ol className="years">
            {MILESTONES.map((m) => (
              <li className="year" key={m.y}>
                <h3>{m.y}</h3>
                <ul>
                  {m.p.map((t) => (
                    <li key={t}>
                      <Icon name="circle-check" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
