const express = require("express");
const router = express.Router();
const db = require("../database");
const middleware = require("../middleware");

// GET /api/papers
router.get("/", middleware.validatePaperQueryParams, async (req, res, next) => {
  try {
    // TODO: Implement GET /api/papers
    //
    // 1. Extract query parameters:
    //    - year (optional)
    //    - publishedIn (optional)
    //    - author (optional)
    //    - limit (optional, default: 10)
    //    - offset (optional, default: 0)
    //
    const { year, publishedIn, author, limit, offset } = req.query;
    const filters = {};
    if (year !== undefined) {
      filters.year = Number(year);
    }
    if (publishedIn !== undefined) {
      filters.publishedIn = publishedIn;
    }
    if (author !== undefined) {
      filters.author = author;
    }
    filters.limit = limit !== undefined ? Number(limit) : 10;
    filters.offset = offset !== undefined ? Number(offset) : 0;
    // 2. Call db.getAllPapers with filters
    //
    const result = await db.getAllPapers(filters);
    // 3. Send JSON response with status 200:
    //    res.json({
    //      papers,  // Array of papers with their authors
    //      total,   // Total number of papers matching filters
    //      limit,   // Current page size
    //      offset   // Current page offset
    //    });
    res.status(200).json({
      papers: result.papers,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/papers/:id
router.get("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement GET /api/papers/:id
    //
    // 1. Get paper ID from req.params
    //
    const id = req.params.id;
    // 2. Call db.getPaperById
    //
    const paper = await db.getPaperById(id);
    // 3. If paper not found, return 404
    //
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    // 4. Send JSON response with status 200:
    //    res.json(paper);
    res.status(200).json(paper);
  } catch (error) {
    next(error);
  }
});

// POST /api/papers
router.post("/", async (req, res, next) => {
  try {
    // TODO: Implement POST /api/papers
    //
    // 1. Validate request body using middleware.validatePaperInput
    const errors = middleware.validatePaperInput(req.body);
    //
    // 2. If validation fails, return 400 with error messages
    //
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        messages: errors,
      });
    }
    // 3. Call db.createPaper
    //
    const paper = await db.createPaper(req.body);
    // 4. Send JSON response with status 201:
    //    res.status(201).json(paper);
    res.status(201).json(paper);
  } catch (error) {
    next(error);
  }
});

// PUT /api/papers/:id
router.put("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement PUT /api/papers/:id
    //
    // 1. Get paper ID from req.params
    //
    const id = req.params.id;
    // 2. Validate request body using middleware.validatePaperInput
    //
    const errors = middleware.validatePaperInput(req.body);
    // 3. If validation fails, return 400 with error messages
    //
    if (errors.length > 0) {
      return res.status(400).json({
        error: "Validation Error",
        messages: errors,
      });
    }
    // 4. Call db.updatePaper
    //
    const existingPaper = await db.getPaperById(id);
    // 5. If paper not found, return 404
    //
    if (!existingPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    const paper = await db.updatePaper(id, req.body);
    // 6. Send JSON response with status 200:
    //    res.json(paper);
    res.status(200).json(paper);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/papers/:id
router.delete("/:id", middleware.validateResourceId, async (req, res, next) => {
  try {
    // TODO: Implement DELETE /api/papers/:id
    //
    // 1. Get paper ID from req.params
    //
    const id = req.params.id;
    // 2. Call db.deletePaper
    //
    const existingPaper = await db.getPaperById(id);
    // 3. If paper not found, return 404
    //
    if (!existingPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    // 4. Send no content response with status 204:
    //    res.status(204).end();
    await db.deletePaper(id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
