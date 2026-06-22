import { Batch } from "../models/Batch.js";
import { Course } from "../models/Course.js";
import { Fee } from "../models/Fee.js";
import { Student } from "../models/Student.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const assignStudent = asyncHandler(async (req, res) => {
  const { course: courseId, batch: batchId, admissionDate, totalFees, discount = 0 } = req.body;
  if (!courseId || !batchId) throw new ApiError(400, "Course and batch are required");

  const [student, course, batch] = await Promise.all([
    Student.findById(req.params.id),
    Course.findById(courseId),
    Batch.findById(batchId)
  ]);

  if (!student) throw new ApiError(404, "Student not found");
  if (!course || !course.isActive) throw new ApiError(400, "Select an active course");
  if (!batch) throw new ApiError(400, "Batch not found");
  if (String(batch.course) !== String(course._id)) throw new ApiError(400, "Selected batch does not belong to this course");

  const previousBatch = student.batch;
  student.course = course._id;
  student.batch = batch._id;
  student.admissionDate = admissionDate || student.admissionDate || new Date();
  student.status = "Active";
  await student.save();

  if (previousBatch && String(previousBatch) !== String(batch._id)) {
    await Batch.findByIdAndUpdate(previousBatch, { $pull: { students: student._id } });
  }
  await Batch.findByIdAndUpdate(batch._id, { $addToSet: { students: student._id } });

  const fee = await Fee.findOne({ student: student._id });
  const resolvedTotal = Math.max(Number(totalFees ?? course.fees) || 0, 0);
  const resolvedDiscount = Math.max(Number(discount) || 0, 0);
  if (fee) {
    fee.course = course._id;
    fee.totalFees = resolvedTotal;
    fee.discount = resolvedDiscount;
    fee.pendingFees = Math.max(resolvedTotal - resolvedDiscount - (fee.paidFees || 0), 0);
    await fee.save();
  } else {
    await Fee.create({
      student: student._id,
      course: course._id,
      totalFees: resolvedTotal,
      discount: resolvedDiscount,
      paidFees: 0,
      pendingFees: Math.max(resolvedTotal - resolvedDiscount, 0),
      createdBy: req.user._id
    });
  }

  const result = await Student.findById(student._id).populate("course", "name duration fees").populate("batch", "name timing status");
  res.json({ message: "Course, batch and fees assigned successfully", student: result });
});
