import Section from "./Section";
import { links } from "../data";
import { profile } from "../profile";

const ext = { target: "_blank", rel: "noopener" };

export default function Contact() {
  return (
    <Section id="contact" title="Contact" tone="ink">
      <p className="big">Have a system that needs building or a process that needs automating? Send me a message.</p>
      <p>Available for software development, business systems, automation projects and collaboration. I usually reply within a day ({profile.city}, UTC+8).</p>
      <div className="actions">
        <a className="btn light" href={`mailto:${links.email}?subject=${encodeURIComponent("Project inquiry")}`}>Email me</a>
        <a className="btn ghost-light" href={links.resume} download>Resume (PDF)</a>
      </div>
      <ul className="contact-list">
        <li><a href={`mailto:${links.email}`}><span>Email</span>{links.email}</a></li>
        <li><a href={`tel:${links.phone}`}><span>Phone</span>{links.phoneLocal}</a></li>
        <li><a href={links.linkedin} {...ext}><span>LinkedIn</span>Arvin Yapliong ↗</a></li>
        <li><a href={links.github} {...ext}><span>GitHub</span>{profile.githubUser} ↗</a></li>
        <li><a href={links.company} {...ext}><span>Company</span>MSMA Solutions ↗</a></li>
        <li><a href={links.vcard} download><span>Contact card</span>Save to phone (.vcf)</a></li>
      </ul>
    </Section>
  );
}
