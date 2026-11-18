export type Project = {
  index: string;
  title: string;
  category: string;
  creator: string;
  url: string;
  preview: string | null;
  previewAlt: string;
  previewPosition?: "top" | "center";
};

export type TeamMember = {
  name: string;
  role: string;
  discipline: string;
  photo: string;
  serial: string;
  badge: "direction" | "development" | "design";
};

export const projects: Project[] = [
  {
    index: "01",
    title: "AFTER HOURS",
    category: "Hospitality / Website",
    creator: "EGOR",
    url: "https://ratman4ik.github.io/afterhours-cafe/",
    preview: "/projects/after-hours.webp",
    previewAlt: "AFTER HOURS café website homepage",
  },
  {
    index: "02",
    title: "NOIR AUTO",
    category: "Automotive / Website",
    creator: "EGOR",
    url: "https://premium-detailing-homepage.ratman4ik.chatgpt.site/",
    preview: "/projects/noir-auto.png",
    previewAlt: "NOIR AUTO automotive detailing website homepage",
    previewPosition: "center",
  },
  {
    index: "03",
    title: "GARAGE BARBERSHOP",
    category: "Barbershop / Website",
    creator: "LITVA",
    url: "https://kyniks23.github.io/garage-barbershop/",
    preview: "/projects/garage-barbershop.webp",
    previewAlt: "GARAGE BARBERSHOP website homepage",
  },
  {
    index: "04",
    title: "AURUM — DETAILING SHOWCASE",
    category: "Automotive / Showcase",
    creator: "MATVEY",
    url: "https://ifaet111.github.io/detailing-demo-showcase/",
    preview: "/projects/aurum-detailing.webp",
    previewAlt: "AURUM detailing showcase homepage",
  },
  {
    index: "05",
    title: "CAFÉ CONCEPTS",
    category: "Hospitality / Collection",
    creator: "MATVEY",
    url: "https://ifaet111.github.io/cafe-website-collection/index.html",
    preview: "/projects/cafe-concepts.webp",
    previewAlt: "Five café concepts collection homepage",
  },
];

export const team: TeamMember[] = [
  {
    name: "Egor",
    role: "Creative Director",
    discipline: "ART DIRECTION / SYSTEMS",
    photo: "/team/egor.png",
    serial: "OFS-CD-001",
    badge: "direction",
  },
  {
    name: "Matvey",
    role: "Lead Developer",
    discipline: "BUILD / INTERACTION",
    photo: "/team/matvey.png",
    serial: "OFS-LD-002",
    badge: "development",
  },
  {
    name: "Litva",
    role: "Digital Designer",
    discipline: "INTERFACE / FORM",
    photo: "/team/litva.png",
    serial: "OFS-DD-003",
    badge: "design",
  },
];

export const services = [
  "Web Design",
  "Web Development",
  "Motion & Interaction",
  "Digital Experiences",
] as const;
