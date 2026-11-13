// Who you are and how to reach you: the ONE place for contact details.
// Used by the React site, the printable card, the .vcf contact file,
// the QR code, the share tags and the search-engine data.
// Plain data only (no import.meta), so vite.config.js can read it too.

export const profile = {
  name: "Arvin D. Yapliong",
  displayName: "Arvin Dy", // browser tab, share titles; the full name stays on the vCard, resume and search data
  firstName: "Arvin",
  lastName: "Yapliong",
  middleInitial: "D.",
  role: "Junior AI Engineer",
  headline: "Junior AI Engineer",
  org: "MSMA Solutions Department",
  city: "Cebu City",
  country: "Philippines",
  countryCode: "PH",
  timeZone: "Asia/Manila",
  email: "ady.msma@gmail.com",
  // E.164 format (+63...). The local display format is derived from it.
  phone: "+639670872093",
  github: "https://github.com/adymsma-works",
  githubUser: "adymsma-works",
  linkedin: "https://www.linkedin.com/in/arvin-y-18a8312a5",
  facebook: "https://www.facebook.com/profile.php?id=61596157541965",
  company: "https://msma.ph",
  tagline: "Building solutions. Driving progress.",
  summary:
    "Junior AI engineer in Cebu City. I build business software and n8n automations with Claude Code, and I read and test every change before it ships.",
  // Home page share preview only (Facebook, Messenger, search result). Written for shop owners; each claim is shown on the home page.
  homeSummary:
    "I build small workflows for shops in Cebu. Try the demo: a customer asks on Messenger, your Google Sheet answers, and orders are emailed to you.",
  resumeFile: "Arvin_Yapliong_Developer_Resume.pdf",
  vcardFile: "arvin-yapliong.vcf",
};

/** "+639670872093" -> "0967 087 2093" (how people in the PH write it). */
export function localPhone(e164 = profile.phone) {
  const d = e164.replace(/^\+63/, "0");
  return d.length === 11 ? `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}` : d;
}
