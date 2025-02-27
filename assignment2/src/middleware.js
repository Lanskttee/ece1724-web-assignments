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
  if (!paper.title || typeof paper.title !== 'string' || paper.title.trim() === '') {
    errors.push("Title is required");
  }
  if (!paper.publishedIn || typeof paper.publishedIn !== 'string' || paper.publishedIn.trim() === '') {
    errors.push("Published venue is required");
  }
  if (paper.year === undefined || paper.year === null || paper.year === ""|| (typeof paper.year === "string" && paper.year.trim() === "")) {
    errors.push("Published year is required");
  } else if (typeof paper.year !== 'number' || !Number.isInteger(paper.year) || paper.year <= 1900) {
    errors.push("Valid year after 1900 is required");
  } else if ( paper.year >=2026) {
    errors.push("Year cannot be in the future");
  }
  
  if (!Array.isArray(paper.authors) || paper.authors.length === 0) {
    errors.push("At least one author is required");
  } else {
    const hasMissingAuthorName = paper.authors.some(
      (author) => !author.name || typeof author.name !== "string" || author.name.trim() === ""
    );
    
    if (hasMissingAuthorName) {
      errors.push("Author name is required"); 
    }
    paper.authors.forEach((author, index) => {
      const authorErrors = validateAuthorInput(author);
      if (authorErrors.length > 0) {
        errors.push(`Author ${index + 1}: ${authorErrors.join(', ')}`);
      }
    });
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
  if (!author.name ||author.name===null|| typeof author.name !== 'string' || author.name.trim() === '') {
    errors.push("Name is required");
  }
  if (author.email !== undefined && author.email !== null && typeof author.email !== 'string') {
    errors.push("Email must be a string");
  }
  if (
    author.affiliation !== undefined &&
    author.affiliation !== null &&
    typeof author.affiliation !== 'string'
  ) {
    errors.push("Affiliation must be a string");
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
  const { year, publishedIn, author, limit, offset } = req.query;
  const errors = [];

  if (year !== undefined) {
    // const parsedYear = parseInt(year, 10);
    const parsedYear = Number(year);


    if (isNaN(parsedYear) || !Number.isInteger(parsedYear)|| parsedYear <= 1900 ) {
      errors.push("Year must be an integer greater than 1900");
    } 
    else if (isNaN(parsedYear) || parsedYear >= 2026 ) {
      errors.push("Year must be an integer less than 2026");
    }
    else {
      req.query.year = parsedYear;
    }
  }
  

  if (publishedIn !== undefined) {
    if (typeof publishedIn !== "string" || publishedIn.trim() === "") {
      errors.push("publishedIn must be a non-empty string");
    } else {
      req.query.publishedInRegex = { $regex: new RegExp(publishedIn, "i") }; 
    }
  }

  

  if (author !== undefined) {
    // if (typeof author !== "string" || author.trim() === "") {
    //   errors.push("Author must be a string");
    // }
    let authors = Array.isArray(author) ? author : [author];
    for (const authorName of authors) {
      if (typeof authorName !== "string" || authorName.trim() === "") {
        errors.push("Author must be a string");
      }
    }
  }
  

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) ||!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      errors.push("Limit must be a positive integer not greater than 100");
    } else {
      req.query.limit = parsedLimit;
    }
  } else {
    req.query.limit = 10;
  }

  if (offset !== undefined) {
    const parsedOffset = Number(offset);
    if (isNaN(parsedOffset) || !Number.isInteger(parsedOffset)|| parsedOffset < 0) {
      errors.push("Offset must be a non-negative integer");
    } else {
      req.query.offset = parsedOffset;
    }
  } else {
    req.query.offset = 0;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format"
    });
  }
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
  const errors = [];

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      errors.push("Name filter must be a non-empty string");
    }
  }
  if (affiliation !== undefined) {
    if (typeof affiliation !== 'string' || affiliation.trim() === '') {
      errors.push("Affiliation filter must be a non-empty string");
    }
  }

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (isNaN(parsedLimit) ||!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      errors.push("Limit must be a positive integer not greater than 100");
    } else {
      req.query.limit = parsedLimit;
    }
  } else {
    req.query.limit = 10;
  }

  if (offset !== undefined) {
    const parsedOffset = Number(offset);
    if (isNaN(parsedOffset) || !Number.isInteger(parsedOffset) ||parsedOffset < 0) {
      errors.push("Offset must be a non-negative integer");
    } else {
      req.query.offset = parsedOffset;
    }
  } else {
    req.query.offset = 0;
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid query parameter format"
    });
  }
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
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format",
    });
  }
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid ID format"
    });
  }
  req.params.id = parsedId;
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
