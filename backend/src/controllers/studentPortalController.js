import { Assignment } from "../models/Assignment.js";
import { Attendance } from "../models/Attendance.js";
import { Fee } from "../models/Fee.js";
import { Payment } from "../models/Payment.js";
import { Student } from "../models/Student.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function resolveStudent(user) {
  let student = await Student.findOne({ $or: [{ user: user._id }, { email: user.email }] });

  if (!student) {
    try {
      student = await Student.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            studentId: `STU-${new Date().getFullYear()}-${String(user._id).slice(-8).toUpperCase()}`,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            admissionDate: user.dateOfJoining || new Date(),
            status: "Active"
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (error) {
      if (error?.code !== 11000) throw error;
      student = await Student.findOne({ $or: [{ user: user._id }, { email: user.email }] });
    }
  } else if (!student.user) {
    student.user = user._id;
    await student.save();
  }

  if (!student) throw new ApiError(500, "Unable to prepare student profile");
  await student.populate("course", "name duration isActive");
  await student.populate("batch", "name status startDate endDate");
  return student;
}

function assignmentFilter(student) {
  const filters = [];
  if (student.course?._id) filters.push({ course: student.course._id });
  if (student.batch?._id) filters.push({ batch: student.batch._id });
  return filters.length ? { $or: filters } : null;
}

export const portalData = asyncHandler(async (req, res) => {
  const student = await resolveStudent(req.user);
  const scopedFilter = assignmentFilter(student);
  let registrationDetails = {};
  try {
    registrationDetails = student.performance ? JSON.parse(student.performance) : {};
  } catch {
    registrationDetails = {};
  }

  const [attendanceRows, assignmentRows, materialRows, feeRows, payments] = await Promise.all([
    Attendance.find({ student: student._id }).sort({ date: -1 }).lean(),
    scopedFilter ? Assignment.find(scopedFilter).sort({ dueAt: 1 }).lean() : [],
    scopedFilter ? StudyMaterial.find({ ...scopedFilter, isActive: true }).sort({ createdAt: -1 }).lean() : [],
    Fee.find({ student: student._id }).lean(),
    Payment.find({ student: student._id }).sort({ paidAt: -1 }).lean()
  ]);

  const totalClasses = attendanceRows.length;
  const presentClasses = attendanceRows.filter((row) => row.status === "Present").length;
  const absentClasses = attendanceRows.filter((row) => row.status === "Absent").length;
  const attendancePercentage = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 0;

  const assignments = assignmentRows.map((assignment) => {
    const submission = assignment.submissions?.find((item) => String(item.student) === String(student._id));
    return {
      id: assignment._id,
      title: assignment.title,
      dueDate: assignment.dueAt,
      status: submission?.submittedAt ? "Submitted" : "Pending"
    };
  });

  const totalFees = feeRows.reduce((sum, fee) => sum + (fee.totalFees || 0), 0);
  const paidFees = feeRows.reduce((sum, fee) => sum + (fee.paidFees || 0), 0);
  const remainingFees = feeRows.reduce((sum, fee) => sum + (fee.pendingFees ?? Math.max((fee.totalFees || 0) - (fee.discount || 0) - (fee.paidFees || 0), 0)), 0);

  res.json({
    student: {
      id: student._id,
      studentId: student.studentId,
      name: student.name,
      email: req.user.email,
      mobile: req.user.mobile || student.mobile || "",
      profilePicture: req.user.avatar || "",
      courseName: student.course?.name || "Not assigned",
      batchName: student.batch?.name || "Not assigned",
      admissionDate: student.admissionDate,
      parentName: student.parentName || "",
      parentMobile: student.parentMobile || "",
      address: student.address || {},
      gender: registrationDetails.gender || "",
      dateOfBirth: registrationDetails.dateOfBirth || "",
      highestQualification: registrationDetails.highestQualification || "",
      currentStatus: registrationDetails.currentStatus || "",
      learningMode: registrationDetails.learningMode || "",
      remarks: registrationDetails.remarks || ""
    },
    dashboard: {
      attendancePercentage,
      pendingAssignments: assignments.filter((item) => item.status === "Pending").length,
      remainingFees
    },
    course: {
      name: student.course?.name || "Not assigned",
      duration: student.course?.duration || "Not available",
      status: student.status || "Active"
    },
    attendance: {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage,
      recent: attendanceRows.slice(0, 6).map((row) => ({
        id: row._id,
        date: row.date,
        status: row.status,
        loginTime: row.loginTime,
        logoutTime: row.logoutTime,
        totalWorkingMinutes: row.totalWorkingMinutes || 0,
        remarks: row.remarks || ""
      }))
    },
    assignments,
    materials: materialRows.map((material) => ({ id: material._id, title: material.title, type: material.type, url: material.url })),
    fees: {
      totalFees,
      paidFees,
      remainingFees,
      payments: payments.map((payment) => ({
        id: payment._id,
        amount: payment.amount,
        mode: payment.mode,
        receiptNo: payment.receiptNo,
        paidAt: payment.paidAt
      }))
    }
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) throw new ApiError(400, "Current and new password are required");
  if (newPassword.length < 6) throw new ApiError(400, "New password must be at least 6 characters");

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(currentPassword))) throw new ApiError(400, "Current password is incorrect");
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password changed successfully" });
});
