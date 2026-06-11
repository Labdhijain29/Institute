import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

dotenv.config({ path: "server/.env" });
dotenv.config();

const password = "admin123";

const users = [
  { name: "Super Admin", email: "superadmin@institutecrm.in", role: "Super Admin", mobile: "9000000001" },
  { name: "Admin", email: "admin@institutecrm.in", role: "Admin", mobile: "9000000002" },
  { name: "Manager", email: "manager@institutecrm.in", role: "Manager", mobile: "9000000003" },
  { name: "Telecaller", email: "telecaller@institutecrm.in", role: "Telecaller", mobile: "9000000004" },
  { name: "Counsellor", email: "counsellor@institutecrm.in", role: "Counsellor", mobile: "9000000005" },
  { name: "HR", email: "hr@institutecrm.in", role: "HR", mobile: "9000000006" },
  { name: "Receptionist", email: "receptionist@institutecrm.in", role: "Receptionist", mobile: "9000000007" },
  { name: "Accountant", email: "accountant@institutecrm.in", role: "Accountant", mobile: "9000000008" }
];

await connectDB();

for (const demoUser of users) {
  const existing = await User.findOne({ email: demoUser.email }).select("+password");
  if (existing) {
    existing.name = demoUser.name;
    existing.role = demoUser.role;
    existing.mobile = demoUser.mobile;
    existing.password = password;
    existing.isActive = true;
    await existing.save();
  } else {
    await User.create({ ...demoUser, password, isActive: true });
  }
}

console.log("Demo users ready:");
for (const user of users) {
  console.log(`${user.role}: ${user.email} / ${password}`);
}

process.exit(0);
