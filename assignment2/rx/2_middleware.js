// Request logger middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

// Validate paper input for Assignment 2
// Note: This is different from Assignment 1 as it handles authors as objects
const validatePaperInput = (paper) => {
  // TODO: Implement paper validation
  //
  // Required fields:
  // - title: non-empty string
  // - publishedIn: non-empty string
  // - year: integer > 1900
  // - authors: non-empty array of author objects
  //   where each author must have:
  //   - name: required, non-empty string
  //   - email: optional string
  //   - affiliation: optional string
  //
  // Return array of error messages, for example:
  // [
  //   "Title is required",
  //   "Published venue is required",
  //   "Valid year after 1900 is required",
  //   "At least one author is required"
  // ]
  const errors = [];

  // Validate required fields
  if (!paper.title || typeof paper.title !== "string" || paper.title.trim() === "") {
    errors.push("Title is required");
  }

  if (!paper.publishedIn || typeof paper.publishedIn !== "string" || paper.publishedIn.trim() === "") {
    errors.push("Published venue is required");
  }

  if (paper.year === undefined || paper.year === null) {
    errors.push("Published year is required");
  } else if (typeof paper.year !== "number" || paper.year <= 1900) {
    errors.push("Valid year after 1900 is required");
  }

  
  if (!Array.isArray(paper.authors) || paper.authors.length === 0) {
    errors.push("At least one author is required");
  } else {
    // Ensure "Author name is required" appears only once
    const hasMissingAuthorName = paper.authors.some(
      (author) => !author.name || typeof author.name !== "string" || author.name.trim() === ""
    );
    
    if (hasMissingAuthorName) {
      errors.push("Author name is required"); // Only added once
    }
  }

  return errors;
};

// Validate author input
const validateAuthorInput = (author) => {
  // TODO: Implement author validation
  //
  // Required fields:
  // - name: non-empty string
  //
  // Optional fields:
  // - email: string
  // - affiliation: string
  //
  // Return array of error messages, for example:
  // [
  //   "Name is required"
  // ]
  const errors = [];

  if (!author.name || typeof author.name !== "string" || author.name.trim() === "") {
    errors.push("Name is required");
  }
  return errors;
};

// Validate query parameters for papers
const validatePaperQueryParams = (req, res, next) => {
  // TODO: Implement query parameter validation for papers
  //
  // Validate:
  // - year: optional, must be integer > 1900 if provided
  //   - Parse string to integer
  //   - Update req.query.year with the parsed value
  // - publishedIn: optional, string
  //   - No parsing needed
  // - author: optional, string
  //   - No parsing needed
  // - limit: optional, must be positive integer <= 100 if provided
  //   - Parse string to integer
  //   - Default to 10 if not provided
  //   - Update req.query.limit with the parsed value
  // - offset: optional, must be non-negative integer if provided
  //   - Parse string to integer
  //   - Default to 0 if not provided
  //   - Update req.query.offset with the parsed value
  //
  // If invalid, return:
  // Status: 400
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid query parameter format"
  // }
  //
  // If valid, call next()

  const { year, limit, offset } = req.query;

  // Validate `year`: optional, must be integer > 1900 if provided
  if (year !== undefined) {
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear <= 1900 || /\-/.test(year)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });
    }
    req.query.year = parsedYear;
  }

  // Validate `limit`: optional, must be a positive integer <= 100
  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });
    }
    req.query.limit = parsedLimit;
  } else {
    req.query.limit = 10; // Default limit
  }

  // Validate `offset`: optional, must be a non-negative integer
  if (offset !== undefined) {
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });
    }
    req.query.offset = parsedOffset;
  } else {
    req.query.offset = 0; // Default offset
  }

  // If `publishedIn` or `author` are provided, they must be strings (no extra validation needed)
  if (req.query.publishedIn !== undefined && typeof req.query.publishedIn !== "string") {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }

  if (offset !== undefined) {
    const parsedOffset = parseInt(offset, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });
    }
    req.query.offset = parsedOffset;
  } else {
    req.query.offset = 0; // Default offset
  }

  // If `author` is provided, it must be a string or an array of strings
  if (req.query.author !== undefined) {
    if (!Array.isArray(req.query.author)) {
      req.query.author = [req.query.author];
    }
    for (const authorName of req.query.author) {
      if (typeof authorName !== "string" || authorName.trim() === "") {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid query parameter format",
        });
      }
    }
  }

  // Validation successful, move to the next middleware
  next();
};

// Validate query parameters for authors
const validateAuthorQueryParams = (req, res, next) => {
  // TODO: Implement query parameter validation for authors
  //
  // Validate:
  // - name: optional, string
  // - affiliation: optional, string
  // - limit: optional, must be positive integer <= 100 if provided
  // - offset: optional, must be non-negative integer if provided
  //
  // If invalid, return:
  // Status: 400
  // {
  //   "error": "Validation Error",
  //   "message": "Invalid query parameter format"
  // }
  //
  // If valid, call next()

  const { name, affiliation, limit, offset } = req.query;

  if (
    (name !== undefined && (typeof name !== "string" || name.trim() === "")) ||
    (affiliation !== undefined && (typeof affiliation !== "string" || affiliation.trim() === ""))
  ) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }

  const parsedLimit = limit !== undefined ? parseInt(limit, 10) : 10;
  const parsedOffset = offset !== undefined ? parseInt(offset, 10) : 0;

  if (
    isNaN(parsedLimit) ||
    isNaN(parsedOffset) ||
    parsedLimit <= 0 ||
    parsedLimit > 100 ||
    parsedOffset < 0
  ) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format",
    });
  }

  req.query.limit = parsedLimit;
  req.query.offset = parsedOffset;

  next();
};

// Validate resource ID parameter
// Used for both paper and author endpoints
const validateResourceId = (req, res, next) => {
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

  const { id } = req.params;

  if (id.includes('.') || !/^\d+$/.test(id)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format",
    });
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format",
    });
  }

  req.params.id = parsedId; // Update ID to parsed value
  next();
};

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err);

  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
};

module.exports = {
  requestLogger,
  validatePaperInput,
  validateAuthorInput,
  validatePaperQueryParams,
  validateAuthorQueryParams,
  validateResourceId,
  errorHandler,
};
