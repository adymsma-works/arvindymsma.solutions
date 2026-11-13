import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Icon from "../Icon.jsx";
import { ArrowLink, CtaBand, Rail, WorkCard } from "../ui.jsx";
import { reduceMotion } from "../hooks.js";
import { APPROACH, PROJECTS, USES, XP, url } from "../../data.js";

/* The bunny loop, playing inside a Basalt product window next to the headline.
   Plays only while on screen; never autoplays for prefers-reduced-motion. */
function HeroWindow() {
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // iOS needs muted set before it will play inline
    v.setAttribute("muted", "");
    const sync = () => setPaused(v.paused);
    v.addEventListener("play", sync);
    v.addEventListener("pause", sync);
    if (reduceMotion()) {
      userPaused.current = true;
      v.poster = url("hero/bunny-loop-still.webp");
    }
    const io = new IntersectionObserver(([e]) => {
      if (userPaused.current) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.1 });
    io.observe(v);
    return () => {
      io.disconnect();
      v.removeEventListener("play", sync);
      v.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    userPaused.current = !v.paused;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <figure className="hero-window" data-hero style={{ "--i": 3 }}>
      <div className="vwin">
        <div className="mk-bar vwin-bar">
          <div className="mk-dots">
            <i />
            <i />
            <i />
          </div>
          <div className="mk-title">
            adymsma-works&nbsp;&nbsp;<span className="mk-muted">bunny.loop</span>
          </div>
          <button className="vwin-btn" type="button" onClick={toggle} aria-label={paused ? "Play the animation" : "Pause the animation"}>
            <Icon name={paused ? "play" : "pause"} />
          </button>
        </div>
        <video ref={videoRef} poster={url("hero/bunny-loop-poster.webp")} muted loop playsInline preload="metadata" disablePictureInPicture aria-hidden="true" tabIndex={-1} width="1280" height="720">
          <source src={url("hero/bunny-loop-720p.webm")} type="video/webm" />
          <source src={url("hero/bunny-loop-720p.mp4")} type="video/mp4" />
        </video>
      </div>
      <figcaption className="visually-hidden">
        A 10-second animation of my avatar, a green bunny with headphones, popping out of a meadow and living through dawn, day, a starry
        night with my GitHub handle, and back to dawn.
      </figcaption>
    </figure>
  );
}

