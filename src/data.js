// ALL portfolio text lives here, in the shape the Basalt pages read.
// Contact details (name, email, phone, links) live in ./profile.js.
// House rules (from the Basalt skill): real facts only, no em dashes,
// no emoji, numbers only where they are true.
import { profile, localPhone } from "./profile.js";
import { siteUrl, siteDisplay, qrCode } from "virtual:site";

export const BASE = import.meta.env.BASE_URL;
export const url = (path = "") => `${BASE}${path}`;

export const links = {
  email: profile.email,
  phone: profile.phone,
  phoneLocal: localPhone(),
  github: profile.github,
  linkedin: profile.linkedin,
  company: profile.company,
  siteUrl,
  siteDisplay,
  qrCode,
  resume: url(profile.resumeFile),
  vcard: url(profile.vcardFile),
  printableCard: url("card.html"),
};

export const SITE = {
  name: profile.name,
  short: `${profile.firstName} ${profile.lastName}`,
  initials: "AY",
  role: "Junior AI engineer",
  location: `${profile.city}, ${profile.country}`,
  timeZone: "Philippine time, UTC+8",
  openTo: "Freelance builds, automation, collaboration",
  replyTime: "Usually within a day",
  bestFit: "Businesses that have outgrown spreadsheets and paper. Churches and ministries: website design and build, free. Small stores: a free consultation to find the fix.",
  tagline: "Well-built systems for businesses. Websites for churches and ministries, built free.",
  summary:
    "Junior developer working toward AI engineering. I use AI coding tools to build faster and I check their code before it goes live. By day I am a junior AI engineer at MSMA in Cebu City. On the side I build business systems and workflow automation (for example: a customer fills your website or Facebook form, the details land in your Google Sheet, and you are notified right away, no retyping), design and build websites for churches and ministries for free, and give small stores a free consultation: I study the problem, propose a fix, and can build it.",
  education: [
    ["BS Information Technology", "University of Cebu, 2025"],
    ["TVL Computer Programming", "College of Technological Sciences Cebu, 2019"],
    ["Google IT Support Certificate", "Credential ID M9WPKPBQEDGZ"],
    ["Microsoft IT Support Specialist", "Credential ID K1V9PSQ9X0PC"],
  ],
};

export const KINDS = {
  inhouse: "In-house",
  internship: "Internship",
  personal: "Personal",
  team: "Team project",
  school: "Capstone",
};

/* ---- Case studies (order = order on the home page: wide, seven, five) ----
   Each slug needs a page file: work/<slug>/index.html (copy an existing one).
   npm run check fails the deploy if one is missing. */
