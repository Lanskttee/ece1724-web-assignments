const request = require("supertest");
const app = require("../src/server");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sampleAuthor = {
  name: "John Doe",
  email: "john.doe@example.com",
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

describe("API Tests for Author Routes", () => {
  // POST /api/authors
  describe("POST /api/authors", () => {
    it("should create a new author with valid input", async () => {
      const res = await request(app).post("/api/authors").send(sampleAuthor);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(sampleAuthor);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("createdAt");
      expect(res.body).toHaveProperty("updatedAt");
      expect(res.body).toHaveProperty("papers");
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/authors").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual(["Name is required"]);
    });
  });

  // GET /api/authors
  describe("GET /api/authors", () => {
    it("should retrieve a list of authors with correct response structure", async () => {
      const res = await request(app).get("/api/authors");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("authors");
      expect(res.body).toHaveProperty("total");
      expect(res.body).toHaveProperty("limit");
      expect(res.body).toHaveProperty("offset");

      expect(Array.isArray(res.body.authors)).toBeTruthy();
      expect(typeof res.body.total).toBe("number");
      expect(typeof res.body.limit).toBe("number");
      expect(typeof res.body.offset).toBe("number");
    });

    it("should filter authors by case-insensitive partial name match", async () => {
      const res = await request(app).get("/api/authors?name=jOh");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("authors");
      expect(Array.isArray(res.body.authors)).toBeTruthy();
      expect(res.body.authors.length).toBeGreaterThan(0);

      // Verify that all returned authors contain "jOh" (case-insensitive) in their name
      res.body.authors.forEach((author) => {
        expect(author.name.toLowerCase()).toContain("joh");
      });
    });
  });

  // GET /api/authors/:id
  describe("GET /api/authors/:id", () => {
    it("should retrieve an author by ID", async () => {
      const createRes = await request(app)
        .post("/api/authors")
        .send(sampleAuthor);
      const res = await request(app).get(`/api/authors/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(createRes.body);
    });

    it("should return 404 if author is not found", async () => {
      const res = await request(app).get("/api/authors/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Author not found");
    });
  });

  // PUT /api/authors/:id
  describe("PUT /api/authors/:id", () => {
    it("should update an existing author", async () => {
      const createRes = await request(app)
        .post("/api/authors")
        .send(sampleAuthor);
      const updatedAuthor = {
        name: "Updated Author",
        email: "updated.author@example.com",
        affiliation: "Updated University",
      };
      const res = await request(app)
        .put(`/api/authors/${createRes.body.id}`)
        .send(updatedAuthor);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updatedAuthor);
      expect(res.body).toHaveProperty("updatedAt");
    });

    it("should return 404 if author is not found", async () => {
      const res = await request(app)
        .put("/api/authors/99999")
        .send(sampleAuthor);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Author not found");
    });
  });

  // DELETE /api/authors/:id
  describe("DELETE /api/authors/:id", () => {
    it("should delete an author by ID", async () => {
      const createRes = await request(app)
        .post("/api/authors")
        .send(sampleAuthor);
      const res = await request(app).delete(
        `/api/authors/${createRes.body.id}`
      );

      expect(res.status).toBe(204);

      const getRes = await request(app).get(
        `/api/authors/${createRes.body.id}`
      );
      expect(getRes.status).toBe(404);
    });

    it("should return 404 if author is not found", async () => {
      const res = await request(app).delete("/api/authors/99999");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Author not found");
    });
  });

  describe("Additional API Tests for Author Routes", () => {
    // GET /api/authors - Query Parameter Validation & Pagination
    describe("GET /api/authors - Query Parameter Validation & Pagination", () => {
      it("should return 400 if 'name' is provided as an empty string", async () => {
        const res = await request(app).get("/api/authors?name=");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid query parameter format");
      });
  
      it("should return 400 if 'affiliation' is provided as an empty string", async () => {
        const res = await request(app).get("/api/authors?affiliation=");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid query parameter format");
      });
  
      it("should return 400 if limit is not a positive integer", async () => {
        const res = await request(app).get("/api/authors?limit=-5");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid query parameter format");
      });
  
      it("should return 400 if offset is negative", async () => {
        const res = await request(app).get("/api/authors?offset=-10");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid query parameter format");
      });
  
      it("should use default pagination values if limit/offset not provided", async () => {
        const res = await request(app).get("/api/authors");
        expect(res.status).toBe(200);
        // 默认值 limit 10, offset 0
        expect(res.body.limit).toBe(10);
        expect(res.body.offset).toBe(0);
      });
  
      it("should limit results correctly when a valid limit is provided", async () => {
        // 假设数据库中至少存在 2 条数据
        const res = await request(app).get("/api/authors?limit=2");
        expect(res.status).toBe(200);
        expect(res.body.authors.length).toBeLessThanOrEqual(2);
      });
    });
  
    // GET /api/authors - Filtering Combinations
    describe("GET /api/authors - Filtering Combinations", () => {
      beforeAll(async () => {
        // 为了过滤测试，创建两个不同属性的作者
        await request(app).post("/api/authors").send({
          name: "Alice Wonderland",
          email: "alice@example.com",
          affiliation: "Wonderland University"
        });
        await request(app).post("/api/authors").send({
          name: "Bob Builder",
          email: "bob@example.com",
          affiliation: "Builder Institute"
        });
      });
  
      it("should filter authors by name and affiliation using AND logic", async () => {
        const res = await request(app).get("/api/authors?name=Alice&affiliation=Wonderland");
        expect(res.status).toBe(200);
        expect(res.body.authors.length).toBeGreaterThan(0);
        res.body.authors.forEach(author => {
          expect(author.name.toLowerCase()).toContain("alice");
          expect(author.affiliation.toLowerCase()).toContain("wonderland");
        });
      });
  
      it("should return an empty array if no authors match the filters", async () => {
        const res = await request(app).get("/api/authors?name=NonExistent&affiliation=NoWhere");
        expect(res.status).toBe(200);
        expect(res.body.authors).toEqual([]);
        expect(res.body.total).toBe(0);
      });
    });
  
    // GET /api/authors/:id - ID Validation
    describe("GET /api/authors/:id - ID Validation", () => {
      it("should return 400 for an invalid ID format (non-numeric)", async () => {
        const res = await request(app).get("/api/authors/abc");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid ID format");
      });
  
      it("should return 400 for a non-positive ID", async () => {
        const res = await request(app).get("/api/authors/0");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid ID format");
      });
    });
  
    // PUT /api/authors/:id - Update Author Validation
    describe("PUT /api/authors/:id - Update Author Validation", () => {
      let authorId;
      beforeAll(async () => {
        const createRes = await request(app).post("/api/authors").send({
          name: "Charlie Chaplin",
          email: "charlie@example.com",
          affiliation: "Silent Films University"
        });
        authorId = createRes.body.id;
      });
  
      it("should return 400 if 'name' is missing in the update", async () => {
        const res = await request(app)
          .put(`/api/authors/${authorId}`)
          .send({
            email: "updated@example.com",
            affiliation: "New Affiliation"
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.messages).toContain("Name is required");
      });
  
      it("should return 400 for invalid ID before checking update body", async () => {
        const res = await request(app)
          .put("/api/authors/abc")
          .send({
            name: "Updated Name",
            email: "updated@example.com",
            affiliation: "New Affiliation"
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid ID format");
      });
    });
  
    // DELETE /api/authors/:id - Deletion Constraints & Error Conditions
    describe("DELETE /api/authors/:id - Deletion Constraints & Error Conditions", () => {
      let soleAuthorId;
      beforeAll(async () => {
        // 创建一个仅有该作者的论文，用来测试删除约束
        const authorRes = await request(app).post("/api/authors").send({
          name: "Sole Author",
          email: "sole@example.com",
          affiliation: "Solo University"
        });
        soleAuthorId = authorRes.body.id;
        await request(app).post("/api/papers").send({
          title: "Sole Author Paper",
          publishedIn: "Solo Conference",
          year: 2023,
          authors: [
            {
              name: "Sole Author",
              email: "sole@example.com",
              affiliation: "Solo University"
            }
          ]
        });
      });
  
      it("should return 400 when trying to delete an author who is the only author of a paper", async () => {
        const res = await request(app).delete(`/api/authors/${soleAuthorId}`);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Constraint Error");
        expect(res.body.message).toBe("Cannot delete author: they are the only author of one or more papers");
      });
  
      it("should return 400 for invalid ID format in DELETE request", async () => {
        const res = await request(app).delete("/api/authors/invalid-id");
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("Validation Error");
        expect(res.body.message).toBe("Invalid ID format");
      });
  
      it("should return 404 when trying to delete a non-existent author", async () => {
        const res = await request(app).delete("/api/authors/99999");
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("Author not found");
      });
    });
  });
  
});