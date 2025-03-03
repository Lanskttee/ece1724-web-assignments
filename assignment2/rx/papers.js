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
    // 2. Call db.getAllPapers with filters
    //
    // 3. Send JSON response with status 200:
    //    res.json({
    //      papers,  // Array of papers with their authors
    //      total,   // Total number of papers matching filters
    //      limit,   // Current page size
    //      offset   // Current page offset
    //    });

    const { year, publishedIn, author, limit, offset } = req.query;

    const filters = {
      year: year ? parseInt(year, 10) : undefined,
      publishedIn: publishedIn || undefined,
      author: author || undefined,
      limit: limit ? Math.min(parseInt(limit, 10), 100) : 10,
      offset: offset ? Math.max(parseInt(offset, 10), 0) : 0,
    };

    const { papers, total } = await db.getAllPapers(filters);

    res.json({ papers, total, limit: filters.limit, offset: filters.offset });
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
    // 2. Call db.getPaperById
    //
    // 3. If paper not found, return 404
    //
    // 4. Send JSON response with status 200:
    //    res.json(paper);
    const paper = await db.getPaperById(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(paper);
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
    //
    // 2. If validation fails, return 400 with error messages
    //
    // 3. Call db.createPaper
    //
    // 4. Send JSON response with status 201:
    //    res.status(201).json(paper);
    const paperData = req.body;

    const validationErrors = middleware.validatePaperInput(paperData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation Error", messages: validationErrors });
    }

    const paper = await db.createPaper(paperData);

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
    // 2. Validate request body using middleware.validatePaperInput
    //
    // 3. If validation fails, return 400 with error messages
    //
    // 4. Call db.updatePaper
    //
    // 5. If paper not found, return 404
    //
    // 6. Send JSON response with status 200:
    //    res.json(paper);

    const paperId = req.params.id;

    const validationErrors = middleware.validatePaperInput(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ error: "Validation Error", messages: validationErrors });
    }

    const updatedPaper = await db.updatePaper(paperId, req.body);

    if (!updatedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(updatedPaper);
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
    // 2. Call db.deletePaper
    //
    // 3. If paper not found, return 404
    //
    // 4. Send no content response with status 204:
    //    res.status(204).end();
    const paperId = req.params.id;

    const deleted = await db.deletePaper(paperId);

    if (!deleted) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