export const PROJECTS = [
  {
    slug: "bail-bonds-records",
    name: "Bail bonds and records system",
    kind: "internship",
    years: "2025",
    mock: "bail",
    cover: "images/cover-bail-bonds-records.webp",
    summary: "As lead developer, I replaced hand-typed bail bond records with one searchable system, then kept it running after launch.",
    intro:
      "During my web developer internship at Alpha Insurance & Surety Company, I was the lead developer of a system to manage bail bonds and records, replacing the traditional encoding the team relied on. I built it and kept maintaining it after launch.",
    facts: [
      ["Role", "Lead developer, web developer intern"],
      ["Timeline", "2025"],
      ["Company", "Alpha Insurance & Surety Company Inc."],
      ["Status", "Developed and maintained"],
    ],
    card: ["Lead developer", "Manual encoding replaced"],
    outcomes: [],
    problem: [
      "Bail bond records were encoded by hand. Every new bond meant typing the same details again, and finding an old record meant searching wherever it had been filed.",
      "The team needed one place where a bond is entered once and found again quickly.",
    ],
    constraints: [
      ["Accuracy first", "These are legal and financial records. A typo in a bond number is not a cosmetic bug."],
      ["Fit the routine", "Staff already had an encoding process, so the system had to follow it instead of fighting it."],
      ["Built to be run", "The system had to stay usable for the team day to day, not just on launch day."],
    ],
    approach: [
      ["database", "One record per bond", "Each bond is entered once with its details and status, and later updates attach to that record instead of creating a new copy."],
      ["search", "Search before scrolling", "Records are found by bond number or name, which is how staff were already asking for them."],
      ["rotate", "Build, then maintain", "After launch I kept fixing and adjusting the system as the team used it, which is where most of the real requirements showed up."],
    ],
    figure: {
      type: "flow",
      steps: [
        ["Encode once", "Bond details go into one form, checked before saving."],
        ["Search", "Find any record by bond number or name."],
        ["Update", "Status changes attach to the same record."],
      ],
      caption: "From traditional encoding to one record per bond.",
    },
    gallery: [
      { piece: "bbRecord", pw: 22, k: 0.6, label: "A bond record keeps its details and its status history together." },
      { piece: "bbSearch", pw: 22, k: 0.74, label: "Search by bond number or name instead of paging through files." },
    ],
    results: [
      "The team moved from traditional encoding to records they can search. I developed the system as lead developer and maintained it through the rest of my internship.",
    ],
    reflection:
      "Leading a build as an intern meant asking a lot of questions early. The answers that mattered most came after launch, from the people encoding records every day.",
  },
  {
    slug: "pos-implementation",
    name: "POS system testing",
    kind: "internship",
    years: "2024",
    mock: "pos",
    cover: "images/cover-pos-implementation.webp",
    summary: "POS systems for sales, inventory and customers: finding bugs and keeping the implementation and training documents current.",
    intro:
      "As a manual QA tester intern at Cebu Innosoft Solutions Services, I worked on POS systems for sales, inventory and customers. The company's developers built the software; my part was testing it to find bugs and keeping the implementation notes and in-store training documents up to date.",
    facts: [
      ["Role", "Manual QA tester intern"],
      ["Timeline", "Sep – Oct 2024"],
      ["Company", "Cebu Innosoft Solutions Services Inc."],
      ["Scope", "Testing and documentation"],
    ],
    card: ["Bugs found", "Docs kept current"],
    outcomes: [],
    problem: [
      "A POS system only helps when it works at the counter and the people using it have instructions that match the screen.",
      "My job sat between the developers and the stores: finding and reporting what broke, and keeping the notes and guides accurate as the software changed.",
    ],
    constraints: [
      ["Live businesses", "Stores kept selling while the software changed."],
      ["Every comfort level", "The guides were read by confident users and first-timers, so they had to be plain."],
      ["Docs that keep up", "Each change to the software could make a guide wrong."],
    ],
    approach: [
      ["list", "Find the bugs", "I tested the sales, inventory and customer features and reported what broke to the developers."],
      ["file-text", "Keep the notes current", "I maintained the implementation notes used when setting up the system for a store."],
      ["user", "Keep the training guides current", "I updated the in-store training documents so they matched how the software actually worked."],
    ],
    figure: {
      type: "flow",
      steps: [
        ["Test", "Use the features the way a store would."],
        ["Report", "Send each bug to the developers."],
        ["Document", "Update the notes and training guides."],
      ],
      caption: "An implementation is mostly the work around the software.",
    },
    gallery: [
      { piece: "posReceipt", pw: 22, k: 0.6, label: "The counter view: one of the screens I tested." },
      { piece: "posStock", pw: 22, k: 0.74, label: "The inventory view: stock screens were part of what I tested." },
    ],
    results: [
      "Bugs I found went to the developers, and the implementation notes and training documents stayed in step with the software.",
    ],
    reflection:
      "Implementation taught me that the hardest week for any software is the first week someone else uses it. I still design screens with that week in mind.",
  },
];

/* ---- Everything else (work page archive) ---- */
export const ARCHIVE = [
  { y: "2026", n: "This portfolio", d: "React and Vite on GitHub Pages, with a printable business card, QR code and contact file.", k: "personal", w: "React, Vite, GitHub Actions", ext: "https://github.com/adymsma-works/arvindymsma.solutions" },
  { y: "2026", n: "Bunny hero loop", d: "The 10-second animated loop on the home page, starring my avatar.", k: "personal", w: "Remotion, React, ffmpeg" },
  { y: "2025", n: "Bail bonds and records system", d: "Replaced manual encoding with searchable bond records.", k: "internship", w: "", slug: "bail-bonds-records" },
  { y: "2024", n: "POS system testing", d: "Sales, inventory and customers: testing, bug reports, implementation and training documents.", k: "internship", w: "", slug: "pos-implementation" },
  { y: "2024", n: "BinBetter", d: "Capstone project. I was one of the programmers.", k: "school", w: "" },
  { y: "2023", n: "eSportsPP", d: "Project manager and programmer: managed the project while building features.", k: "team", w: "" },
];

