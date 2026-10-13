import { useState } from "react";
import Icon from "../Icon.jsx";
import BizCard from "../../components/BizCard.jsx";
import { CopyMail } from "../ui.jsx";
import { useToast } from "../hooks.js";
import { SITE, links } from "../../data.js";

const TOPICS = {
  project: "A system or project to build",
  automation: "Automation or n8n workflows",
  role: "A job opportunity",
  hello: "Just saying hello",
};

function FieldError({ id, msg }) {
  return (
    <p className="error" id={id} role="alert">
      {msg && (
        <>
          <Icon name="alert" />
          <span>{msg}</span>
        </>
      )}
    </p>
  );
}

const focusField = (k) => setTimeout(() => document.getElementById(`cf-${k}`)?.focus(), 0);

const RULES = {
  name: (v) => v.trim().length >= 2 || "Please add your name so I know who I am writing to.",
  email: (v) => {
    v = v.trim();
    if (!v) return "I need an email address to reply to.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "That address looks incomplete. Check the @ and the domain.";
  },
  topic: (v) => !!v || "Pick the option closest to what you have in mind.",
  message: (v) => {
    const n = v.trim().length;
    if (n < 20) return "A couple of sentences helps me reply usefully (20 characters minimum).";
    return v.length <= 1200 || "Please keep it under 1,200 characters.";
  },
};

