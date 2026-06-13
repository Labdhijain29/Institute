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

export const navItems = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Courses", path: "/courses" },
  { label: "Services", path: "/services" },
  { label: "Contact", path: "/contact" }
];

export const courses = [
  {
    name: "MERN Stack",
    level: "Intermediate",
    duration: "6 Months",
    fees: "Rs. 42,000",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    skills: ["React", "Node.js", "MongoDB", "REST APIs"],
    overview: "Build production-grade web apps with modern JavaScript across frontend and backend.",
    syllabus: "HTML, CSS, JavaScript, React, Express, MongoDB, authentication, deployment.",
    careers: "Frontend Developer, MERN Developer, Junior Full Stack Engineer"
  },
  {
    name: "Python",
    level: "Beginner",
    duration: "4 Months",
    fees: "Rs. 28,000",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80",
    skills: ["Python", "OOP", "Automation", "APIs"],
    overview: "Start programming with Python through practical scripts, apps, and automation tasks.",
    syllabus: "Syntax, functions, OOP, files, APIs, web basics, mini projects.",
    careers: "Python Developer, Automation Intern, Backend Trainee"
  },
  {
    name: "Java",
    level: "Beginner",
    duration: "5 Months",
    fees: "Rs. 32,000",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    skills: ["Core Java", "OOP", "DSA", "Spring Basics"],
    overview: "Learn strong programming fundamentals and enterprise-ready Java development.",
    syllabus: "Core Java, OOP, collections, exceptions, JDBC, DSA foundations.",
    careers: "Java Developer, Software Trainee, Backend Intern"
  },
  {
    name: "Full Stack Development",
    level: "Advanced",
    duration: "9 Months",
    fees: "Rs. 58,000",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    skills: ["Frontend", "Backend", "Databases", "Cloud"],
    overview: "A complete job-focused path covering UI, APIs, databases, testing, and deployment.",
    syllabus: "Frontend engineering, backend APIs, SQL/NoSQL, auth, testing, cloud deployment.",
    careers: "Full Stack Developer, Product Engineer, Web App Developer"
  },
  {
    name: "Data Science",
    level: "Intermediate",
    duration: "7 Months",
    fees: "Rs. 52,000",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    skills: ["Python", "Pandas", "Visualization", "ML Basics"],
    overview: "Analyze data, build models, and present insights with portfolio-ready projects.",
    syllabus: "Statistics, Python, Pandas, NumPy, visualization, machine learning fundamentals.",
    careers: "Data Analyst, BI Analyst, Junior Data Scientist"
  },
  {
    name: "AI/ML",
    level: "Advanced",
    duration: "8 Months",
    fees: "Rs. 64,000",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80",
    skills: ["ML", "Deep Learning", "NLP", "Model Deployment"],
    overview: "Move from ML foundations to applied AI systems with guided capstone work.",
    syllabus: "ML algorithms, neural networks, NLP, model evaluation, deployment workflows.",
    careers: "ML Engineer Trainee, AI Developer, Applied Data Science Intern"
  }
];

export const stats = [
  ["Students Trained", "4,800+"],
  ["Placements", "1,250+"],
  ["Courses Offered", "24+"],
  ["Success Rate", "92%"]
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
    name: "Aarav Mehta",
    course: "MERN Stack",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    feedback: "The project reviews made interviews much easier. I could explain every line I had written."
  },
  {
    name: "Priya Nair",
    course: "Data Science",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    feedback: "I joined as a beginner and left with dashboards, notebooks, and confidence to apply."
  },
  {
    name: "Rohan Singh",
    course: "Full Stack Development",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    feedback: "The placement team helped me fix my resume and prepare for real technical rounds."
  }
];

export const partners = ["TCS", "Infosys", "Wipro", "HCLTech", "Accenture", "Zoho"];

export const trainers = [
  {
    name: "Neha Sharma",
    expertise: "Full Stack Engineering",
    experience: "9 years",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Vikram Rao",
    expertise: "Python, Data Science",
    experience: "11 years",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80"
  },
  {
    name: "Ananya Kapoor",
    expertise: "Java, DSA, Interviews",
    experience: "8 years",
    image: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=500&q=80"
  }
];

export const trustMilestones = [
  ["12+", "Years of training excellence", Trophy],
  ["35+", "Hiring and internship partners", Handshake],
  ["18k+", "Hours of live mentoring", UsersRound],
  ["4.8/5", "Average student rating", Sparkles]
];
