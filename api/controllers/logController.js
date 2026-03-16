import Log from "../models/Log.js";

class LogController {
  // GET /api/v1/logs
  static async getLogs(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 20, 1),
        100,
      );
      const skip = (page - 1) * limit;

      const query = {};

      const trimmedSearch = String(req.query.search || "").trim();
      if (trimmedSearch) {
        query.actorEmail = { $regex: trimmedSearch, $options: "i" };
      }

      const { startDate: startDateParam, endDate: endDateParam } = req.query;
      if (startDateParam || endDateParam) {
        query.createdAt = {};
        if (startDateParam) {
          const startDate = new Date(startDateParam);
          if (!isNaN(startDate.getTime())) query.createdAt.$gte = startDate;
        }
        if (endDateParam) {
          const endDate = new Date(endDateParam);
          if (!isNaN(endDate.getTime())) query.createdAt.$lte = endDate;
        }
        if (!Object.keys(query.createdAt).length) delete query.createdAt;
      }

      const [logs, total] = await Promise.all([
        Log.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Log.countDocuments(query),
      ]);

      const totalPages = Math.max(Math.ceil(total / limit), 1);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasPrevious: page > 1,
          hasNext: page < totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default LogController;
