const express = require("express");
const router = express.Router();
const db = require("../database");
const middleware = require("../middleware");

// GET /api/authors
router.get(
  "/",
  middleware.validateAuthorQueryParams,
  async (req, res, next) => {
    try {
      // TODO: Implement GET /api/authors
      //
      // 1. Extract query parameters:
      //    - name (optional)
      //    - affiliation (optional)
      //    - limit (optional, default: 10)
      //    - offset (optional, default: 0)
      const { name, affiliation, limit, offset } = req.query;
      const filters = {};
      if (name !== undefined) {
        filters.name = name;
      }
      if (affiliation !== undefined) {
        filters.affiliation = affiliation;
      }
      
      filters.limit = limit !== undefined && Number.isInteger(Number(limit)) && Number(limit) > 0
        ? Math.min(Number(limit), 100)
        : 10;

      filters.offset = offset !== undefined && Number.isInteger(Number(offset)) && Number(offset) >= 0
        ? Number(offset)
        : 0;

      //
      // 2. Call db.getAllAuthors with filters
      //
      const result = await db.getAllAuthors(filters);
      // 3. Send JSON response with status 200:
      //    res.json({
      //      authors,  // Array of authors with their papers
      //      total,    // Total number of authors matching filters
      //      limit,    // Current page size
      //      offset    // Current page offset
      //    });
      res.status(200).json({
        authors: result.authors,
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/authors/:id
router.get("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement GET /api/authors/:id
    //
    // 1. Get author ID from req.params
    //
    const id = parseInt(req.params.id, 10);
    // 2. Call db.getAuthorById
    //
    const author = await db.getAuthorById(id);
    // 3. If author not found, return 404
    //
    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    // 4. Send JSON response with status 200:
    //    res.json(author);
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
});

// POST /api/authors
router.post("/", async (req, res, next) => {
  try {
    // TODO: Implement POST /api/authors
    //
    // 1. Validate request body using middleware.validateAuthorInput
    //
    const errors = middleware.validateAuthorInput(req.body);
    // 2. If validation fails, return 400 with error messages
    //
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        messages: errors,
      });
    }
    // 3. Call db.createAuthor
    //
    const author = await db.createAuthor(req.body);
    // 4. Send JSON response with status 201:
    //    res.status(201).json(author);
    res.status(201).json(author);
  } catch (error) {
    next(error);
  }
});

// PUT /api/authors/:id
router.put("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement PUT /api/authors/:id
    //
    // 1. Get author ID from req.params
    //
    const id = parseInt(req.params.id, 10);
    // 2. Validate request body using middleware.validateAuthorInput
    //
    const errors = middleware.validateAuthorInput(req.body);
    // 3. If validation fails, return 400 with error messages
    //
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        messages: errors,
      });
    }
    // 4. Call db.updateAuthor
    //
    const existingAuthor = await db.getAuthorById(id);
    // 5. If author not found, return 404
    //
    if (!existingAuthor) {
      return res.status(404).json({ error: "Author not found" });
    }
    // 6. Send JSON response with status 200:
    //    res.json(author);
    const author = await db.updateAuthor(id, req.body);
    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/authors/:id
router.delete("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement DELETE /api/authors/:id
    //
    // 1. Get author ID from req.params
    //
    const id = parseInt(req.params.id, 10);
    // 2. Call db.deleteAuthor
    //
    const author = await db.deleteAuthor(id);
    // 3. If author not found, return 404
    //
    if (author === "AuthorNotFound"){
      return res.status(404).json({ error: "Author not found" });
    }
    // 4. If author is the sole author of any papers, return 400:
    //    {
    //      "error": "Constraint Error",
    //      "message": "Cannot delete author: they are the only author of one or more papers"
    //    }
    //
    // console.log("Author Data:", author);
    // console.log("Papers:", author.papers);

    // for (const paper of author.papers) {
    //   if (paper.authors.length === 1) {
    //     return res.status(400).json({
    //       error: "Constraint Error",
    //       message: "Cannot delete author: they are the only author of one or more papers"
    //     });
    //   }
    // }

    // for (const paper of author.papers) {
    //   const paperRecord = await db.getPaperById(paper.id);
    //   if (paperRecord.authors.length === 1) {
    //     return res.status(400).json({
    //       error: "Constraint Error",
    //       message: "Cannot delete author: they are the only author of one or more papers"
    //     });
    //   }
    // }





    // 5. Send no content response with status 204:
    //    res.status(204).end();
    
    res.status(204).end();



    
  } catch (error) {
    if (error.name === "ConstraintError") {
      return res.status(400).json({
        error: "Constraint Error",
        message:
          "Cannot delete author: they are the only author of one or more papers",
      });
    }
    next(error);
  }
});

module.exports = router;
