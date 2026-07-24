import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Code2,
  GraduationCap,
  Handshake,
  Headphones,
  Layers3,
  Lightbulb,
  LineChart,
  MessagesSquare,
  Mic,
  Rocket,
  SearchCheck,
  Sparkles,
  Target,
  Trophy,
  UserCheck,
  UsersRound
} from "lucide-react";
import trainer1Image from "../assets/trainer1.jpeg";
import trainer2Image from "../assets/trainer2.jpeg";
import trainer3Image from "../assets/trainer3.jpeg";
import trainer4Image from "../assets/trainer4.jpeg";
import trainer5Image from "../assets/trainer5.jpeg";
import trainer6Image from "../assets/trainer6.jpeg";
import student1Image from "../assets/student1.jpeg";
import student2Image from "../assets/student2.jpeg";
import student3Image from "../assets/student3.jpeg";
import student4Image from "../assets/student4.jpeg";
import FullStackImage from "../assets/FullStackImage.jpeg";

export const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Courses", path: "/courses" },
  { label: "IT Services", path: "/it-services" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" }
];

export const courses = [
  {
    name: "Full Stack Development with Generative AI",
    level: "Advanced",
    duration: "9 Months",
    fees: "Rs. 58,000",
    image: FullStackImage,
    skills: ["Frontend", "Backend", "Databases", "Gen AI"],
    overview: "Build complete web applications while using Gen AI tools for coding, debugging, documentation, and deployment workflows.",
    syllabus: "HTML, CSS, JavaScript, React, backend APIs, SQL/NoSQL, auth, testing, deployment, Gen AI coding assistants.",
    careers: "Full Stack Developer, Product Engineer, Web App Developer"
  },
  {
    name: "Java Full Stack Development with Generative AI",
    level: "Advanced",
    duration: "9 Months",
    fees: "Rs. 56,000",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    skills: ["Core Java", "Spring Boot", "React", "Gen AI"],
    overview: "Master Java backend development, modern frontend integration, and Gen AI-assisted enterprise application building.",
    syllabus: "Core Java, OOP, DSA, JDBC, Spring Boot, REST APIs, React basics, databases, Gen AI productivity workflows.",
    careers: "Java Full Stack Developer, Backend Engineer, Software Trainee"
  },
  {
    name: "Python Full Stack Development with Generative AI",
    level: "Advanced",
    duration: "8 Months",
    fees: "Rs. 54,000",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
    skills: ["Python", "Django", "React", "Gen AI"],
    overview: "Create full stack applications using Python frameworks and Gen AI tools for faster development and automation.",
    syllabus: "Python, OOP, Django/FastAPI, REST APIs, React basics, databases, deployment, prompt-based coding support.",
    careers: "Python Full Stack Developer, Backend Developer, Automation Engineer"
  },
  {
    name: "MERN Stack Development with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 42,000",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    skills: ["MongoDB", "Express", "React", "Gen AI"],
    overview: "Build production-grade MERN applications with Gen AI support for components, APIs, tests, and deployment tasks.",
    syllabus: "HTML, CSS, JavaScript, React, Express, MongoDB, authentication, deployment, Gen AI code generation.",
    careers: "Frontend Developer, MERN Developer, Junior Full Stack Engineer"
  },
  {
    name: "MEAN Stack Development with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 42,000",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    skills: ["MongoDB", "Express", "Angular", "Gen AI"],
    overview: "Develop MEAN stack applications and use Gen AI to accelerate frontend, backend, and API development.",
    syllabus: "JavaScript, Angular, Node.js, Express, MongoDB, REST APIs, auth, deployment, Gen AI-assisted workflows.",
    careers: "MEAN Stack Developer, Angular Developer, Junior Full Stack Engineer"
  },
  {
    name: "Data Analytics with Generative AI",
    level: "Intermediate",
    duration: "5 Months",
    fees: "Rs. 38,000",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    skills: ["Excel", "SQL", "Power BI", "Gen AI"],
    overview: "Analyze business data, create dashboards, and use Gen AI for faster insights, summaries, and reporting.",
    syllabus: "Excel, SQL, statistics basics, Power BI, dashboard design, data storytelling, Gen AI for analytics.",
    careers: "Data Analyst, BI Analyst, Reporting Analyst"
  },
  {
    name: "Data Engineering with Generative AI",
    level: "Advanced",
    duration: "7 Months",
    fees: "Rs. 55,000",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=900&q=80",
    skills: ["Python", "SQL", "ETL", "Gen AI"],
    overview: "Build data pipelines, warehouses, and automation workflows with Gen AI-supported development and documentation.",
    syllabus: "Python, SQL, ETL pipelines, data modeling, warehousing, cloud basics, orchestration, Gen AI for data workflows.",
    careers: "Data Engineer Trainee, ETL Developer, Data Operations Associate"
  },
  {
    name: "Artificial Intelligence & Machine Learning with Generative AI",
    level: "Advanced",
    duration: "8 Months",
    fees: "Rs. 64,000",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
    skills: ["ML", "Deep Learning", "NLP", "Gen AI"],
    overview: "Learn machine learning foundations, applied AI systems, and Gen AI concepts through guided projects.",
    syllabus: "Python, statistics, ML algorithms, neural networks, NLP, LLM basics, prompt engineering, model deployment.",
    careers: "ML Engineer Trainee, AI Developer, Applied Data Science Intern"
  },
  {
    name: "Cloud Computing with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 48,000",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    skills: ["Cloud", "Linux", "Networking", "Gen AI"],
    overview: "Understand cloud infrastructure, services, monitoring, and Gen AI-supported cloud operations.",
    syllabus: "Cloud fundamentals, Linux, networking, compute, storage, security basics, monitoring, Gen AI for cloud tasks.",
    careers: "Cloud Support Associate, Cloud Engineer Trainee, Infrastructure Support Executive"
  },
  {
    name: "AWS Cloud Practitioner & Solutions Architect with Generative AI",
    level: "Intermediate",
    duration: "5 Months",
    fees: "Rs. 45,000",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    skills: ["AWS", "EC2", "S3", "Gen AI"],
    overview: "Learn AWS services, deployment basics, and Gen AI tools that support cloud planning and operations.",
    syllabus: "IAM, EC2, S3, VPC basics, RDS, Lambda basics, CloudWatch, deployment, Gen AI for AWS documentation.",
    careers: "AWS Cloud Trainee, Cloud Support Engineer, Junior Cloud Administrator"
  },
  {
    name: "DevOps Engineering with Generative AI",
    level: "Advanced",
    duration: "6 Months",
    fees: "Rs. 52,000",
    image: "https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&w=900&q=80",
    skills: ["Docker", "Kubernetes", "CI/CD", "Gen AI"],
    overview: "Build DevOps pipelines, container workflows, and automation processes with Gen AI-assisted troubleshooting.",
    syllabus: "Linux, Git, Docker, Kubernetes basics, CI/CD, monitoring, cloud deployment, Gen AI for automation.",
    careers: "DevOps Engineer Trainee, Release Engineer, Cloud DevOps Associate"
  },
  {
    name: "Cyber Security & Ethical Hacking with Generative AI",
    level: "Intermediate",
    duration: "4 Months",
    fees: "Rs. 36,000",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    skills: ["Networking", "OWASP", "Security Tools", "Gen AI"],
    overview: "Build security fundamentals and use Gen AI responsibly for analysis, reporting, and security learning.",
    syllabus: "Networking, Linux security, OWASP Top 10, vulnerability scanning, incident basics, Gen AI for reports.",
    careers: "SOC Analyst Trainee, Cyber Security Intern, Security Support Executive"
  },
  {
    name: "iOS App Development with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 50,000",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80",
    skills: ["Swift", "SwiftUI", "APIs", "Gen AI"],
    overview: "Create iOS apps using Swift and SwiftUI with Gen AI-assisted coding, UI ideas, and debugging.",
    syllabus: "Swift basics, SwiftUI, navigation, API integration, local storage, app architecture, Gen AI coding support.",
    careers: "iOS Developer Trainee, Mobile App Developer, Swift Developer"
  },
  {
    name: "Android App Development with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 48,000",
    image: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=900&q=80",
    skills: ["Kotlin", "Android Studio", "Firebase", "Gen AI"],
    overview: "Build Android applications using Kotlin, Firebase, APIs, and Gen AI-assisted development practices.",
    syllabus: "Kotlin, Android Studio, layouts, activities, navigation, Firebase, API integration, Gen AI for debugging.",
    careers: "Android Developer Trainee, Mobile App Developer, Kotlin Developer"
  },
  {
    name: "Flutter Cross Platform Development with Generative AI",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 50,000",
    image: "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=900&q=80",
    skills: ["Flutter", "Dart", "Firebase", "Gen AI"],
    overview: "Create cross-platform mobile apps with Flutter and use Gen AI for UI generation, debugging, and code help.",
    syllabus: "Dart basics, Flutter widgets, navigation, state management, Firebase, API integration, Gen AI workflows.",
    careers: "Flutter Developer, Mobile App Developer, App Development Intern"
  },
  {
    name: "Networking with Gen AI",
    level: "Beginner",
    duration: "4 Months",
    fees: "Rs. 32,000",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80",
    skills: ["TCP/IP", "Routing", "Switching", "Gen AI"],
    overview: "Build strong computer networking fundamentals and use Gen AI for guided troubleshooting, documentation, and scenario practice.",
    syllabus: "Network fundamentals, OSI/TCP-IP models, IP addressing, subnetting, routing, switching, DNS, DHCP, firewalls, basic network security, Gen AI for troubleshooting.",
    careers: "Network Support Engineer, IT Support Executive, NOC Trainee"
  }
];

