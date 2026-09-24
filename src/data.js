// All portfolio text lives here. Edit this file to update the site.

export const links = {
  email: "ady.msma@gmail.com",
  github: "https://github.com/adymsma-works",
  linkedin: "https://www.linkedin.com/in/arvin-y-18a8312a5",
  company: "https://msma.ph",
  resume: `${import.meta.env.BASE_URL}Arvin_Yapliong_Developer_Resume.pdf`,
};

export const hris = {
  name: "Cloud HRIS platform",
  meta: "IT Associate Developer at MSMA Solutions Department",
  summary:
    "A cloud-based human resource information system built to modernize employee management and attendance monitoring, with biometric and face-recognition attendance verification.",
  features: [
    "Employee information management",
    "Biometric attendance integration",
    "Face-recognition attendance verification",
    "Attendance monitoring dashboard",
    "HR data management",
    "Cloud-based access",
  ],
  layers: ["HR staff and employees", "Web app", "API services", "MySQL database"],
  built: "React, Angular, Node.js, MySQL and n8n",
};

export const otherProjects = [
  { name: "Alpha Insurance System", role: "Lead Developer", text: "A web-based business solution supporting company workflow and daily operations." },
  { name: "Bail bonds records system", role: "Software Implementor Intern, 2024", text: "Developed and maintained a bail bonds and records management system." },
  { name: "BinBetter", role: "Programmer", text: "Contributed programming tasks and software development." },
  { name: "eSportsPP", role: "Project Manager and Programmer", text: "Managed project activities while building software features." },
];

export const timesheet = [
  {
    period: "2024",
    role: "Software Implementor Intern",
    org: "Cebu Innosoft Solutions Services Inc.",
    text: "Developed and maintained a bail bonds and records management system.",
    active: false,
  },
  {
    period: "2025",
    role: "Web Developer Intern",
    org: "Alpha Insurance & Surety Company Inc.",
    text: "Contributed to web application development and software improvements.",
    active: false,
  },
  {
    period: "Now",
    role: "IT Associate | Developer",
    org: "MSMA Solutions Department",
    text: "Building and improving business software, including the cloud HRIS. Supporting testing, implementation and automation work.",
    active: true,
  },
];

export const education = [
  { title: "BS Information Technology", where: "University of Cebu, 2025" },
  { title: "TVL Computer Programming", where: "College of Technological Sciences Cebu, 2019" },
  { title: "Google IT Support Certificate", where: "Certification" },
  { title: "Microsoft IT Support Specialist", where: "Certification" },
];

export const stack = [
  ["Frontend", "Angular, React, TypeScript, HTML5, CSS3, Bootstrap, Tailwind CSS"],
  ["Backend", "Node.js, Next.js, REST API development"],
  ["Database", "MySQL, database design"],
  ["Tools", "Git, GitHub, VS Code"],
  ["Automation and AI", "n8n workflow automation, API integration, Claude Code"],
];

export const workflows = [
  { when: "A new employee record is created", then: "Sync the database, send an email notification, start the document workflow." },
  { when: "A biometric attendance event arrives", then: "Validate the attendance, process the data, generate reports." },
  { when: "A system event fires", then: "Call the other system's API, transfer the data, continue the workflow." },
];

export const approach = [
  ["Understand", "Analyze the business requirements."],
  ["Design", "Plan an efficient software solution."],
  ["Develop", "Build reliable applications."],
  ["Automate", "Remove manual steps with workflows."],
  ["Improve", "Keep refining the system after launch."],
];
