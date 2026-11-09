// Shared chrome on every page: skip link, fixed header with the pill nav,
// mobile menu, command palette (Ctrl/Cmd+K or "/"), footer and toasts.
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Icon from "./Icon.jsx";
import { ToastProvider } from "./ui.jsx";
import { useCopy, useRevealAll } from "./hooks.js";
import { KINDS, PROJECTS, SITE, links, url } from "../data.js";

const NAV = [
  ["work", "Work", "work/"],
  ["about", "About", "about/"],
  ["uses", "Uses", "uses/"],
  ["resume", "Résumé", "resume/"],
];

function Brand({ onClick }) {
  return (
    // No aria-label: the visible name is the accessible name (voice users say what they see; WCAG 2.5.3).
    <a className="brand" href={url()} onClick={onClick}>
      <span className="logo-mark" aria-hidden="true">
        {SITE.initials}
      </span>
      <span className="brand-name">{SITE.short}</span>
    </a>
  );
}

/* Shortcut hint: "Ctrl K" by default (the prerendered HTML), the Command symbol only on Apple devices. */
const noSubscribe = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
function ShortcutHint() {
  const apple = useSyncExternalStore(noSubscribe, isApple, () => false);
  return (
    <span className="kbd" aria-hidden="true">
      {apple ? <Icon name="command" className="" sw={2} /> : "Ctrl "}K
    </span>
  );
}

/** A native <dialog> driven by React state: open -> showModal(), Esc or backdrop -> onClose. */
function Dialog({ open, onClose, backdropCloses = true, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      try {
        d.showModal();
      } catch {
        d.setAttribute("open", "");
      }
      document.documentElement.classList.add("has-modal");
    } else if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    const handle = () => {
      if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("has-modal");
      onClose();
    };
    d.addEventListener("close", handle);
    return () => d.removeEventListener("close", handle);
  }, [onClose]);
  return (
    <dialog ref={ref} onClick={backdropCloses ? (e) => e.target === e.currentTarget && onClose() : undefined} {...rest}>
      {children}
    </dialog>
  );
}

