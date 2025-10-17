import AI from "./assets/projects/AI.jpg";
import ChatVault from "./assets/projects/Chat.jpg";
import CryptoDashboard from "./assets/projects/Crpto.webp";
import ExpenseTracker from "./assets/projects/Expense.jpg";
import GamingHub from "./assets/projects/Gaming.webp";
import KGP_Eats from "./assets/projects/KGP.webp";
import Portfolio from "./assets/projects/portfolio.jpg";
import SmartInventory from "./assets/projects/Smart.jpg";
import TaskMate from "./assets/projects/Taskmate.webp";
import CampusConnect from "./assets/projects/Campus.webp";

const projectList = [
  { 
    id:1,
    title: "Expense Tracker Pro",
    description:
      "A modern web app to manage daily expenses with charts, categories, and local persistence.",
    tags: ["React", "Vite", "TypeScript", "Chart.js"],
    authors: ["Aarav Mehta"],
    links: [
      { text: "Live Demo", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: ExpenseTracker,
    media: [],
  },
  { id:2,
    title: "Portfolio Website",
    description:
      "A personal portfolio showcasing projects, blogs, and achievements with responsive design.",
    tags: ["Next.js", "TailwindCSS", "Framer Motion"],
    authors: ["Diya Sharma"],
    links: [
      { text: "Live", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: Portfolio,
    media: [],
  },
  { id:3,
    title: "ChatVault",
    description:
      "An encrypted real-time chat platform with secure message storage and custom encryption.",
    tags: ["Node.js", "Socket.io", "MongoDB", "Fernet"],
    authors: ["Rohan Gupta", "Ishika Verma"],
    links: [
      { text: "Demo", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: ChatVault,
    media: [],
  },
  { id:4,
    title: "AI Image Generator",
    description:
      "A stable diffusion–based AI image generator allowing users to create art from text prompts.",
    tags: ["Next.js", "OpenAI API", "Cloudinary"],
    authors: ["Kunal Singh"],
    links: [
      { text: "Try Now", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: AI,
    media: [],
  },
  { id:5,
    title: "Gaming Hub",
    description:
      "A central hub showcasing indie games developed using Unreal Engine 5.",
    tags: ["Unreal Engine 5", "Blueprint", "GameDev"],
    authors: ["Ritika Das", "Manav Kapoor"],
    links: [
      { text: "Website", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: GamingHub,
    media: [],
  },
  { id:6,
    title: "Smart Inventory",
    description:
      "A MERN stack app to manage warehouse inventory with live updates and analytics dashboard.",
    tags: ["MongoDB", "Express", "React", "Node.js"],
    authors: ["Nikhil Bhatia"],
    links: [
      { text: "Demo", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: SmartInventory,
    media: [],
  },
  { id:7,
    title: "TaskMate",
    description:
      "Collaborative task management tool with real-time syncing and progress visualization.",
    tags: ["React", "Firebase", "Redux"],
    authors: ["Simran Kaur", "Aayush Jain"],
    links: [
      { text: "Live", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: TaskMate,
    media: [],
  },
  { id:8,
    title: "KGP Eats",
    description:
      "Food delivery and discovery app focused on IIT Kharagpur campus restaurants and cuisine.",
    tags: ["React Native", "MongoDB", "Express"],
    authors: ["Aditya Roy", "Tanya Sen"],
    links: [
      { text: "App", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: KGP_Eats,
    media: [],
  },
  { id:9,
    title: "Crypto Dashboard",
    description:
      "Real-time crypto tracking dashboard with live API data, chart visualization, and alerts.",
    tags: ["React", "CoinGecko API", "Recharts"],
    authors: ["Riya Patel"],
    links: [
      { text: "Demo", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: CryptoDashboard,
    media: [],
  },
  { id:9,
    title: "Campus Connect",
    description:
      "A social platform for IIT KGP students to collaborate on projects, clubs, and events.",
    tags: ["Next.js", "Prisma", "PostgreSQL", "Clerk Auth"],
    authors: ["Soham Dey", "Meera Nair"],
    links: [
      { text: "Platform", url: "#" },
      { text: "GitHub", url: "#" },
    ],
    coverImgMediaKey: CampusConnect,
    media: [],
  },
];

export default projectList;
