import {
  BadgeIndianRupee,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileBadge,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  NotebookTabs,
  PhoneCall,
  ReceiptIndianRupee,
  ServerCog,
  Settings,
  ShieldCheck,
  UserCog,
  UsersRound
} from "lucide-react";

export const roleDashboards = {
  "Super Admin": ["Total branches", "Total revenue", "Total users", "Total students", "Total leads", "Branch-wise reports"],
  Admin: ["Total employees", "Present today", "Absent today", "Late today", "Pending leaves", "Salary payable"],
  Manager: ["Telecaller performance", "Counsellor performance", "Admission targets", "Lead assignment control", "Team follow-up tracking"],
  Telecaller: ["Generate leads", "My open leads", "Today follow-ups", "Call status", "Forward to counsellor"],
  Counsellor: ["Leads from telecaller", "Counselling status", "Demo scheduled", "Forward to faculty", "Pending faculty approval"],
  Faculty: ["Lecture reports today", "Assigned batches", "Student list", "Attendance marking", "Leave status", "Monthly attendance"],
  HR: ["Total employees", "Present today", "Late today", "Pending leaves", "Pending salary approvals", "Lecture reports today"],
  Accountant: ["Fees collection", "Pending fees", "Salary payable", "Pending salary approvals", "Expenses", "Profit/loss report"],
  Receptionist: ["Walk-in enquiries", "Visitor records", "Demo class booking", "Call transfer", "Appointment schedule"],
  "Developer/IT Staff": ["My attendance", "Leave status", "Assigned technical tasks", "Support queue"],
  "Digital Marketing Executive": ["My attendance", "Campaign tasks", "Lead activity", "Leave status"],
  Student: ["My course", "My batch", "Attendance", "Fees status", "Assignments", "Test results", "Certificates"],
  Parent: ["Student attendance", "Fees status", "Progress report", "Faculty remarks", "Notices"]
};