function PaletteBody({ onDone }) {
  const copy = useCopy();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  const all = useMemo(
    () => [
      { g: "Pages", t: "Home", s: "Start here", h: url(), i: "home" },
      { g: "Pages", t: "Work", s: "Case studies and archive", h: url("work/"), i: "briefcase" },
      { g: "Pages", t: "About", s: "Bio and milestones", h: url("about/"), i: "user" },
      { g: "Pages", t: "Uses", s: "Tools and stack", h: url("uses/"), i: "wrench" },
      { g: "Pages", t: "Résumé", s: "One-page version", h: url("resume/"), i: "file-text" },
      { g: "Pages", t: "Contact", s: "Get in touch", h: url("contact/"), i: "mail" },
      ...PROJECTS.map((p) => ({ g: "Case studies", t: p.name, s: `${KINDS[p.kind]}, ${p.years}`, h: url(`work/${p.slug}/`), i: "briefcase", k: p.summary })),
      { g: "Actions", t: "Copy email address", s: links.email, act: "copy", i: "copy" },
      { g: "Actions", t: "Download résumé", s: "PDF", h: links.resume, i: "download", dl: true },
      { g: "Actions", t: "Save my contact", s: ".vcf for your phone", h: links.vcard, i: "id-card", dl: true },
      { g: "Actions", t: "Printable business card", s: "card.html", h: links.printableCard, i: "printer" },
      { g: "Elsewhere", t: "GitHub", s: "adymsma-works", h: links.github, i: "git-branch", ext: true },
      { g: "Elsewhere", t: "LinkedIn", s: "Arvin Yapliong", h: links.linkedin, i: "linkedin", ext: true },
    ],
    [],
  );
  const term = q.trim().toLowerCase();
  const items = all.filter((x) => !term || `${x.t} ${x.s} ${x.k || ""} ${x.g}`.toLowerCase().includes(term));
  const cur = Math.min(sel, Math.max(0, items.length - 1));

  const run = (x) => {
    if (!x) return;
    onDone();
    if (x.act === "copy") return copy(links.email, "Email copied");
    if (x.ext || x.dl) {
      const a = document.createElement("a");
      a.href = x.h;
      if (x.dl) a.download = "";
      else {
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.click();
      return;
    }
    window.location.href = x.h;
  };

  let group = "";
  return (
    <>
      <div className="palette-field">
        <Icon name="search" />
        <input
          autoFocus
          type="text"
          aria-label="Search the site"
          placeholder="Search pages, projects and actions"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-autocomplete="list"
          aria-activedescendant={items.length ? `pal-${cur}` : undefined}
          autoComplete="off"
          spellCheck="false"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel((cur + 1) % Math.max(1, items.length));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel((cur - 1 + items.length) % Math.max(1, items.length));
            } else if (e.key === "Enter") {
              e.preventDefault();
              run(items[cur]);
            }
          }}
        />
        <span className="kbd" aria-hidden="true">
          Esc
        </span>
      </div>
      <div className="palette-list" id="palette-list" role="listbox" aria-label="Results">
        {!items.length && <div className="palette-empty">No results for "{q}". Try "HRIS", "résumé" or "email".</div>}
        {items.map((x, i) => {
          const head = x.g !== group ? (group = x.g) : null;
          return (
            <div key={`${x.g}-${x.t}`} role="presentation">
              {head && (
                <div className="palette-group" role="presentation">
                  {head}
                </div>
              )}
              <button
                type="button"
                className="palette-item"
                role="option"
                id={`pal-${i}`}
                aria-selected={i === cur}
                tabIndex={-1}
                onMouseMove={() => i !== cur && setSel(i)}
                onClick={() => run(x)}
              >
                <Icon name={x.i} />
                <span>{x.t}</span>
                <span className="hint">{x.s}</span>
              </button>
            </div>
          );
        })}
      </div>
      <div className="palette-foot" aria-hidden="true">
        <span>
          <span className="kbd">
            <Icon name="updown" className="" sw={2} />
          </span>
          Move
        </span>
        <span>
          <span className="kbd">
            <Icon name="enter" className="" sw={2} />
          </span>
          Open
        </span>
        <span>
          <span className="kbd">Esc</span>Close
        </span>
      </div>
    </>
  );
}

