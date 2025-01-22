const express = require("express");
const router = express.Router();
const db = require("./database");
const { validatePaper } = require("./middleware");

// GET /api/papers
router.get("/papers", async (req, res, next) => {
  try {
    const filters = {
      year: req.query.year ? parseInt(req.query.year) : null,
      published_in: req.query.published_in,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    // Your implementation here
    if (filters.year && filters.year <= 1900) {
      return res.status(400).json({ error: "Validation Error", message: "Valid year after 1900 is required" });
    }
    if (filters.limit <= 0 || filters.limit > 100) {
      return res.status(400).json({ error: "Validation Error", message: "Limit should be a positive integer not exceeding 100" });
    }

    const papers = await db.getPapers(filters);
    res.status(200).json(papers);

  } catch (error) {
    next(error);
  }
});

// GET /api/papers/:id
router.get("/papers/:id", async (req, res, next) => {
  try {
    // Your implementation here
    const { id } = req.params;
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "Validation Error", message: "Invalid ID format" });
    }

    const paper = await db.getPaperById(id);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(200).json(paper);

  } catch (error) {
    next(error);
  }
});

// POST /api/papers
router.post("/papers", async (req, res, next) => {
  try {
    const errors = validatePaper(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    const newPaper = await db.createPaper(req.body);
    res.status(201).json(newPaper);

  } catch (error) {
    next(error);
  }
});

// PUT /api/papers/:id
router.put("/papers/:id", async (req, res, next) => {
  try {
    const errors = validatePaper(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    // Your implementation here
    const updatedPaper = await db.updatePaper(id, req.body);
    if (!updatedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(200).json(updatedPaper);

  } catch (error) {
    next(error);
  }
});

// DELETE /api/papers/:id
router.delete("/papers/:id", async (req, res, next) => {
  try {
    // Your implementation here
    const { id } = req.params;
    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "Validation Error", message: "Invalid ID format" });
    }

    const deleted = await db.deletePaper(id);
    if (!deleted) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
