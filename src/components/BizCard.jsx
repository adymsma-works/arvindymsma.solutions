import { links } from "../data";
import { profile } from "../profile";

// Let long URLs wrap after "/" and "." instead of being cut off.
const breakable = (url) =>
  url.split(/(?<=[/.])/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]));

/** The business card. Shared by the site section and the printable card page,
 *  so the two can never drift apart. Sizes scale with its container width. */
export default function BizCard({ as: Heading = "p" }) {
  return (
    <div className="bizcard-frame">
      <div className="bizcard">
        <div className="bizcard-left">
          <Heading className="bc-logo">MSM<span>A</span></Heading>
          <p className="bc-dept-caps">Solutions Department</p>
          <p className="bc-tag">{profile.tagline}</p>
        </div>
        <div className="bizcard-right">
          <p className="bc-name">{profile.name}</p>
          <p className="bc-role">{profile.role}</p>
          <p className="bc-dept">{profile.org}</p>
          <ul className="bc-contact">
            <li><a href={`mailto:${links.email}`}><span aria-hidden="true">✉</span> {links.email}</a></li>
            <li><a href={`tel:${links.phone}`}><span aria-hidden="true">☎</span> {links.phoneLocal}</a></li>
            <li><a className="bc-url" href={links.siteUrl}><span aria-hidden="true">↗</span> <span>{breakable(links.siteDisplay)}</span></a></li>
          </ul>
          <img className="bc-qr" src={links.qrCode} width="96" height="96" alt={`QR code that opens ${links.siteDisplay}`} />
        </div>
      </div>
    </div>
  );
}
