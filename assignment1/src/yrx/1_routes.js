const express = require("express");
const router = express.Router();
const db = require("./database");
const { validatePaper, validateId } = require("./middleware"); 

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
    if (filters.year !== null && (typeof filters.year !== "number" || !Number.isInteger(filters.year) || filters.year <= 1900)) {
      throw { name: "InvalidQueryError" };
    }

    if (typeof filters.limit !== "number" || !Number.isInteger(filters.limit) || filters.limit <= 0 || filters.limit > 100) {
      throw { name: "InvalidQueryError" };
    }

    if (typeof filters.offset !== "number" || !Number.isInteger(filters.offset) || filters.offset < 0) {
      throw { name: "InvalidQueryError" };
    }

    const papers = await db.getAllPapers(filters);

    res.status(200).json(papers);
  } catch (error) {
    next(error);
  }  
});

// GET /api/papers/:id
router.get("/papers/:id", validateId, async (req, res, next) => {
  try {
    // Your implementation here
    const paper = await db.getPaperById(req.params.id);

    if (!paper) {
      throw { name: "NotFoundError" };
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

    // Your implementation here
    const newPaper = await db.createPaper(req.body);
    res.status(201).json(newPaper);
  } catch (error) {
    next(error);
  }
});

// PUT /api/papers/:id
router.put("/papers/:id", validateId, async (req, res, next) => {
  try {
    const errors = validatePaper(req.body);
    if (errors.length > 0) {
      return res
        .status(400)
        .json({ error: "Validation Error", messages: errors });
    }

    // Your implementation here
    const existingPaper = await db.getPaperById(req.params.id);
    if (!existingPaper) {
      const error = new Error();
      error.name = "NotFoundError";
      throw error;
    }

    const updatedPaper = await db.updatePaper(req.params.id, req.body);

    res.status(200).json(updatedPaper);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/papers/:id
router.delete("/papers/:id", validateId, async (req, res, next) => {
  try {
    // Your implementation here
    const paper = await db.getPaperById(req.params.id);
    if (!paper) {
      const error = new Error();
      error.name = "NotFoundError";
      throw error;
    }

    await db.deletePaper(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
