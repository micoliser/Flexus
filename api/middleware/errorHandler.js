/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    code: "NOT_FOUND",
    status: 404,
  });
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    code: err.code || "INTERNAL_ERROR",
    status: err.status || 500,
  });
};