export const stats = [
  ["Students Trained", "2500+"],
  ["Placements", "1,850+"],
  ["Courses Offered", "25+"],
  ["Success Rate", "75%"]
];

export const whyChoose = [
  ["Live Classes", "Interactive instructor-led sessions with recordings and revision support.", Mic],
  ["Real Projects", "Portfolio projects based on institute CRM, ecommerce, analytics, and SaaS flows.", Code2],
  ["Placement Support", "Interview drives, profile review, and hiring partner coordination.", BriefcaseBusiness],
  ["Industry Mentors", "Guidance from trainers who have shipped software in real teams.", UserCheck],
  ["Certificates", "Course completion credentials tied to attendance, tests, and projects.", Award],
  ["Doubt Sessions", "Weekly doubt labs so students do not stay stuck between classes.", MessagesSquare]
];

export const services = [
  ["Training Programs", "Structured classroom and online programs for students and working professionals.", GraduationCap],
  ["Corporate Training", "Custom upskilling tracks for engineering, support, and operations teams.", Building2],
  ["Internship Programs", "Guided internships with live assignments, reviews, and completion reports.", Layers3],
  ["Placement Assistance", "Resume shortlisting, mock drives, and employer follow-ups.", Handshake],
  ["Resume Building", "Role-specific resume, GitHub, and LinkedIn profile refinement.", SearchCheck],
  ["Mock Interviews", "Technical and HR interview practice with actionable feedback.", Headphones],
  ["Career Guidance", "Course selection, roadmap planning, and milestone tracking.", LineChart]
];

