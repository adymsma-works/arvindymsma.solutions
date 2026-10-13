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
  role: "Full-stack developer",
  location: `${profile.city}, ${profile.country}`,
  timeZone: "Philippine time, UTC+8",
  openTo: "Freelance builds, automation, collaboration",
  replyTime: "Usually within a day",
  bestFit: "HR, attendance and workflow systems",
  tagline: "HR, attendance and workflow systems for real businesses.",
  summary:
    "Full-stack developer building a cloud HRIS with biometric and face-recognition attendance at MSMA Solutions Department, plus business systems and n8n workflow automation. Comfortable from database design to user training.",
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
    slug: "cloud-hris",
    name: "Cloud HRIS",
    kind: "inhouse",
    years: "in progress",
    mock: "hris",
    cover: "images/cover-cloud-hris.webp",
    summary: "One place for employee records and attendance, with every time-in checked by biometrics and face recognition.",
    intro:
      "At MSMA Solutions Department I am building a cloud HRIS that replaces paper time cards and spreadsheets with one system for employee records and attendance. Every time-in is checked twice: by the biometric device and by face recognition.",
    facts: [
      ["Role", "IT Associate Developer"],
      ["Timeline", "In progress"],
      ["Team", "MSMA Solutions Department"],
      ["Stack", "React, Angular, Node.js, MySQL, n8n"],
    ],
    card: ["6 modules", "2 checks per time-in"],
    outcomes: [
      { v: 6, label: "modules, from employee records to the HR dashboard" },
      { v: 2, label: "checks per time-in: biometric and face" },
      { v: 4, label: "layers, from HR staff down to MySQL" },
      { v: 3, label: "n8n workflows running beside the API" },
    ],
    problem: [
      "Attendance lived on paper time cards and in spreadsheets. HR re-typed the same punches into other sheets, and a time-in was only as reliable as whoever wrote it down.",
      "Employee records were scattered the same way, so a simple question like who is on leave today meant opening several files.",
    ],
    constraints: [
      ["Proof, not trust", "A time-in has to be backed by the biometric device and a face match, not a signature on a card."],
      ["HR first", "The people using it every day are HR staff, so screens follow their routine, not the database."],
      ["Cloud access", "Records and attendance must be reachable from the cloud, not from one office computer."],
    ],
    approach: [
      ["scan", "Two checks for every time-in", "The biometric device sends the punch and face recognition confirms it is the same person. Anything that does not match goes to a review list instead of quietly passing."],
      ["layers", "Four clear layers", "HR staff and employees use the web app, the web app talks to API services, and the API owns the MySQL database. Nothing skips a layer."],
      ["zap", "Automation beside the API", "n8n workflows react to events: a new employee record syncs the database, sends an email and starts the document workflow; a biometric event is validated, processed and reported."],
    ],
    figure: {
      type: "flow",
      steps: [
        ["Web app", "HR staff and employees: records, attendance, dashboards."],
        ["API services", "Validates every request and runs the attendance rules."],
        ["MySQL", "Employees, punches and HR data in one database."],
      ],
      caption: "The HRIS in three layers, under the people who use it. n8n workflows listen to the API for notifications and process automation.",
    },
    gallery: [
      { piece: "hrFace", pw: 22, k: 0.6, label: "Each time-in shows both checks: the device punch and the face match. Anything unclear is flagged for HR." },
      { piece: "hrFlow", pw: 22, k: 0.74, label: "A new employee record starts an n8n workflow: database sync, email notification and the document workflow." },
    ],
    results: [
      "The HRIS is still being built, so this is a progress report rather than a victory lap. Six modules are on the board: employee information, biometric integration, face-recognition verification, the attendance dashboard, HR data management and cloud access.",
      "The part I like most is the boring one: attendance that no longer depends on anybody's handwriting.",
    ],
    reflection:
      "Building for HR taught me to design around a morning routine instead of a data model. The next update to this page should have real numbers in it, once the system has a few months of attendance behind it.",
  },
  {
    slug: "bail-bonds-records",
    name: "Bail bonds and records system",
    kind: "internship",
    years: "2025",
    mock: "bail",
    cover: "images/cover-bail-bonds-records.webp",
    summary: "A records system that moved bail bond encoding from manual entry to one searchable database.",
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
    name: "POS system implementation",
    kind: "internship",
    years: "2024",
    mock: "pos",
    cover: "images/cover-pos-implementation.webp",
    summary: "POS systems for sales, inventory and customers: data reconciliation, user training, reports and support.",
    intro:
      "As a software implementor intern at Cebu Innosoft Solutions Services, I managed POS systems for sales, inventory and customers. The work was reconciling data, training users, creating reports and providing tech support.",
    facts: [
      ["Role", "Software implementor intern"],
      ["Timeline", "2024"],
      ["Company", "Cebu Innosoft Solutions Services Inc."],
      ["Scope", "Sales, inventory, customers"],
    ],
    card: ["Users trained", "Data reconciled"],
    outcomes: [],
    problem: [
      "A POS system only helps when the numbers inside it match the shelf and the people at the counter trust it.",
      "My job sat between the software and the business: getting the data right, teaching users and fixing what broke.",
    ],
    constraints: [
      ["Live businesses", "Work happened while the business kept selling."],
      ["Every comfort level", "Users ranged from confident to first-time, so training had to meet each one."],
      ["Useful reports", "Reports had to answer the owner's questions, not just export a table."],
    ],
    approach: [
      ["list", "Reconcile the data", "Sales, inventory and customer records were checked and reconciled so everyone worked from numbers they agreed with."],
      ["user", "Train the people", "I trained users on the tasks they actually do at the counter and in the back office."],
      ["file-text", "Reports and support", "I created reports and provided tech support, which is where the next round of fixes came from."],
    ],
    figure: {
      type: "flow",
      steps: [
        ["Reconcile", "Match sales, inventory and customer data."],
        ["Train", "Walk users through their daily tasks."],
        ["Support", "Reports, fixes and answers after go-live."],
      ],
      caption: "An implementation is mostly the work around the software.",
    },
    gallery: [
      { piece: "posReceipt", pw: 22, k: 0.6, label: "The counter view: what the cashier sees on every sale." },
      { piece: "posStock", pw: 22, k: 0.74, label: "Inventory that matches the shelf, so low stock is a fact, not a guess." },
    ],
    results: [
      "Users were trained, data was reconciled and reports went to the people who needed them. Tech support closed the loop when something did not match.",
    ],
    reflection:
      "Implementation taught me that the hardest week for any software is the first week someone else uses it. I still design screens with that week in mind.",
  },
];

