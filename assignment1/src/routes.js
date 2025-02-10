const express = require("express");
const router = express.Router();
const db = require("./database");
const { validatePaper, validateId } = require("./middleware");

function dateformat(paper) { 
  if (!paper) return null;
  return{
  ...paper,
  created_at: new Date(paper.created_at).toISOString(),updated_at: new Date(paper.updated_at).toISOString()};
}
// GET /api/papers
router.get("/papers", async (req, res, next) => {
  try {
    const filters = {
      year: req.query.year ? parseInt(req.query.year) : undefined,
      published_in: req.query.published_in,
      limit: req.query.limit ? parseInt(req.query.limit) : 10,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    // Your implementation here
    
    // if (isNaN(filters.year) || !Number.isInteger(filters.year) || filters.year <= 1900) {
    if (filters.year !== undefined && (isNaN(filters.year) || !Number.isInteger(filters.year) || filters.year <= 1900)) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });}
    if (!Number.isInteger(filters.limit) ||filters.limit <= 0 || filters.limit > 100) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });}
    if (!Number.isInteger(filters.offset) ||filters.offset < 0 ) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });}
    if (filters.published_in  && typeof filters.published_in !== "string") {
      return res.status(400).json({
        error: "Validation Error",
        message: "Invalid query parameter format",
      });}

    const papers = await db.getAllPapers(filters);
    res.status(200).json(papers.map(dateformat));

  } catch (error) {
    next(error);
  }
});

// GET /api/papers/:id
router.get("/papers/:id", async (req, res, next) => {
  try {
    // Your implementation here
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || parseInt(id) <= 0) {
      return res.status(400).json({ error: "Validation Error", message: "Invalid ID format" });
    }

    const paper = await db.getPaperById(id);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(200).json(dateformat(paper));

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
    res.status(201).json(dateformat(newPaper));

  } catch (error) {
    next(error);
  }
});

// PUT /api/papers/:id
router.put("/papers/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || parseInt(id) <= 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", message: "Invalid ID format" });
    }


    const errors = validatePaper(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    const existingPaper = await db.getPaperById(id);
    if (!existingPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // 比较新旧数据，若无变化，则直接返回原数据
    const { title, authors, published_in, year } = req.body;
    if (
      existingPaper.title === title &&
      existingPaper.authors === authors &&
      existingPaper.published_in === published_in &&
      existingPaper.year === year
    ) {
      return res.status(200).json(dateformat(existingPaper)); 
    }


  

    // Your implementation here
    const updatedPaper = await db.updatePaper(req.params.id, req.body);
    // const updatedPaper = await db.updatePaper(id, req.body);
    if (!updatedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.status(200).json(dateformat(updatedPaper));

  } catch (error) {
    next(error);
  }
});

// DELETE /api/papers/:id
router.delete("/papers/:id", async (req, res, next) => {
  try {
    // Your implementation here
    const { id } = req.params;
    if (!Number.isInteger(Number(id)) || parseInt(id) <= 0) {
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
