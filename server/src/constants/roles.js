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
  Admin: ["users:*", "leads:*", "students:*", "courses:*", "batches:*", "fees:*", "reports:*", "settings:*"],
  Manager: ["leads:*", "reports:read", "tasks:*", "demos:*"],
  HR: ["staff:*", "attendance:*", "salary:*", "tasks:read"],
  Telecaller: ["leads:read", "leads:update", "leads:forward", "followups:*"],
  Counsellor: ["leads:read", "leads:update", "leads:convert", "demos:*", "students:create"],
  Faculty: ["batches:read", "students:read", "attendance:*", "materials:*", "assignments:*", "tests:*"],
  Accountant: ["fees:*", "payments:*", "expenses:*", "salary:*", "reports:read"],
  Receptionist: ["leads:create", "leads:read", "demos:create", "visitors:*"],
  Student: ["profile:read", "attendance:read", "fees:read", "materials:read", "assignments:read", "tests:read", "certificates:read"],
  Parent: ["student-progress:read", "fees:read", "notices:read"]
};

export function hasPermission(role, permission) {
  const granted = ROLE_PERMISSIONS[role] || [];
  const [module] = permission.split(":");
  return granted.includes("*") || granted.includes(permission) || granted.includes(`${module}:*`);
}
