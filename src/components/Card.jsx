import Section from "./Section";
import BizCard from "./BizCard";
import { links } from "../data";

export default function Card() {
  return (
    <Section id="card" title="Business card">
      <p>My business card, live. Save my contact in one tap, or open the printable version to save it as a PDF.</p>
      <BizCard />
      <div className="actions">
        <a className="btn primary" href={links.vcard} download>Save contact (.vcf)</a>
        <a className="btn" href={links.printableCard} target="_blank" rel="noopener">Open printable card <span aria-hidden="true">↗</span></a>
      </div>
    </Section>
  );
}
