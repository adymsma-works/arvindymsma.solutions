import Layout from "./Layout.jsx";
import Home from "./pages/Home.jsx";
import Work from "./pages/Work.jsx";
import Case from "./pages/Case.jsx";
import About from "./pages/About.jsx";
import Uses from "./pages/Uses.jsx";
import Resume from "./pages/Resume.jsx";
import Contact from "./pages/Contact.jsx";

const PAGES = { home: Home, work: Work, case: Case, about: About, uses: Uses, resume: Resume, contact: Contact };
const NAV_FOR = { case: "work" };

/** One app for every page; the HTML file's data-page picks the page. */
export default function App({ page = "home", slug }) {
  const Page = PAGES[page] || Home;
  return (
    <Layout current={NAV_FOR[page] || page}>
      <Page slug={slug} />
    </Layout>
  );
}
