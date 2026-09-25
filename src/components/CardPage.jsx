import BizCard from "./BizCard";
import { links } from "../data";

export default function CardPage() {
  return (
    <>
      <div className="toolbar">
        <a href={import.meta.env.BASE_URL}>← Portfolio</a>
        <span>
          <a href={links.vcard} download>Save contact</a>
          <button type="button" onClick={() => window.print()}>Print / Save as PDF</button>
        </span>
      </div>
      <main><BizCard as="h1" /></main>
    </>
  );
}