export default function Contact() {
  const toast = useToast();
  const [v, setV] = useState({ name: "", email: "", company: "", topic: "", timeline: "Flexible", message: "" });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const check = (k, show, val = v[k]) => {
    const res = RULES[k](val);
    const ok = res === true;
    if (show || err[k]) setErr((e) => ({ ...e, [k]: ok ? "" : res }));
    return ok;
  };
  const field = (k) => ({
    id: `cf-${k}`,
    name: k,
    value: v[k],
    onChange: (e) => {
      const val = e.target.value;
      setV((s) => ({ ...s, [k]: val }));
      if (RULES[k] && err[k]) check(k, false, val);
    },
    onBlur: RULES[k] ? (e) => e.target.value && check(k, true, e.target.value) : undefined,
    "aria-invalid": err[k] ? "true" : undefined,
    "aria-describedby": RULES[k] ? `cf-${k}-err` : undefined,
  });
  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const bad = Object.keys(RULES).filter((k) => !check(k, true));
    if (bad.length) {
      focusField(bad[0]);
      return;
    }
    setBusy(true);
    const subject = `${TOPICS[v.topic]}${v.company ? ` (${v.company})` : ""}`;
    const body = [v.message.trim(), "", `Name: ${v.name.trim()}`, `Email: ${v.email.trim()}`, v.company && `Company: ${v.company}`, `Timeline: ${v.timeline}`]
      .filter(Boolean)
      .join("\n");
    // GitHub Pages has no server: the message is handed to the visitor's email app, ready to send.
    window.location.href = `mailto:${links.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setTimeout(() => {
      setBusy(false);
      setSent(true);
      toast("Your email app has the message ready", "check");
      setTimeout(() => document.getElementById("cf-success")?.focus(), 0);
    }, 600);
  };

  const again = () => {
    setV({ name: "", email: "", company: "", topic: "", timeline: "Flexible", message: "" });
    setErr({});
    setSent(false);
    focusField("name");
  };
  const n = v.message.length;
  const first = v.name.trim().split(/\s+/)[0];

  return (
    <section className="container page-head contact-grid" aria-labelledby="contact-title">
      <div className="contact-aside">
        <h1 className="h1" id="contact-title">
          Get in touch
        </h1>
        <p className="lead">Have a system that needs building or a process that needs automating? Tell me about it. I usually reply within a day.</p>
        <div className="avail">
          <div className="avail-row">
            <Icon name="calendar" />
            <div>
              Open to
              <span>Freelance builds, business systems, automation projects and collaboration</span>
            </div>
          </div>
          <div className="avail-row">
            <Icon name="clock" />
            <div>
              {SITE.timeZone}
              <span>Based in {SITE.location}. Replies usually within a day.</span>
            </div>
          </div>
          <div className="avail-row">
            <Icon name="briefcase" />
            <div>
              Best fit
              <span>HR, attendance and workflow systems, business software, n8n automation</span>
            </div>
          </div>
        </div>
        <ul className="elsewhere">
          <li>
            <span>
              <Icon name="mail" />
              Email
            </span>
            <CopyMail />
          </li>
          <li>
            <span>
              <Icon name="phone" />
              Phone
            </span>
            <a className="mono link" href={`tel:${links.phone}`}>
              {links.phoneLocal}
            </a>
          </li>
          <li>
            <span>
              <Icon name="git-branch" />
              Code
            </span>
            <a className="mono link" href={links.github} target="_blank" rel="noopener">
              github.com/adymsma-works
            </a>
          </li>
          <li>
            <span>
              <Icon name="linkedin" />
              LinkedIn
            </span>
            <a className="mono link" href={links.linkedin} target="_blank" rel="noopener">
              Arvin Yapliong
            </a>
          </li>
        </ul>
      </div>

      <div className="form-card">
        {!sent ? (
          <form id="contact-form" noValidate onSubmit={submit} aria-describedby="cf-note">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="cf-name">Name</label>
                <input className="input" type="text" autoComplete="name" required {...field("name")} />
                <FieldError id="cf-name-err" msg={err.name} />
              </div>
              <div className="field">
                <label htmlFor="cf-email">Email</label>
                <input className="input" type="email" autoComplete="email" inputMode="email" required {...field("email")} />
                <FieldError id="cf-email-err" msg={err.email} />
              </div>
              <div className="field">
                <label htmlFor="cf-company">
                  Company <span className="opt">Optional</span>
                </label>
                <input className="input" type="text" autoComplete="organization" {...field("company")} />
              </div>
              <div className="field">
                <label htmlFor="cf-topic">What is it about?</label>
                <select className="select" required {...field("topic")}>
                  <option value="">Choose one</option>
                  {Object.entries(TOPICS).map(([k, t]) => (
                    <option key={k} value={k}>
                      {t}
                    </option>
                  ))}
                </select>
                <FieldError id="cf-topic-err" msg={err.topic} />
              </div>
              <div className="field full">
                <label htmlFor="cf-timeline">
                  Timeline <span className="opt">Optional</span>
                </label>
                <select className="select" {...field("timeline")}>
                  <option>Flexible</option>
                  <option>Within a month</option>
                  <option>This quarter</option>
                  <option>Next quarter</option>
                </select>
              </div>
              <div className="field full">
                <label htmlFor="cf-message">
                  Message{" "}
                  <span className={`counter${n > 1200 ? " is-over" : ""}`} aria-live="polite">
                    {n.toLocaleString("en-US")} / 1,200
                  </span>
                </label>
                <textarea className="textarea" required placeholder="What needs building, and where is it stuck?" {...field("message")} aria-describedby="cf-message-help cf-message-err" />
                <p className="help" id="cf-message-help">
                  A few sentences is plenty. Links are welcome.
                </p>
                <FieldError id="cf-message-err" msg={err.message} />
              </div>
            </div>
            <div className="form-foot">
              <p className="help" id="cf-note">
                Sending opens your email app with this message filled in. Nothing is sent until you press Send there.
              </p>
              <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy || undefined}>
                <span className="btn-label">{busy ? "Opening email" : "Send message"}</span>
                {busy ? <span className="spinner" aria-hidden="true" /> : <Icon name="send" />}
              </button>
            </div>
          </form>
        ) : (
          <div className="success is-in" id="cf-success" tabIndex={-1}>
            <span className="badge">
              <Icon name="check" sw={2} />
            </span>
            <h2>Thanks{first ? `, ${first}` : ""}. Your message is ready.</h2>
            <p>
              Your email app should have opened with your note about {TOPICS[v.topic]?.toLowerCase() || "your project"}. Press Send there and I
              will reply within a day, from {links.email}.
            </p>
            <p className="help">Nothing opened? Copy my address and email me directly.</p>
            <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", justifyContent: "center" }}>
              <CopyMail className="btn btn-ghost" />
              <button className="btn btn-ghost" type="button" onClick={again}>
                Write another message
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="card-block">
        <h2 className="card-block-h">Business card</h2>
        <BizCard />
        <div className="card-block-actions">
          <a className="btn btn-ghost btn-sm" href={links.vcard} download>
            <Icon name="id-card" />
            Save contact (.vcf)
          </a>
          <a className="btn btn-ghost btn-sm" href={links.printableCard} target="_blank" rel="noopener">
            <Icon name="printer" />
            Printable card
          </a>
        </div>
      </div>
    </section>
  );
}
