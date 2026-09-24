import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Stack from "./components/Stack";
import Contact from "./components/Contact";

const nav = [["Work", "#work"], ["Experience", "#experience"], ["Stack", "#stack"], ["Contact", "#contact"]];

export default function App() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <nav className="nav" aria-label="Main">
        <div className="wrap nav-in">
          <a className="brand" href="#top">Arvin<span className="last"> D. Yapliong</span></a>
          <ul>
            {nav.map(([label, href]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>
      </nav>
      <main id="main">
        <span id="top" />
        <Hero />
        <Work />
        <Experience />
        <Stack />
        <Contact />
      </main>
      <footer className="foot">
        <div className="wrap">
          <p>© 2026 Arvin D. Yapliong. Built with React and Vite.</p>
        </div>
      </footer>
    </>
  );
}
