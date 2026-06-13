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
  "Student",
  "Parent"
];

export const ROLE_PERMISSIONS = {
  "Super Admin": ["*"],
  Admin: ["users:*", "leads:*", "students:*", "courses:*", "batches:*", "fees:*", "receipts:*", "certificates:*", "offers:*", "reports:*", "settings:*"],
  Manager: ["leads:*", "receipts:*", "certificates:*", "offers:*", "payments:read", "students:read", "reports:read", "tasks:*", "demos:*"],
  HR: ["staff:*", "attendance:*", "salary:*", "tasks:read"],
  Telecaller: ["leads:create", "leads:read", "leads:update", "leads:forward", "followups:*"],
  Counsellor: ["leads:read", "leads:update", "leads:forward", "demos:*"],
  Faculty: ["leads:read", "leads:approve", "batches:read", "students:read", "students:create", "attendance:*", "materials:*", "assignments:*", "tests:*"],
  Accountant: ["fees:*", "payments:*", "receipts:*", "expenses:*", "salary:*", "reports:read"],
  Receptionist: ["leads:create", "leads:read", "demos:create", "visitors:*"],
  Student: ["profile:read", "attendance:read", "fees:read", "materials:read", "assignments:read", "tests:read", "certificates:read"],
  Parent: ["student-progress:read", "fees:read", "notices:read"]
};

export function hasPermission(role, permission) {
  const granted = ROLE_PERMISSIONS[role] || [];
  const [module] = permission.split(":");
  return granted.includes("*") || granted.includes(permission) || granted.includes(`${module}:*`);
}