export const values = [
  ["Practical First", "Every concept ends in a build, debug, or deploy session.", Rocket],
  ["Clear Mentorship", "Students get direct guidance, honest feedback, and visible progress.", Lightbulb],
  ["Career Outcomes", "Training is mapped to skills employers actually screen for.", Target],
  ["Trust & Discipline", "Attendance, fees, leads, and learning records stay transparent.", BadgeCheck]
];

export const testimonials = [
  {
    name: "Ankit Sharma",
    course: "Data Analytics",
    image: student1Image,
    // feedback: "The project reviews made interviews much easier. I could explain every line I had written."
  },
  {
    name: "Deepak Chouhan",
    course: "Data Analytics",
    image: student2Image,
    // feedback: "I joined as a beginner and left with dashboards, notebooks, and confidence to apply."
  },
  {
    name: "Nitesh Jat",
    course: "Java FullStack Development",
    image: student3Image,
    // feedback: "The placement team helped me fix my resume and prepare for real technical rounds."
  },
   {
    name: "Kapil Jat",
    course: "Java FullStack Development",
    image: student4Image,
    // feedback: "The placement team helped me fix my resume and prepare for real technical rounds."
  }
];

const partnerWordmark = (text, color = "#111315") => (
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" role="img" aria-label="${text} logo"><rect width="240" height="72" fill="white"/><text x="120" y="44" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${text.length > 10 ? 25 : 34}" font-weight="800" fill="${color}">${text}</text></svg>`)}`
);