export const baseMenu = [
  { label: "Dashboard", path: "dashboard", icon: LayoutDashboard, roles: ["*"] },
  { label: "Manager Dashboard", path: "manager-dashboard", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Manager"], dashboardRole: "Manager" },
  { label: "Telecaller Dashboard", path: "telecaller-dashboard", icon: PhoneCall, roles: ["Super Admin", "Admin", "Manager", "Telecaller", "Receptionist"], workflowRole: "Telecaller" },
  { label: "Counsellor Dashboard", path: "counsellor-dashboard", icon: PhoneCall, roles: ["Super Admin", "Admin", "Manager", "Counsellor"], workflowRole: "Counsellor" },
  { label: "Faculty Dashboard", path: "faculty-dashboard", icon: GraduationCap, roles: ["Super Admin", "Admin", "Manager", "Faculty"], workflowRole: "Faculty" },
  { label: "Admissions", path: "admissions", icon: GraduationCap, roles: ["Super Admin", "Admin", "Faculty"], workflowRole: "Admissions" },
  { label: "Students", path: "students", icon: UsersRound, roles: ["Super Admin", "Admin", "Faculty", "Accountant"] },
  { label: "Courses", path: "courses", icon: BookOpen, roles: ["Super Admin", "Admin", "Faculty"] },
  { label: "Batches", path: "batches", icon: CalendarDays, roles: ["Super Admin", "Admin", "Faculty"] },
  { label: "Attendance", path: "attendance", icon: ClipboardCheck, roles: ["Super Admin", "Admin", "Faculty", "HR", "Student", "Parent"] },
  { label: "My Employee Desk", path: "employee-desk", icon: Clock, roles: ["Manager", "HR", "Telecaller", "Counsellor", "Faculty", "Accountant", "Receptionist", "Developer/IT Staff", "Digital Marketing Executive"] },
  { label: "Employee Reports", path: "employee-reports", icon: ClipboardCheck, roles: ["Super Admin", "Admin", "HR"] },
  { label: "Payroll", path: "payroll", icon: ReceiptIndianRupee, roles: ["Super Admin", "Admin", "HR", "Accountant"] },
  { label: "Leave Requests", path: "leave-requests", icon: CalendarDays, roles: ["Super Admin", "Admin", "HR", "Faculty", "Telecaller", "Counsellor", "Receptionist", "Developer/IT Staff", "Digital Marketing Executive"] },
  { label: "Lecture Reports", path: "lecture-reports", icon: GraduationCap, roles: ["Super Admin", "Admin", "HR", "Faculty"] },
  { label: "Office IPs", path: "office-ips", icon: ServerCog, roles: ["Super Admin", "Admin"] },
  { label: "Fees", path: "fees", icon: ReceiptIndianRupee, roles: ["Super Admin", "Admin", "Accountant", "Student", "Parent"] },
  { label: "Receipts", path: "receipts", icon: ReceiptIndianRupee, roles: ["Super Admin", "Admin", "Manager", "Accountant"] },
  { label: "HR", path: "hr", icon: BriefcaseBusiness, roles: ["Super Admin", "Admin", "HR"] },
  { label: "Tasks", path: "tasks", icon: ListChecks, roles: ["Super Admin", "Admin", "Manager", "HR", "Faculty"] },
  { label: "Digital Marketing Management", path: "digital-marketing-management", icon: Megaphone, roles: ["Super Admin", "Admin"] },
  { label: "Materials", path: "materials", icon: NotebookTabs, roles: ["Super Admin", "Admin", "Faculty", "Student"] },
  { label: "Documents", section: true, icon: FolderOpen, roles: ["Super Admin", "Admin", "Manager", "Student"] },
  { label: "Certificates", path: "certificates", icon: FileBadge, roles: ["Super Admin", "Admin", "Manager", "Student"] },
  { label: "Offer Letters", path: "offers", icon: FileBadge, roles: ["Super Admin", "Admin", "Manager"] },
  { label: "Reports", path: "reports", icon: BadgeIndianRupee, roles: ["Super Admin", "Admin", "Manager", "Accountant"] },
  { label: "Notifications", path: "notifications", icon: Bell, roles: ["*"] },
  { label: "Users", path: "users", icon: UserCog, roles: ["Super Admin", "Admin"] },
  { label: "Settings", path: "settings", icon: Settings, roles: ["Super Admin", "Admin"] },
  { label: "Permissions", path: "permissions", icon: ShieldCheck, roles: ["Super Admin"] }
];

export const sidebarGroups = [
  { label: "Admissions", icon: GraduationCap, items: [{ path: "admissions", label: "Admissions Dashboard" }] },
  {
    label: "Students",
    icon: UsersRound,
    items: [
      { path: "students", label: "All Students" },
      { path: "attendance", label: "Student Attendance" },
      { path: "certificates" },
      { path: "offers" }
    ]
  },
  { label: "Academics", icon: BookOpen, items: [{ path: "courses" }, { path: "batches" }, { path: "lecture-reports" }, { path: "materials" }] },
  { label: "Finance", icon: BadgeIndianRupee, items: [{ path: "fees" }, { path: "receipts" }, { path: "payroll" }] },
  {
    label: "Employee Management",
    icon: BriefcaseBusiness,
    items: [
      { path: "employee-desk", label: "Employees Overview" },
      { path: "manager-dashboard" },
      { path: "telecaller-dashboard" },
      { path: "counsellor-dashboard" },
      { path: "faculty-dashboard" },
      { path: "hr" },
      { path: "employee-reports" },
      { path: "leave-requests" },
      { path: "tasks" },
      { path: "digital-marketing-management" }
    ]
  },
  { label: "Reports", icon: ClipboardCheck, items: [{ path: "reports" }] },
  { label: "Administration", icon: Settings, items: [{ path: "notifications" }, { path: "users" }, { path: "office-ips" }, { path: "settings" }, { path: "permissions" }] }
];

export function menuForRole(role) {
  return baseMenu.filter((item) => item.roles.includes("*") || item.roles.includes(role));
}
