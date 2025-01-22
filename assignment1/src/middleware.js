// Request logger middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// Validate paper input
const validatePaper = (paper) => {
  // TODO: Implement paper validation
  // Return an array of error messages, empty array if validation passes
  //
  // Required fields validation:
  // - title: non-empty string
  // - authors: non-empty string
  // - published_in: non-empty string
  // - year: integer greater than 1900
  //
  // Error message format should match the handout, for example:
  // - "Title is required"
  // - "Authors are required"
  // - "Published venue is required"
  // - "Published year is required"
  // - "Valid year after 1900 is required"
  const errors = [];
  
  // ?. (可选链操作符)
  // 功能：在访问对象属性时，安全地检查前面的属性是否存在，避免报错。
  // trim() 用于去除字符串两端的空白字符（如空格、换行等）。
  const title = paper.title?.trim();
  const authors = paper.authors?.trim();
  const publishedIn = paper.published_in?.trim();
  const year = paper.year;

  if (!title) errors.push("Title is required");
  if (!authors) errors.push("Authors are required");
  if (!publishedIn) errors.push("Published venue is required");
  if (!year) errors.push("Published year is required")
  else if (!Number.isInteger(year) || year <= 1900) {
    errors.push("Valid year after 1900 is required");
  }

  return errors;
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // TODO: Implement error handling
  // Hint: Return errors in these exact formats as specified in the handout:
  //
  // 1. Validation Errors (400):
  // {
  //   "error": "Validation Error",
  //   "messages": ["Title is required", "Valid year after 1900 is required"]
  // }
  //
  // 2. Not Found Error (404):
  // {
  //   "error": "Paper not found"
  // }
  //
  // 3. Invalid Query Parameter (400):
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid query parameter format"
  // }
  //
  // Remember to:
  // - Log errors for debugging (console.error)
  // - Send appropriate status codes (400, 404)

  console.error(err);
  if (err.type === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      messages: err.messages,
    });
  }

  if (err.type === "NotFoundError") {
    return res.status(404).json({
      error: "Paper not found",
    });
  }

  if (err.type === "InvalidQueryParameter") {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong",
  });
};

// Validate ID parameter middleware
const validateId = (req, res, next) => {
  // TODO: Implement ID validation
  //
  // If ID is invalid, return:
  // Status: 400
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid ID format"
  // }
  //
  // If valid, call next()
  const id = req.params.id;
  //+ 类型转换操作符，将后面的值尝试转换为数字类型。如果无法转换为有效的数字，则结果为 NaN
  if (!id || !Number.isInteger(+id) || +id <= 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format",
    });
  }

  next();
};

module.exports = {
  requestLogger,
  validatePaper,
  errorHandler,
  validateId,
};
