const request = require("supertest");
const app = require("../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const samplePaper = {
  title: "Sample Paper Title",
  publishedIn: "ICSE 2024",
  year: 2024,
  authors: [
    {
      name: "John Doe",
      email: "john@mail.utoronto.ca",
      affiliation: "University of Toronto",
    },
    {
      name: "Jane Smith",
      email: null,
      affiliation: "University A",
    },
  ],
};

// Clean up before all tests
beforeAll(async () => {
  await prisma.paper.deleteMany();
  await prisma.author.deleteMany();
});

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

describe("API Tests for Paper Routes", () => {
  // POST /api/papers
  describe("POST /api/papers", () => {
    it("should create a new paper with valid input", async () => {
      const res = await request(app).post("/api/papers").send(samplePaper);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: samplePaper.title,
        publishedIn: samplePaper.publishedIn,
        year: samplePaper.year,
      });
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body).toHaveProperty("updatedAt");

      expect(res.body.authors).toHaveLength(samplePaper.authors.length);
      samplePaper.authors.forEach((expectedAuthor) => {
        const foundAuthor = res.body.authors.find(
          (author) => author.name === expectedAuthor.name
        );
        expect(foundAuthor).toBeDefined();
        expect(foundAuthor).toMatchObject({
          name: expectedAuthor.name,
          email: expectedAuthor.email,
          affiliation: expectedAuthor.affiliation,
        });
      });
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/papers").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Published venue is required",
        "Published year is required",
        "At least one author is required",
      ]);
    });

    it("should return 400 if year is invalid", async () => {
      const res = await request(app)
        .post("/api/papers")
        .send({ ...samplePaper, year: 1900 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Valid year after 1900 is required"]);
    });
  });

  // GET /api/papers
  describe("GET /api/papers", () => {
    it("should retrieve a list of papers", async () => {
      const res = await request(app).get("/api/papers");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("papers");
      expect(Array.isArray(res.body.papers)).toBeTruthy();
      expect(res.body.papers.length).toBeGreaterThan(0);
      res.body.papers.forEach((paper) => {
        expect(paper).toHaveProperty("id");
        expect(paper).toHaveProperty("title");
        expect(paper).toHaveProperty("publishedIn");
        expect(paper).toHaveProperty("year");
        expect(paper).toHaveProperty("createdAt");
        expect(paper).toHaveProperty("updatedAt");
        expect(paper.authors).toBeInstanceOf(Array);
        if (paper.authors.length > 0) {
          expect(paper.authors[0]).toHaveProperty("id");
          expect(paper.authors[0]).toHaveProperty("name");
          expect(paper.authors[0]).toHaveProperty("email");
          expect(paper.authors[0]).toHaveProperty("affiliation");
          expect(paper.authors[0]).toHaveProperty("createdAt");
          expect(paper.authors[0]).toHaveProperty("updatedAt");
        }
      });
    });

    it("should apply filters correctly", async () => {
      const res = await request(app).get(
        "/api/papers?year=2024&publishedIn=ICSE"
      );

      expect(res.status).toBe(200);
      res.body.papers.forEach((paper) => {
        expect(paper.year).toBe(2024);
        expect(paper.publishedIn).toMatch(/ICSE/i);
      });
    });
  });

  // GET /api/papers/:id
  describe("GET /api/papers/:id", () => {
    it("should retrieve a paper by ID", async () => {
      const createRes = await request(app)
        .post("/api/papers")
        .send(samplePaper);
      const res = await request(app).get(`/api/papers/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(createRes.body);
    });

    it("should return 404 if paper is not found", async () => {
      const res = await request(app).get("/api/papers/999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  // PUT /api/papers/:id
  describe("PUT /api/papers/:id", () => {
    it("should update an existing paper", async () => {
      const createRes = await request(app)
        .post("/api/papers")
        .send(samplePaper);
      const updatedPaper = {
        title: "Updated Title",
        publishedIn: "Updated Venue",
        year: 2025,
        authors: [
          {
            name: "Updated Author",
            email: "updated.author@example.com",
            affiliation: "Updated University",
          },
        ],
      };
      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send(updatedPaper);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updatedPaper);
      expect(res.body).toHaveProperty("updatedAt");
    });

    it("should return 404 if paper is not found", async () => {
      const res = await request(app).put("/api/papers/99999").send(samplePaper);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  // DELETE /api/papers/:id
  describe("DELETE /api/papers/:id", () => {
    it("should delete a paper by ID", async () => {
      const createRes = await request(app)
        .post("/api/papers")
        .send(samplePaper);
      const res = await request(app).delete(`/api/papers/${createRes.body.id}`);

      expect(res.status).toBe(204);

      const getRes = await request(app).get(`/api/papers/${createRes.body.id}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 if paper is not found", async () => {
      const res = await request(app).delete("/api/papers/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Paper not found");
    });
  });

  describe("Additional API Tests for Paper Routes", () => {
    // POST /api/papers - Additional cases
    describe("POST /api/papers (Edge Cases & Input Validation)", () => {
      it("should return 400 if title is missing", async () => {
        const res = await request(app).post("/api/papers").send({
          publishedIn: "ICSE 2024",
          year: 2024,
          authors: samplePaper.authors,
        });
  
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
  
      it("should return 400 if year is in the future", async () => {
        const res = await request(app).post("/api/papers").send({
          ...samplePaper,
          year: new Date().getFullYear() + 10, // 未来10年
        });
  
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Year cannot be in the future");
      });
  
      it("should return 400 if authors list is empty", async () => {
        const res = await request(app).post("/api/papers").send({
          ...samplePaper,
          authors: [],
        });
  
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("At least one author is required");
      });
    });
  
    // GET /api/papers - Additional cases
    describe("GET /api/papers (Filtering & Edge Cases)", () => {
      it("should return empty list if no paper matches filter", async () => {
        const res = await request(app).get("/api/papers?year=1999");
  
        expect(res.status).toBe(200);
        expect(res.body.papers).toBeInstanceOf(Array);
        expect(res.body.papers.length).toBe(0);
      });
  
      it("should return 400 if pagination parameters are invalid", async () => {
        const res = await request(app).get("/api/papers?page=0&limit=-1");
  
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
  
      it("should return papers filtered by author name", async () => {
        const res = await request(app).get("/api/papers?author=John Doe");
  
        expect(res.status).toBe(200);
        expect(res.body.papers.length).toBeGreaterThan(0);
        res.body.papers.forEach((paper) => {
          const authorNames = paper.authors.map((a) => a.name);
          expect(authorNames).toContain("John Doe");
        });
      });
    });
  
    // GET /api/papers/:id - Invalid IDs
    describe("GET /api/papers/:id (Error Scenarios)", () => {
      it("should return 400 if ID is not a valid number", async () => {
        const res = await request(app).get("/api/papers/abcd");
  
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
    });
  
    // PUT /api/papers/:id - Additional cases
    describe("PUT /api/papers/:id (Update Validation)", () => {
      it("should return 400 if year is not a number", async () => {
        const createRes = await request(app).post("/api/papers").send(samplePaper);
        const res = await request(app)
          .put(`/api/papers/${createRes.body.id}`)
          .send({ ...samplePaper, year: "not-a-number" });
  
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
  
      it("should return 404 if trying to update a non-existent paper", async () => {
        const res = await request(app).put("/api/papers/999999").send(samplePaper);
  
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Paper not found");
      });
    });
  
    // DELETE /api/papers/:id - Invalid ID case
    describe("DELETE /api/papers/:id (Invalid ID)", () => {
      it("should return 400 if paper ID is invalid", async () => {
        const res = await request(app).delete("/api/papers/abcd");
  
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
    });
  });

  ///////新加的
  const validPaper = {
    title: "Valid Paper Title",
    publishedIn: "Conference A",
    year: 2024,
    authors: [
      {
        name: "Alice",
        email: "alice@example.com",
        affiliation: "University A"
      },
      {
        name: "Bob",
        email: "bob@example.com",
        affiliation: "University B"
      }
    ]
  };

  describe("POST /api/papers", () => {
    // 成功创建（5分）
    it("should create a new paper with valid input", async () => {
      const res = await request(app).post("/api/papers").send(validPaper);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe(validPaper.title);
    });
  
    // 错误处理和验证（15分）
    describe("Error handling and input validation", () => {
      // 缺少字段（6分）
      it("should return 400 for missing all required fields", async () => {
        const res = await request(app).post("/api/papers").send({});
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(Array.isArray(res.body.messages)).toBe(true);
      });
      // 字段未提供（2分）
      it("should return 400 when title is not provided (undefined)", async () => {
        const paper = { ...validPaper };
        delete paper.title;
        const res = await request(app).post("/api/papers").send(paper);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      // 字符串只有空格（2分）
      it("should return 400 when title is a string of only spaces", async () => {
        const paper = { ...validPaper, title: "    " };
        const res = await request(app).post("/api/papers").send(paper);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      // 字段为 null（2分）
      it("should return 400 when title is null", async () => {
        const paper = { ...validPaper, title: null };
        const res = await request(app).post("/api/papers").send(paper);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      // 无效的 year（8分）
      describe("Invalid year values", () => {
        it("should return 400 for year 1900", async () => {
          const paper = { ...validPaper, year: 1900 };
          const res = await request(app).post("/api/papers").send(paper);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
        it("should return 400 for year '1901a'", async () => {
          const paper = { ...validPaper, year: "1901a" };
          const res = await request(app).post("/api/papers").send(paper);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
        it("should return 400 for year '1901.0'", async () => {
          const paper = { ...validPaper, year: "1901.0" };
          const res = await request(app).post("/api/papers").send(paper);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
        it("should return 400 for empty string year", async () => {
          const paper = { ...validPaper, year: "" };
          const res = await request(app).post("/api/papers").send(paper);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Published year is required");
        });
      });
      // 多重验证错误（1分）
      it("should return 400 for multiple validation errors", async () => {
        const paper = {
          title: "   ",
          publishedIn: "",
          year: "1901a",
          authors: []
        };
        const res = await request(app).post("/api/papers").send(paper);
        expect(res.status).toBe(400);
        expect(res.body.messages.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  ///////新加的
  
  describe("GET /api/papers", () => {
    beforeAll(async () => {
      // 为过滤和分页测试创建数据
      await prisma.paper.deleteMany();
      await prisma.author.deleteMany();
      await request(app).post("/api/papers").send({
        title: "Paper One",
        publishedIn: "Conference A",
        year: 2021,
        authors: [{ name: "Alice", email: "alice@example.com", affiliation: "University A" }]
      });
      await request(app).post("/api/papers").send({
        title: "Paper Two",
        publishedIn: "Journal B",
        year: 2022,
        authors: [{ name: "Bob", email: "bob@example.com", affiliation: "University B" }]
      });
      await request(app).post("/api/papers").send({
        title: "Paper Three",
        publishedIn: "conference A special",
        year: 2021,
        authors: [{ name: "Charlie", email: "charlie@example.com", affiliation: "University C" }]
      });
    });
  
    // 基本检索（5分）
    it("should retrieve a list of papers", async () => {
      const res = await request(app).get("/api/papers");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.papers)).toBeTruthy();
      expect(res.body.papers.length).toBeGreaterThan(0);
    });
  
    // 筛选和分页（10分）
    describe("Filtering and pagination", () => {
      // year filter (2分)
      it("should filter papers by year", async () => {
        const res = await request(app).get("/api/papers?year=2021");
        expect(res.status).toBe(200);
        res.body.papers.forEach(paper => {
          expect(paper.year).toBe(2021);
        });
      });
      // published_in case-insensitive partial match (3分)
      it("should filter papers by publishedIn case-insensitively", async () => {
        const res = await request(app).get("/api/papers?publishedIn=conference a");
        expect(res.status).toBe(200);
        res.body.papers.forEach(paper => {
          expect(paper.publishedIn.toLowerCase()).toContain("conference a");
        });
      });
      // limit and offset (3分)
      it("should apply limit and offset correctly", async () => {
        const res = await request(app).get("/api/papers?limit=1&offset=1");
        expect(res.status).toBe(200);
        expect(res.body.papers.length).toBeLessThanOrEqual(1);
      });
      // Default limit (2分)
      it("should use default limit if not provided", async () => {
        const res = await request(app).get("/api/papers");
        expect(res.status).toBe(200);
        expect(res.body.limit).toBe(10);
      });
    });
  
    // 错误处理（20分）
    describe("Error handling for filtering", () => {
      // Invalid year (8分)
      it("should return 400 for invalid year: 1900", async () => {
        const res = await request(app).get("/api/papers?year=1900");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid year: '1901a'", async () => {
        const res = await request(app).get("/api/papers?year=1901a");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid year: '1901.1'", async () => {
        const res = await request(app).get("/api/papers?year=1901.1");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid year range: '2019-2024'", async () => {
        const res = await request(app).get("/api/papers?year=2019-2024");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      // Invalid limit (6分)
      it("should return 400 for invalid limit: '90.5'", async () => {
        const res = await request(app).get("/api/papers?limit=90.5");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid limit: '90a'", async () => {
        const res = await request(app).get("/api/papers?limit=90a");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid limit: 0", async () => {
        const res = await request(app).get("/api/papers?limit=0");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      // Invalid offset (6分)
      it("should return 400 for invalid offset: '1.5'", async () => {
        const res = await request(app).get("/api/papers?offset=1.5");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid offset: '1a'", async () => {
        const res = await request(app).get("/api/papers?offset=1a");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid offset: -1", async () => {
        const res = await request(app).get("/api/papers?offset=-1");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
    });
  });
  
  describe("GET /api/papers/:id", () => {
    let createdPaper;
    beforeAll(async () => {
      const res = await request(app).post("/api/papers").send(validPaper);
      createdPaper = res.body;
    });
  
    // Successful retrieval (4分)
    it("should retrieve a paper by valid ID", async () => {
      const res = await request(app).get(`/api/papers/${createdPaper.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdPaper.id);
    });
  
    // Error handling (6分)
    describe("Error handling for invalid IDs", () => {
      it("should return 400 for invalid id: 'abc'", async () => {
        const res = await request(app).get("/api/papers/abc");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid id: '1a'", async () => {
        const res = await request(app).get("/api/papers/1a");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 404 if paper is not found", async () => {
        const res = await request(app).get("/api/papers/99999");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Paper not found");
      });
    });
  });
  
  describe("PUT /api/papers/:id", () => {
    let createdPaper;
    beforeEach(async () => {
      const res = await request(app).post("/api/papers").send(validPaper);
      createdPaper = res.body;
    });
  
    // Successful update (5分)
    it("should update an existing paper successfully", async () => {
      const updatedPaper = {
        title: "Updated Title",
        publishedIn: "Updated Venue",
        year: 2025,
        authors: [
          { name: "Updated Author", email: "updated@example.com", affiliation: "Updated University" }
        ]
      };
      const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(updatedPaper);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(updatedPaper.title);
    });
  
    // Error handling and validation (15分)
    describe("Error handling for PUT /api/papers/:id", () => {
      // Invalid id
      it("should return 400 for invalid id: 'abc'", async () => {
        const res = await request(app).put("/api/papers/abc").send(validPaper);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid id: '1a'", async () => {
        const res = await request(app).put("/api/papers/1a").send(validPaper);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      // 缺少字段：missing fields, not provided, string of only spaces, null
      it("should return 400 for missing title field", async () => {
        const paperData = { ...validPaper };
        delete paperData.title;
        const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      it("should return 400 for title as only spaces", async () => {
        const paperData = { ...validPaper, title: "   " };
        const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      it("should return 400 for title as null", async () => {
        const paperData = { ...validPaper, title: null };
        const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
        expect(res.status).toBe(400);
        expect(res.body.messages).toContain("Title is required");
      });
      // Invalid year for update
      describe("Invalid year values in update", () => {
        it("should return 400 for year 1900", async () => {
          const paperData = { ...validPaper, year: 1900 };
          const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
        it("should return 400 for year '1901a'", async () => {
          const paperData = { ...validPaper, year: "1901a" };
          const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
        it("should return 400 for year '1901.1'", async () => {
          const paperData = { ...validPaper, year: "1901.1" };
          const res = await request(app).put(`/api/papers/${createdPaper.id}`).send(paperData);
          expect(res.status).toBe(400);
          expect(res.body.messages).toContain("Valid year after 1900 is required");
        });
      });
      // Not found error
      it("should return 404 when updating a non-existent paper", async () => {
        const res = await request(app).put("/api/papers/99999").send(validPaper);
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Paper not found");
      });
    });
  });
  
  describe("DELETE /api/papers/:id", () => {
    let createdPaper;
    beforeEach(async () => {
      const res = await request(app).post("/api/papers").send(validPaper);
      createdPaper = res.body;
    });
  
    // Successful deletion (4分)
    it("should delete an existing paper successfully", async () => {
      const res = await request(app).delete(`/api/papers/${createdPaper.id}`);
      expect(res.status).toBe(204);
  
      // 验证删除
      const getRes = await request(app).get(`/api/papers/${createdPaper.id}`);
      expect(getRes.status).toBe(404);
    });
  
    // Error handling (6分)
    describe("Error handling for DELETE /api/papers/:id", () => {
      it("should return 400 for invalid id: 'abc'", async () => {
        const res = await request(app).delete("/api/papers/abc");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 400 for invalid id: '1a'", async () => {
        const res = await request(app).delete("/api/papers/1a");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
      });
      it("should return 404 if paper is not found", async () => {
        const res = await request(app).delete("/api/papers/99999");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Paper not found");
      });
    });
  });
  


});

