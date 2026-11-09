// Shared Basalt building blocks: toasts, copy, reveal-on-scroll, the beam,
// count-ups, product-window shots, work cards and the contact band.
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { MOCKS, PIECES } from "./mocks.jsx";
import { KINDS, SITE, links, url } from "../data.js";
import { ToastCtx, hasIO, rand, reduceMotion, useCopy } from "./hooks.js";

/* ---------------- toasts ---------------- */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((msg, icon = "check") => {
    const id = Math.random().toString(36).slice(2);
    setItems((xs) => [...xs, { id, msg, icon, out: false }]);
    setTimeout(() => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, out: true } : x))), 3200);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 3420);
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast${t.out ? " out" : ""}`}>
            <Icon name={t.icon} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function CopyMail({ className = "copy-mail" }) {
  const copy = useCopy();
  return (
    <button
      className={className}
      type="button"
      aria-label={`Copy email address ${links.email}`}
      onClick={(e) => copy(links.email, "Email copied", e.currentTarget)}
    >
      {links.email}
      <Icon name="copy" />
    </button>
  );
}

/* ---------------- the beam: a seam of light falls down a rail, then rests ---------------- */
export function Rail({ dir = "v", className = "" }) {
  const beamRef = useRef(null);
  useEffect(() => {
    const b = beamRef.current;
    if (!b || reduceMotion()) return;
    const rail = b.parentElement;
    const horiz = dir === "h";
    let visible = false;
    let timer = null;
    const run = () => {
      if (!visible) return;
      const size = horiz ? rail.offsetWidth : rail.offsetHeight;
      if (!size) {
        timer = setTimeout(run, 1500);
        return;
      }
      b.style.setProperty("--len", `${Math.round(horiz ? rand(160, 280) : rand(80, 150))}px`);
      b.style.setProperty("--travel", `${size}px`);
      b.style.setProperty("--dur", `${(horiz ? rand(3, 4.4) : rand(1.9, 3.4)).toFixed(2)}s`);
      b.classList.remove("run");
      void b.offsetWidth;
      b.classList.add("run");
    };
    const onEnd = () => {
      b.classList.remove("run");
      clearTimeout(timer);
      timer = setTimeout(run, rand(2800, 7500));
    };
    b.addEventListener("animationend", onEnd);
    let io;
    if (hasIO()) {
      io = new IntersectionObserver((es) =>
        es.forEach((e) => {
          visible = e.isIntersecting;
          if (visible && !b.classList.contains("run")) {
            clearTimeout(timer);
            timer = setTimeout(run, rand(250, 900));
          }
        }),
      );
      io.observe(rail);
    } else {
      visible = true;
      run();
    }
    return () => {
      clearTimeout(timer);
      io?.disconnect();
      b.removeEventListener("animationend", onEnd);
    };
  }, [dir]);
  return (
    <span className={`rail rail--${dir} ${className}`.trim()} aria-hidden="true">
      <span className="beam" ref={beamRef} />
    </span>
  );
}

/* ---------------- product window shot: stone backdrop + HTML product UI ---------------- */
export function Shot({ p, wf, x, y, piece, pw, k, decorative, eager, priority, cls = "", label }) {
  const style = {};
  if (wf) style["--wf"] = wf;
  if (x != null) style["--x"] = x;
  if (y != null) style["--y"] = y;
  if (piece) {
    style["--pw"] = pw;
    style["--k"] = k || 0.64;
  }
  const a11y = decorative ? { "aria-hidden": true } : { role: "img", "aria-label": label || `${p.name} interface: ${p.summary}` };
  const Mock = MOCKS[p.mock];
  const Piece = piece && PIECES[piece];
  return (
    <div className={`shot${piece ? " shot--piece" : ""}${cls ? ` ${cls}` : ""}`} {...a11y}>
      <img
        className="shot-bg"
        src={url(p.cover)}
        srcSet={`${url(p.cover.replace(".webp", "-800.webp"))} 800w, ${url(p.cover)} 1600w`}
        sizes="(max-width: 800px) 100vw, 90vw"
        alt=""
        width="1600"
        height="1067"
        loading={eager || priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
      />
      <div className="shot-app" aria-hidden="true" style={style}>
        {Piece ? (
          <div className="mk-piece">
            <Piece />
          </div>
        ) : (
          <Mock />
        )}
      </div>
    </div>
  );
}

const VARIANTS = {
  wide: { wf: 0.86, x: "9%", y: "11%" },
  seven: { wf: 1.12, x: "7%", y: "10%" },
  five: { wf: 1.34, x: "8%", y: "9%" },
  split: { wf: 1.12, x: "8%", y: "10%" },
  index: { wf: 1.12, x: "8%", y: "10%" },
};

// priority: the first card on /work/ is the largest thing on a phone screen, so it loads first and skips the fade-in.
export function WorkCard({ p, variant = "index", i = 0, priority = false }) {
  const o = VARIANTS[variant] || VARIANTS.index;
  return (
    <article className={`work-card glow${variant !== "index" ? ` work-card--${variant}` : ""}`} data-reveal={priority ? undefined : ""} style={{ "--i": i % 2 }}>
      <a href={url(`work/${p.slug}/`)}>
        <Shot p={p} wf={o.wf} x={o.x} y={o.y} decorative priority={priority} />
        <div className="work-meta">
          <div className="top">
            <h3>{p.name}</h3>
            <span className="meta">
              {KINDS[p.kind]}, {p.years}
            </span>
          </div>
          <p>{p.summary}</p>
          <ul className="outcomes-inline">
            {p.card.map((c) => {
              // numbers get the mono emphasis ("6 modules"); plain phrases stay plain
              const [first, ...rest] = c.split(" ");
              return <li key={c}>{/^[\d.,]+/.test(first) ? <><strong>{first}</strong> {rest.join(" ")}</> : c}</li>;
            })}
          </ul>
          <span className="work-more">
            Read the case study <Icon name="arrow-right" />
          </span>
        </div>
      </a>
    </article>
  );
}

/* ---------------- closing contact band ---------------- */
export function CtaBand() {
  return (
    <div className="section container">
      <div className="cta-card" data-reveal>
        <Rail dir="h" />
        <div className="cta-main">
          <h2 className="h2 two-tone">
            Have a system that needs building? <span className="muted">Or a process that needs automating.</span>
          </h2>
          <div className="cta-actions">
            <a className="btn btn-primary" href={url("contact/")}>
              Get in touch <Icon name="arrow-right" className="i-arrow" sw={2} />
            </a>
            <CopyMail />
          </div>
        </div>
        <ul className="cta-facts">
          <li>
            <span className="meta">Open to</span>
            <strong>{SITE.openTo}</strong>
          </li>
          <li>
            <span className="meta">Reply time</span>
            <strong>{SITE.replyTime}</strong>
          </li>
          <li>
            <span className="meta">Best fit</span>
            <strong>{SITE.bestFit}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}

export function ArrowLink({ href, children }) {
  return (
    <a className="link-arrow" href={href}>
      {children} <Icon name="arrow-right" sw={2} />
    </a>
  );
}