/* ---- Everything else (work page archive) ---- */
export const ARCHIVE = [
  { y: "Now", n: "Cloud HRIS", d: "Employee records and attendance with biometric and face-recognition checks.", k: "inhouse", w: "React, Angular, Node.js, MySQL, n8n", slug: "cloud-hris" },
  { y: "2026", n: "This portfolio", d: "React and Vite on GitHub Pages, with a printable business card, QR code and contact file.", k: "personal", w: "React, Vite, GitHub Actions", ext: "https://github.com/adymsma-works/arvindymsma.solutions" },
  { y: "2026", n: "Bunny hero loop", d: "The 10-second animated loop on the home page, starring my avatar.", k: "personal", w: "Remotion, React, ffmpeg" },
  { y: "2025", n: "Bail bonds and records system", d: "Replaced manual encoding with searchable bond records.", k: "internship", w: "", slug: "bail-bonds-records" },
  { y: "2024", n: "POS system implementation", d: "Sales, inventory and customers: reconciliation, training, reports, support.", k: "internship", w: "", slug: "pos-implementation" },
  { y: "2024", n: "BinBetter", d: "Capstone project. I was one of the programmers.", k: "school", w: "" },
  { y: "2023", n: "eSportsPP", d: "Project manager and programmer: managed the project while building features.", k: "team", w: "" },
];

/* ---- Experience (home tabs, résumé) ---- */
export const XP = [
  {
    id: "msma", co: "MSMA Solutions", chip: "MS", role: "IT Associate | Developer", when: "Now", where: profile.city,
    summary: "Building and improving business software, including the cloud HRIS. Supporting testing, implementation and automation work.",
    bullets: [
      "Building a cloud HRIS with biometric and face-recognition attendance verification",
      "Automating HR steps with n8n: record sync, email notifications and document workflows",
      "Supporting testing and implementation of the department's business software",
    ],
    stack: ["React", "Angular", "Node.js", "MySQL", "n8n"],
  },
  {
    id: "alpha", co: "Alpha Insurance & Surety", chip: "AI", role: "Web Developer Intern", when: "2025", where: "",
    summary: "Developed and maintained a bail bonds and records management system.",
    bullets: [
      "Led development of a system to manage bail bonds and records",
      "Moved the team from traditional encoding to searchable records",
      "Maintained the system after launch",
    ],
    stack: [],
  },
  {
    id: "innosoft", co: "Cebu Innosoft Solutions", chip: "CI", role: "Software Implementor Intern", when: "2024", where: "",
    summary: "Managed POS systems for sales, inventory and customers.",
    bullets: [
      "Reconciled sales, inventory and customer data",
      "Trained users and created reports",
      "Provided tech support after go-live",
    ],
    stack: ["POS systems", "Reporting"],
  },
];

/* ---- n8n workflows (home) ---- */
export const WORKFLOWS = [
  { when: "A new employee record is created", then: "Sync the database, send an email notification, start the document workflow." },
  { when: "A biometric attendance event arrives", then: "Validate the attendance, process the data, generate reports." },
  { when: "A system event fires", then: "Call the other system's API, transfer the data, continue the workflow." },
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
  { y: "Now", p: ["IT Associate | Developer at MSMA Solutions Department", "Building a cloud HRIS with biometric and face-recognition attendance", "Automating HR workflows with n8n"] },
  { y: "2025", p: ["BS Information Technology, University of Cebu", "Web developer intern at Alpha Insurance & Surety: led a bail bonds and records system"] },
  { y: "2024", p: ["Software implementor intern at Cebu Innosoft Solutions: POS systems, data reconciliation and user training", "Programmer on BinBetter, our capstone project"] },
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
