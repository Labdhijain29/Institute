import "dotenv/config";
import mongoose from "mongoose";
import { Course } from "../models/Course.js";

const courses = [
  {
    name: "Full Stack Development with Gen AI",
    duration: "9 Months",
    fees: 58000,
    description: "Build complete web applications while using Gen AI tools for coding, debugging, documentation, and deployment workflows.",
    modules: ["Frontend", "Backend", "Databases", "Gen AI"],
    syllabus: "HTML, CSS, JavaScript, React, backend APIs, SQL/NoSQL, auth, testing, deployment, Gen AI coding assistants."
  },
  {
    name: "Java Full Stack with Gen AI",
    duration: "9 Months",
    fees: 56000,
    description: "Master Java backend development, modern frontend integration, and Gen AI-assisted enterprise application building.",
    modules: ["Core Java", "Spring Boot", "React", "Gen AI"],
    syllabus: "Core Java, OOP, DSA, JDBC, Spring Boot, REST APIs, React basics, databases, Gen AI productivity workflows."
  },
  {
    name: "Python Full Stack with Gen AI",
    duration: "8 Months",
    fees: 54000,
    description: "Create full stack applications using Python frameworks and Gen AI tools for faster development and automation.",
    modules: ["Python", "Django", "React", "Gen AI"],
    syllabus: "Python, OOP, Django/FastAPI, REST APIs, React basics, databases, deployment, prompt-based coding support."
  },
  {
    name: "MERN Full Stack with Gen AI",
    duration: "6 Months",
    fees: 42000,
    description: "Build production-grade MERN applications with Gen AI support for components, APIs, tests, and deployment tasks.",
    modules: ["MongoDB", "Express", "React", "Gen AI"],
    syllabus: "HTML, CSS, JavaScript, React, Express, MongoDB, authentication, deployment, Gen AI code generation."
  },
  {
    name: "MEAN Full Stack with Gen AI",
    duration: "6 Months",
    fees: 42000,
    description: "Develop MEAN stack applications and use Gen AI to accelerate frontend, backend, and API development.",
    modules: ["MongoDB", "Express", "Angular", "Gen AI"],
    syllabus: "JavaScript, Angular, Node.js, Express, MongoDB, REST APIs, auth, deployment, Gen AI-assisted workflows."
  },
  {
    name: "Data Analytics with Gen AI",
    duration: "5 Months",
    fees: 38000,
    description: "Analyze business data, create dashboards, and use Gen AI for faster insights, summaries, and reporting.",
    modules: ["Excel", "SQL", "Power BI", "Gen AI"],
    syllabus: "Excel, SQL, statistics basics, Power BI, dashboard design, data storytelling, Gen AI for analytics."
  },
  {
    name: "Data Engineering with Gen AI",
    duration: "7 Months",
    fees: 55000,
    description: "Build data pipelines, warehouses, and automation workflows with Gen AI-supported development and documentation.",
    modules: ["Python", "SQL", "ETL", "Gen AI"],
    syllabus: "Python, SQL, ETL pipelines, data modeling, warehousing, cloud basics, orchestration, Gen AI for data workflows."
  },
  {
    name: "AI/ML with Gen AI",
    duration: "8 Months",
    fees: 64000,
    description: "Learn machine learning foundations, applied AI systems, and Gen AI concepts through guided projects.",
    modules: ["ML", "Deep Learning", "NLP", "Gen AI"],
    syllabus: "Python, statistics, ML algorithms, neural networks, NLP, LLM basics, prompt engineering, model deployment."
  },
  {
    name: "Cloud Computing with Gen AI",
    duration: "6 Months",
    fees: 48000,
    description: "Understand cloud infrastructure, services, monitoring, and Gen AI-supported cloud operations.",
    modules: ["Cloud", "Linux", "Networking", "Gen AI"],
    syllabus: "Cloud fundamentals, Linux, networking, compute, storage, security basics, monitoring, Gen AI for cloud tasks."
  },
  {
    name: "AWS with Gen AI",
    duration: "5 Months",
    fees: 45000,
    description: "Learn AWS services, deployment basics, and Gen AI tools that support cloud planning and operations.",
    modules: ["AWS", "EC2", "S3", "Gen AI"],
    syllabus: "IAM, EC2, S3, VPC basics, RDS, Lambda basics, CloudWatch, deployment, Gen AI for AWS documentation."
  },
  {
    name: "DevOps with Gen AI",
    duration: "6 Months",
    fees: 52000,
    description: "Build DevOps pipelines, container workflows, and automation processes with Gen AI-assisted troubleshooting.",
    modules: ["Docker", "Kubernetes", "CI/CD", "Gen AI"],
    syllabus: "Linux, Git, Docker, Kubernetes basics, CI/CD, monitoring, cloud deployment, Gen AI for automation."
  },
  {
    name: "Cyber Security with Gen AI",
    duration: "4 Months",
    fees: 36000,
    description: "Build security fundamentals and use Gen AI responsibly for analysis, reporting, and security learning.",
    modules: ["Networking", "OWASP", "Security Tools", "Gen AI"],
    syllabus: "Networking, Linux security, OWASP Top 10, vulnerability scanning, incident basics, Gen AI for reports."
  },
  {
    name: "iOS Development with Gen AI",
    duration: "6 Months",
    fees: 50000,
    description: "Create iOS apps using Swift and SwiftUI with Gen AI-assisted coding, UI ideas, and debugging.",
    modules: ["Swift", "SwiftUI", "APIs", "Gen AI"],
    syllabus: "Swift basics, SwiftUI, navigation, API integration, local storage, app architecture, Gen AI coding support."
  },
  {
    name: "Android Development with Gen AI",
    duration: "6 Months",
    fees: 48000,
    description: "Build Android applications using Kotlin, Firebase, APIs, and Gen AI-assisted development practices.",
    modules: ["Kotlin", "Android Studio", "Firebase", "Gen AI"],
    syllabus: "Kotlin, Android Studio, layouts, activities, navigation, Firebase, API integration, Gen AI for debugging."
  },
  {
    name: "Flutter Development with Gen AI",
    duration: "6 Months",
    fees: 50000,
    description: "Create cross-platform mobile apps with Flutter and use Gen AI for UI generation, debugging, and code help.",
    modules: ["Flutter", "Dart", "Firebase", "Gen AI"],
    syllabus: "Dart basics, Flutter widgets, navigation, state management, Firebase, API integration, Gen AI workflows."
  },
  {
    name: "Networking with Gen AI",
    duration: "4 Months",
    fees: 32000,
    description: "Build strong computer networking fundamentals and use Gen AI for guided troubleshooting, documentation, and scenario practice.",
    modules: ["TCP/IP", "Routing", "Switching", "Gen AI"],
    syllabus: "Network fundamentals, OSI/TCP-IP models, IP addressing, subnetting, routing, switching, DNS, DHCP, firewalls, basic network security, Gen AI for troubleshooting."
  }
];

async function seedCourses() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  await mongoose.connect(process.env.MONGO_URI);

  for (const course of courses) {
    await Course.findOneAndUpdate(
      { name: course.name },
      { ...course, technologies: course.modules, isActive: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const allowedNames = courses.map((course) => course.name);
  await Course.updateMany({ name: { $nin: allowedNames } }, { isActive: false });

  console.log(`Seeded ${courses.length} Gen AI courses.`);
  await mongoose.disconnect();
}

seedCourses().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
