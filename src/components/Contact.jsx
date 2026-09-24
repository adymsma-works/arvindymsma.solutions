import Section from "./Section";
import { links } from "../data";

export default function Contact() {
  return (
    <Section id="contact" title="Contact" tone="ink">
      <p className="big">Have a system that needs building or a process that needs automating? Send me a message.</p>
      <p>Available for software development, business systems, automation projects and collaboration.</p>
      <ul className="contact-list">
        <li><a href={`mailto:${links.email}`}>{links.email}</a></li>
        <li><a href={links.github} target="_blank" rel="noreferrer">GitHub: adymsma-works</a></li>
        <li><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn: Arvin Yapliong</a></li>
        <li><a href={links.company} target="_blank" rel="noreferrer">MSMA Solutions</a></li>
        <li><a href={links.resume} download>Resume (PDF)</a></li>
      </ul>
    </Section>
  );
}