export const partners = [
  { name: "Accenture", logo: "https://logo.clearbit.com/accenture.com", fallbackLogo: "https://cdn.simpleicons.org/accenture/A100FF" },
  { name: "Wipro", logo: "https://logo.clearbit.com/wipro.com", fallbackLogo: "https://cdn.simpleicons.org/wipro/341C53" },
  { name: "Deloitte", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20of%20Deloitte.svg", fallbackLogo: "https://logo.clearbit.com/deloitte.com" },
  { name: "Infosys", logo: "https://logo.clearbit.com/infosys.com", fallbackLogo: "https://cdn.simpleicons.org/infosys/007CC3" },
  { name: "TCS", logo: partnerWordmark("TCS", "#5b5fc7"), fallbackLogo: "https://commons.wikimedia.org/wiki/Special:FilePath/Tata%20Consultancy%20Services%20Logo.svg" },
  { name: "HCLTech", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/HCLTech-new-logo.svg", fallbackLogo: "https://logo.clearbit.com/hcltech.com" },
  { name: "Capgemini", logo: partnerWordmark("Capgemini", "#0070ad"), fallbackLogo: "https://commons.wikimedia.org/wiki/Special:FilePath/Capgemini%20New%20logo.svg" },
  { name: "Cognizant", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Cognizant_logo_2022.svg", fallbackLogo: "https://logo.clearbit.com/cognizant.com" },
  { name: "Tech Mahindra", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/TM%20Logo%20Color%20Pos%20RGB.svg", fallbackLogo: "https://logo.clearbit.com/techmahindra.com" },
  { name: "IBM", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/IBM%20logo.svg", fallbackLogo: "https://cdn.simpleicons.org/ibm/052FAD" },
  { name: "Microsoft", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Microsoft_logo_(2012).svg", fallbackLogo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Amazon", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Amazon_logo.svg", fallbackLogo: "https://logo.clearbit.com/amazon.com" },
  { name: "Google", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Google_2015_logo.svg", fallbackLogo: "https://logo.clearbit.com/google.com" },
  { name: "Oracle", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Oracle_logo.svg", fallbackLogo: "https://logo.clearbit.com/oracle.com" },
  { name: "LTIMindtree", logo: partnerWordmark("LTIMindtree", "#ef4f3f"), fallbackLogo: "https://logo.clearbit.com/ltimindtree.com" },
  { name: "Mphasis", logo: partnerWordmark("Mphasis", "#151515"), fallbackLogo: "https://commons.wikimedia.org/wiki/Special:FilePath/Mphasis%20logo.svg" },
  { name: "Persistent", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Persistent_Systems_Logo.svg", fallbackLogo: "https://logo.clearbit.com/persistent.com" },
  { name: "Hexaware", logo: partnerWordmark("Hexaware", "#224f9c"), fallbackLogo: "https://logo.clearbit.com/hexaware.com" },
  { name: "Mindtree", logo: partnerWordmark("Mindtree", "#7a2cbf"), fallbackLogo: "https://commons.wikimedia.org/wiki/Special:FilePath/Mindtree%20logo.svg" },
  { name: "Zoho", logo: "https://logo.clearbit.com/zoho.com", fallbackLogo: "https://cdn.simpleicons.org/zoho/E42527" },
  { name: "Salesforce", logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Salesforce.com%20logo.svg", fallbackLogo: "https://logo.clearbit.com/salesforce.com" }
];

export const trainers = [
  {
    name: "Lakhan Rathod",
    expertise: "Senior Java Developer",
    experience: "7+ years",
    image: trainer1Image,
    description: "Guides students in Java, backend logic, and real-world application development with practical project mentoring."
  },
  {
    name: "Shazia Khan",
    expertise: "Senior Data Scientist",
    experience: "9+ years",
    image: trainer2Image,
    description: "Mentors learners in data analysis, machine learning workflows, and industry-ready data science projects."
  },
  {
    name: "Shivprasad Suryawanshi",
    expertise: "Data Scientist",
    experience: "9 years",
    image: trainer3Image,
    description: "Helps students understand analytics, Python, visualization, and applied data science through hands-on practice."
  },
  {
    name: "Labdhi Jain",
    expertise: "MERN Stack Developer",
    experience: "3+ years",
    image: trainer4Image,
    description: "Helps students build responsive, scalable web applications using MongoDB, Express.js, React.js, and Node.js through hands-on, real-world projects."
  },
  {
    name: "Shivani Madhukar",
    expertise: "Senior Counsellor",
    experience: "5+ years",
    image: trainer5Image,
    description: "Guides students in choosing the right career path, courses, and training programs through personalized counseling and expert advice."
  },
  {
    name: "Ritika Singh",
    expertise: "Senior Counsellor",
    experience: "5+ years",
    image: trainer6Image,
    description: "Helps students make informed career decisions by providing expert guidance on courses, admissions, and future opportunities."
  },
];

export const trustMilestones = [
  ["12+", "Years of training excellence", Trophy],
  ["135+", "Hiring and internship partners", Handshake],
  ["18k+", "Hours of live mentoring", UsersRound],
  ["4.8/5", "Average student rating", Sparkles]
];