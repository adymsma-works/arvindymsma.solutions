import Section from "./Section";
import { links, card } from "../data";

export default function Card() {
  return (
    <Section id="card" title="Business card">
      <p>My actual business card, live. Save my contact in one tap or open the printable version to attach to an email.</p>

      <div className="bizcard">
        <div className="bizcard-left">
          <h3>
            MSM<span>A</span>
          </h3>
          <p className="dept">Solutions Department</p>
          <p className="tag">{card.tag}</p>
        </div>
        <div className="bizcard-right">
          <p className="bc-name">Arvin D. Yapliong</p>
          <p className="bc-role">IT Associate | Developer</p>
          <p className="bc-dept">MSMA Solutions Department</p>
          <ul className="bc-contact">
            <li><a href={`mailto:${links.email}`}>{links.email}</a></li>
            <li><a href={`tel:+63${links.phone.slice(1)}`}>{links.phone}</a></li>
          </ul>
          <div className="bc-foot">
            <a href={links.siteUrl} target="_blank" rel="noreferrer">adymsma-works.github.io/arvindymsma.solutions</a>
            <img className="bc-qr" src={`${import.meta.env.BASE_URL}qr.png`} width="64" height="64" alt="QR code linking to this portfolio" />
          </div>
        </div>
      </div>

      <div className="actions">
        <a className="btn primary" href={links.vcard} download>Save contact (.vcf)</a>
        <a className="btn" href={links.printableCard} target="_blank" rel="noreferrer">Open printable card</a>
      </div>
    </Section>
  );
}
