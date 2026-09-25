import Hero from "./components/Hero";
import Work from "./components/Work";
import Experience from "./components/Experience";
import Stack from "./components/Stack";
import Card from "./components/Card";
import Contact from "./components/Contact";
import { useActiveSection } from "./hooks/useActiveSection";
import { profile } from "./profile";

const nav = [
  ["Work", "work"],
  ["Experience", "experience"],
  ["Stack", "stack"],
  ["Card", "card"],
  ["Contact", "contact"],
];

export default function App() {
  const active = useActiveSection(nav.map(([, id]) => id));

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <nav className="nav" aria-label="Main">
        <div className="wrap nav-in">
          <a className="brand" href="#top" aria-label={`${profile.name}, back to top`}>
            {profile.firstName}<span className="last"> {profile.middleInitial} {profile.lastName}</span>
          </a>
          <ul>
            {nav.map(([label, id]) => (
              <li key={id}>
                <a href={`#${id}`} aria-current={active === id ? "true" : undefined}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main id="main" tabIndex={-1}>
        <Hero />
        <Work />
        <Experience />
        <Stack />
        <Card />
        <Contact />
      </main>
      <footer className="foot">
        <div className="wrap foot-in">
          <p>© {new Date().getFullYear()} {profile.name}. Built with React and Vite.</p>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