function Footer({ openPalette }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>Full-stack developer in {SITE.location}. Well-built systems for businesses. Free websites for churches.</p>
          <div className="footer-actions">
            <a className="btn btn-ghost btn-sm" href={links.vcard} download>
              <Icon name="id-card" />
              Save contact
            </a>
            <button className="btn btn-ghost btn-sm" type="button" onClick={openPalette}>
              <Icon name="search" />
              Search
            </button>
          </div>
        </div>
        <nav className="footer-col" aria-labelledby="fc-site">
          <h2 id="fc-site">Site</h2>
          <ul>
            <li>
              <a href={url()}>Home</a>
            </li>
            <li>
              <a href={url("work/")}>Work</a>
            </li>
            <li>
              <a href={url("uses/")}>Uses</a>
            </li>
          </ul>
        </nav>
        <nav className="footer-col" aria-labelledby="fc-more">
          <h2 id="fc-more">More</h2>
          <ul>
            <li>
              <a href={url("about/")}>About</a>
            </li>
            <li>
              <a href={url("resume/")}>Résumé</a>
            </li>
            <li>
              <a href={url("contact/")}>Contact</a>
            </li>
            <li>
              <a href={links.printableCard}>Business card</a>
            </li>
          </ul>
        </nav>
        <div className="footer-col">
          <h2>Elsewhere</h2>
          <ul>
            <li>
              <a href={links.github} target="_blank" rel="noopener">
                <Icon name="git-branch" />
                GitHub
              </a>
            </li>
            <li>
              <a href={links.linkedin} target="_blank" rel="noopener">
                <Icon name="linkedin" />
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${links.email}`}>
                <Icon name="at-sign" />
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container footer-legal">
        <p>
          &copy; {year} {SITE.name}. Set in Geist. No trackers, no cookies.
        </p>
        <a className="link-arrow" href="#top" onClick={(e) => (e.preventDefault(), window.scrollTo({ top: 0, behavior: "smooth" }))}>
          Back to top <Icon name="arrow-right" sw={2} style={{ transform: "rotate(-90deg)" }} />
        </a>
      </div>
    </footer>
  );
}

function Chrome({ current, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [palOpen, setPalOpen] = useState(false);
  const [palKey, setPalKey] = useState(0);
  const headerRef = useRef(null);
  const sentinelRef = useRef(null);

  const openPalette = useCallback(() => {
    setMenuOpen(false);
    setPalKey((k) => k + 1);
    setPalOpen(true);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closePalette = useCallback(() => setPalOpen(false), []);

  // header gains its backdrop once the page scrolls
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => headerRef.current?.classList.toggle("is-stuck", !es[0].isIntersecting));
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  // Cmd/Ctrl+K or "/" opens search
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t?.tagName || "") || t?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setPalOpen((o) => {
          if (!o) setPalKey((k) => k + 1);
          return !o;
        });
      } else if (e.key === "/" && !typing && !document.querySelector("dialog[open]")) {
        e.preventDefault();
        openPalette();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openPalette]);

  useRevealAll(current);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div ref={sentinelRef} id="top" aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, height: 12, width: 1 }} />
      <header className="site-header" ref={headerRef}>
        <div className="container header-inner">
          <Brand />
          <nav className="nav-pill" aria-label="Primary">
            {NAV.map(([id, label, path]) => (
              <a key={id} href={url(path)} aria-current={current === id ? "page" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button className="search-btn" type="button" aria-keyshortcuts="Control+K Meta+K" onClick={openPalette}>
              <Icon name="search" />
              <span className="label">Search</span>
              <ShortcutHint />
            </button>
            <a className="btn btn-primary btn-sm" href={url("contact/")} aria-current={current === "contact" ? "page" : undefined}>
              Get in touch
            </a>
            <button className="menu-btn" type="button" aria-label="Open menu" aria-haspopup="dialog" aria-controls="menu" onClick={() => setMenuOpen(true)}>
              <Icon name="menu" sw={2} />
            </button>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <div className="view is-active">{children}</div>
      </main>

      <Footer openPalette={openPalette} />

      <Dialog className="menu-sheet" id="menu" aria-label="Site menu" open={menuOpen} onClose={closeMenu} backdropCloses={false}>
        <div className="menu-top">
          <Brand onClick={closeMenu} />
          <button className="menu-btn" type="button" aria-label="Close menu" style={{ display: "grid" }} onClick={closeMenu}>
            <Icon name="x" sw={2} />
          </button>
        </div>
        <nav aria-label="Mobile">
          <ul className="menu-links">
            {[["home", "Home", ""], ...NAV].map(([id, label, path], i) => (
              <li key={id} style={{ "--i": i }}>
                <a href={url(path)} aria-current={current === id ? "page" : undefined}>
                  {label}
                  {id === "work" && <span className="meta">{PROJECTS.length} case studies</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-foot">
          <a className="btn btn-primary btn-block" href={url("contact/")}>
            Get in touch
          </a>
          <button className="btn btn-ghost btn-block" type="button" onClick={openPalette}>
            Search the site
          </button>
        </div>
      </Dialog>

      <Dialog className="palette" id="palette" aria-label="Search the site" open={palOpen} onClose={closePalette}>
        {palOpen && <PaletteBody key={palKey} onDone={closePalette} />}
      </Dialog>
    </>
  );
}

export default function Layout(props) {
  return (
    <ToastProvider>
      <Chrome {...props} />
    </ToastProvider>
  );
}