/* ---- Experience (home tabs, résumé) ---- */
export const XP = [
  {
    id: "msma", co: "MSMA Solutions", chip: "MS", role: "Junior AI Engineer", when: "Now", where: profile.city,
    summary: "Building and testing an in-house software product that has not launched yet.",
    bullets: [
      "Building and testing features for an in-house product that is not public yet",
      "Reviewing AI-written code before it merges, with a regression test for every bug fix",
    ],
    stack: [],
  },
  {
    id: "alpha", co: "Alpha Insurance & Surety", chip: "AI", role: "Web Developer Intern", when: "Feb – Apr 2025", where: "",
    summary: "Developed and maintained a bail bonds and records management system.",
    bullets: [
      "Led development of a system to manage bail bonds and records",
      "Moved the team from traditional encoding to searchable records",
      "Maintained the system after launch",
    ],
    stack: [],
  },
  {
    id: "innosoft", co: "Cebu Innosoft Solutions", chip: "CI", role: "Manual QA Tester Intern", when: "Sep – Oct 2024", where: "",
    summary: "Tested POS systems for sales, inventory and customers.",
    bullets: [
      "Found and reported bugs to the developers",
      "Maintained the implementation notes",
      "Kept the in-store training documents up to date",
    ],
    stack: ["POS systems", "Testing", "Documentation"],
  },
];

/* ---- How I work (home) ---- */
export const APPROACH = [
  ["Understand", "Analyze the business requirements and how the work is done today."],
  ["Design", "Plan an efficient software solution before writing it."],
  ["Develop", "Build reliable applications, layer by layer."],
  ["Automate", "Remove manual steps with workflows."],
  ["Improve", "Keep refining the system after launch."],
];

/* ---- Uses (icon, name, one-line opinion) ---- */
export const USES = [
  {
    group: "Daily tools", note: "What is open from time-in to time-out.",
    items: [
      ["code", "VS Code", "One editor for Angular, React and Node, with a short list of extensions."],
      ["git-branch", "Git and GitHub", "Every project, including this site, which deploys itself from GitHub Actions."],
      ["terminal", "Claude Code", "Speeds up development, debugging and documentation. I still read every diff."],
    ],
  },
  {
    group: "Default stack", note: "What I reach for on business systems.",
    items: [
      ["braces", "Angular and React", "Both, depending on the project. This site is React."],
      ["server", "Node.js and REST APIs", "One language from the form to the API."],
      ["database", "MySQL", "Employees, punches and records in tables with real foreign keys."],
      ["palette", "Tailwind CSS and Bootstrap", "Whichever the project already uses. Consistency beats preference."],
    ],
  },
  {
    group: "Automation", note: "Where the copy-paste goes to retire.",
    items: [
      ["zap", "n8n", "Event-driven workflows for notifications, data sync and document steps."],
      ["link", "API integration", "Connecting systems so data moves once instead of being typed twice."],
    ],
  },
];

/* ---- Career milestones (about page), newest first ---- */
export const MILESTONES = [
  { y: "Now", p: ["Junior AI Engineer at MSMA, Cebu City (since September 2026)", "Building an in-house product that has not launched yet"] },
  { y: "2025", p: ["BS Information Technology, University of Cebu", "Web developer intern at Alpha Insurance & Surety: led a bail bonds and records system"] },
  { y: "2024", p: ["Manual QA tester intern at Cebu Innosoft Solutions: POS testing and documentation", "Programmer on BinBetter, our capstone project"] },
  { y: "2023", p: ["Project manager and programmer on eSportsPP"] },
  { y: "2019", p: ["TVL Computer Programming, College of Technological Sciences Cebu"] },
];

export const SKILLS = [
  ["Frontend", "Angular, React, TypeScript, HTML5, CSS3, Bootstrap, Tailwind CSS"],
  ["Backend", "Node.js, Next.js, REST APIs"],
  ["Database", "MySQL, database design"],
  ["Automation and AI", "n8n, API integration, Claude Code"],
  ["Tools", "Git, GitHub, VS Code"],
];

export const findProject = (slug) => PROJECTS.find((p) => p.slug === slug);
