import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export function crudController(Model, options = {}) {
  return {
    list: asyncHandler(async (req, res) => {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
      const search = req.query.search;
      const filter = options.filter ? options.filter(req) : {};

      if (search && options.searchFields?.length) {
        filter.$or = options.searchFields.map((field) => ({ [field]: new RegExp(search, "i") }));
      }

      const [items, total] = await Promise.all([
        Model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Model.countDocuments(filter)
      ]);
      res.json({ items, total, page, pages: Math.ceil(total / limit) });
    }),
    get: asyncHandler(async (req, res) => {
      const item = await Model.findById(req.params.id);
      if (!item) throw new ApiError(404, "Record not found");
      res.json(item);
    }),
    create: asyncHandler(async (req, res) => {
      const item = await Model.create({ ...req.body, createdBy: req.user?._id });
      res.status(201).json(item);
    }),
    update: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!item) throw new ApiError(404, "Record not found");
      res.json(item);
    }),
    remove: asyncHandler(async (req, res) => {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) throw new ApiError(404, "Record not found");
      res.json({ message: "Deleted" });
    })
  };
}
