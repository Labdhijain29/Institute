export const ROLES = [
  "Super Admin",
  "Admin",
  "Manager",
  "HR",
  "Telecaller",
  "Counsellor",
  "Faculty",
  "Accountant",
  "Receptionist",
  "Developer/IT Staff",
  "Digital Marketing Executive",
  "Student",
  "Parent"
];

export const ROLE_PERMISSIONS = {
  "Super Admin": ["*"],
  Admin: ["users:*", "leads:*", "students:*", "courses:*", "batches:*", "fees:*", "receipts:*", "certificates:*", "offers:*", "reports:*", "settings:*", "staff:*", "attendance:*", "salary:*", "leaves:*", "lectures:*", "notices:read"],
  Manager: ["leads:*", "receipts:*", "certificates:*", "offers:*", "payments:read", "students:read", "reports:read", "attendance:read", "leaves:read", "tasks:*", "demos:*", "notices:read"],
  HR: ["staff:*", "attendance:*", "salary:*", "leaves:*", "reports:read", "lectures:read", "tasks:read", "notices:read"],
  Telecaller: ["leads:create", "leads:read", "leads:update", "leads:forward", "followups:*", "attendance:read", "leaves:create", "leaves:read", "notices:read"],
  Counsellor: ["leads:read", "leads:update", "leads:forward", "demos:*", "attendance:read", "leaves:create", "leaves:read", "notices:read"],
  Faculty: ["leads:read", "leads:approve", "batches:read", "students:read", "students:create", "attendance:*", "lectures:*", "leaves:create", "leaves:read", "materials:*", "assignments:*", "tests:*", "notices:read"],
  Accountant: ["fees:*", "payments:*", "receipts:*", "expenses:*", "salary:*", "reports:read", "attendance:read", "leaves:create", "leaves:read", "notices:read"],
  Receptionist: ["leads:create", "leads:read", "demos:create", "visitors:*", "attendance:read", "leaves:create", "leaves:read", "notices:read"],
  "Developer/IT Staff": ["attendance:create", "attendance:read", "leaves:create", "leaves:read", "tasks:read", "notices:read"],
  "Digital Marketing Executive": ["digital-marketing:own", "attendance:read", "leaves:create", "leaves:read", "notices:read"],
  Student: ["profile:read", "attendance:read", "fees:read", "materials:read", "assignments:read", "tests:read", "certificates:read", "notices:read"],
  Parent: ["student-progress:read", "attendance:read", "fees:read", "notices:read"]
};

export function hasPermission(role, permission) {
  const granted = ROLE_PERMISSIONS[role] || [];
  const [module] = permission.split(":");
  return granted.includes("*") || granted.includes(permission) || granted.includes(`${module}:*`);
}