/* Experience: vertical tab rail with the falling beam and a sliding indicator. */
function XpTabs() {
  const [i, setI] = useState(0);
  const railRef = useRef(null);
  const indRef = useRef(null);
  const panelRef = useRef(null);
  const tabs = useRef([]);
  const first = useRef(true);

  const place = () => {
    const t = tabs.current[i];
    const ind = indRef.current;
    if (!t || !ind || !t.offsetHeight) return;
    ind.style.transform = `translateY(${t.offsetTop}px)`;
    ind.style.height = `${t.offsetHeight}px`;
  };
  useLayoutEffect(() => {
    place();
    const p = panelRef.current;
    if (!first.current && p && !reduceMotion()) {
      p.classList.remove("swap");
      void p.offsetWidth;
      p.classList.add("swap");
    }
    first.current = false;
    const rail = railRef.current;
    const t = tabs.current[i];
    if (rail && t && rail.scrollWidth > rail.clientWidth) rail.scrollTo({ left: t.offsetLeft - 16, behavior: reduceMotion() ? "auto" : "smooth" });
  });
  useEffect(() => {
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  });

  const select = (n, focus) => {
    const k = (n + XP.length) % XP.length;
    setI(k);
    if (focus) tabs.current[k]?.focus();
  };
  const x = XP[i];
  return (
    <div className="xp-tabs" data-reveal style={{ "--i": 1 }}>
      <div
        className="xp-rail"
        ref={railRef}
        role="tablist"
        aria-label="Employers"
        aria-orientation="vertical"
        onKeyDown={(e) => {
          const n = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: XP.length - 1 }[e.key];
          if (n === undefined) return;
          e.preventDefault();
          select(n, true);
        }}
      >
        <Rail dir="v" />
        <span className="xp-indicator" aria-hidden="true" ref={indRef} />
        {XP.map((t, j) => (
          <button
            key={t.id}
            type="button"
            className="xp-tab"
            id={`xp-tab-${t.id}`}
            role="tab"
            aria-controls="xp-panel"
            aria-selected={j === i}
            tabIndex={j === i ? 0 : -1}
            ref={(el) => (tabs.current[j] = el)}
            onClick={() => select(j)}
          >
            <span className="xp-logo" aria-hidden="true">
              {t.chip}
            </span>
            <span className="name">{t.co}</span>
            <span className="yrs">{t.when}</span>
          </button>
        ))}
      </div>
      <div className="xp-panel" id="xp-panel" role="tabpanel" tabIndex={0} aria-labelledby={`xp-tab-${x.id}`} ref={panelRef}>
        <h3 className="xp-role">
          {x.role} <span className="at">@ {x.co}</span>
        </h3>
        <div className="xp-when">
          <span className="meta">{x.when}</span>
          {x.where && <span className="meta">{x.where}</span>}
        </div>
        <p className="xp-summary">{x.summary}</p>
        <ul className="checks">
          {x.bullets.map((b) => (
            <li key={b}>
              <Icon name="check" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        {x.stack.length > 0 && (
          <ul className="stack-row" aria-label="Tools">
            {x.stack.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const variants = ["wide", "seven", "five", "split"];
  return (
    <>
      <section className="container hero hero--window" aria-labelledby="home-title">
        <h1 className="hero-title" id="home-title" data-hero style={{ "--i": 0 }}>
          I don't just build websites. <span className="accent">I build the systems a business runs on,</span> and I keep them working after&nbsp;launch.
        </h1>
        <div className="hero-row">
          <div className="hero-copy">
            <p className="hero-lede" data-hero style={{ "--i": 1 }}>
              I'm Arvin, a junior AI engineer at MSMA in Cebu City. I build business software and n8n workflows that do the copy-paste
              nobody signed up for. Claude Code types; I read and test every change before it ships. The headphones are usually on, which
              is why the bunny wears them too.
            </p>
            <p className="hero-building" data-hero style={{ "--i": 2 }}>
              Building something new at MSMA. It isn't public yet, so it isn't here.
            </p>
          </div>
          <HeroWindow />
        </div>
      </section>

      <section className="section" id="selected-work" aria-labelledby="work-h">
        <div className="container">
          <div className="sec-head" data-reveal>
            <div>
              <h2 className="h2" id="work-h">
                Selected work
              </h2>
              <p>
                Two projects from my internships: a records system I led, and POS software I tested and documented.
              </p>
            </div>
            <ArrowLink href={url("work/")}>All projects</ArrowLink>
          </div>
          <div className="work-grid">
            {PROJECTS.slice(0, 4).map((p, i) => (
              <WorkCard key={p.slug} p={p} variant={variants[i]} i={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="experience" aria-labelledby="xp-h">
        <div className="container xp-grid">
          <div className="xp-intro" data-reveal>
            <h2 className="h2" id="xp-h">
              Experience
            </h2>
            <p>Two internships and one full-time role, all in business software.</p>
            <ArrowLink href={url("resume/")}>Read the résumé</ArrowLink>
          </div>
          <XpTabs />
        </div>
      </section>

      <section className="section" id="how-i-work" aria-labelledby="how-h">
        <div className="container write-split">
          <div>
            <div className="sec-head" data-reveal>
              <div>
                <h2 className="h2" id="how-h">
                  How I work
                </h2>
                <p>Five steps, in this order, on every system.</p>
              </div>
              <ArrowLink href={url("about/")}>More about me</ArrowLink>
            </div>
            <ul className="post-list">
              {APPROACH.map(([t, d], i) => (
                <li key={t} className="post-row step-row" data-reveal style={{ "--i": i % 3 }}>
                  <div className="step-in">
                    <span className="step-n mono">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{t}</h3>
                      <p>{d}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <aside className="uses-card" aria-labelledby="uses-h" data-reveal style={{ "--i": 2 }}>
            <h3 id="uses-h">
              <Icon name="wrench" />
              Uses
            </h3>
            <p>The short list. The long one is on its own page.</p>
            <ul className="uses-mini">
              {USES.map((g) => (
                <li key={g.group}>
                  <strong>{g.items[0][1]}</strong>
                  <span>{g.items[0][2]}</span>
                </li>
              ))}
            </ul>
            <ArrowLink href={url("uses/")}>Everything I use</ArrowLink>
          </aside>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
