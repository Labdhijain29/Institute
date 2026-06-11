import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  FileBadge,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  NotebookTabs,
  PhoneCall,
  ReceiptIndianRupee,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound
} from "lucide-react";

export const roleDashboards = {
  "Super Admin": ["Total branches", "Total revenue", "Total users", "Total students", "Total leads", "Branch-wise reports"],
  Admin: ["Total leads", "Total admissions", "Total staff", "Total students", "Fees collection", "Pending fees"],
  Manager: ["Telecaller performance", "Counsellor performance", "Admission targets", "Lead assignment control", "Team follow-up tracking"],
  Telecaller: ["Assigned leads", "Today follow-ups", "Call status", "Hot/Warm/Cold leads", "Forward to counsellor"],
  Counsellor: ["Forwarded leads", "Counselling status", "Demo scheduled", "Admission converted", "Student admission form"],
  Faculty: ["Assigned batches", "Student list", "Attendance marking", "Class schedule", "Syllabus progress", "Test marks"],
  HR: ["Staff list", "Staff attendance", "Salary records", "Leave requests", "Hiring pipeline", "Interview schedule"],
  Accountant: ["Fees collection", "Pending fees", "Installments", "Expenses", "Salary payments", "Profit/loss report"],
  Receptionist: ["Walk-in enquiries", "Visitor records", "Demo class booking", "Call transfer", "Appointment schedule"],
  Student: ["My course", "My batch", "Attendance", "Fees status", "Assignments", "Test results", "Certificates"],
  Parent: ["Student attendance", "Fees status", "Progress report", "Faculty remarks", "Notices"]
};

export const baseMenu = [
  { label: "Dashboard", path: "dashboard", icon: LayoutDashboard, roles: ["*"] },
  { label: "Leads", path: "leads", icon: PhoneCall, roles: ["Super Admin", "Admin", "Manager", "Telecaller", "Counsellor", "Receptionist"] },
  { label: "Admissions", path: "admissions", icon: GraduationCap, roles: ["Super Admin", "Admin", "Counsellor"] },
  { label: "Students", path: "students", icon: UsersRound, roles: ["Super Admin", "Admin", "Faculty", "Accountant"] },
  { label: "Courses", path: "courses", icon: BookOpen, roles: ["Super Admin", "Admin", "Faculty"] },
  { label: "Batches", path: "batches", icon: CalendarDays, roles: ["Super Admin", "Admin", "Faculty"] },
  { label: "Attendance", path: "attendance", icon: ClipboardCheck, roles: ["Super Admin", "Admin", "Faculty", "HR", "Student", "Parent"] },
  { label: "Fees", path: "fees", icon: ReceiptIndianRupee, roles: ["Super Admin", "Admin", "Accountant", "Student", "Parent"] },
  { label: "HR", path: "hr", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "HR"] },
  { label: "Tasks", path: "tasks", icon: ListChecks, roles: ["Super Admin", "Admin", "Manager", "HR", "Faculty"] },
  { label: "Materials", path: "materials", icon: NotebookTabs, roles: ["Super Admin", "Admin", "Faculty", "Student"] },
  { label: "Certificates", path: "certificates", icon: FileBadge, roles: ["Super Admin", "Admin", "Student"] },
  { label: "Reports", path: "reports", icon: BadgeIndianRupee, roles: ["Super Admin", "Admin", "Manager", "Accountant"] },
  { label: "Notifications", path: "notifications", icon: Bell, roles: ["*"] },
  { label: "Users", path: "users", icon: UserCog, roles: ["Super Admin", "Admin"] },
  { label: "Settings", path: "settings", icon: Settings, roles: ["Super Admin", "Admin"] },
  { label: "Permissions", path: "permissions", icon: ShieldCheck, roles: ["Super Admin"] }
];

export function menuForRole(role) {
  return baseMenu.filter((item) => item.roles.includes("*") || item.roles.includes(role));
}
