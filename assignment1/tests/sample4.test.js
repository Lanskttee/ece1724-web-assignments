const request = require("supertest");
const app = require("../src/server");
const { db } = require("../src/database");

const samplePaper = {
  title: "Sample Paper Title",
  authors: "John Doe, Jane Smith",
  published_in: "ICSE 2024",
  year: 2024,
};

// ISO 8601 时间戳正则表达式
const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// 清理数据库（测试前）
beforeAll(async () => {
  await new Promise((resolve, reject) => {
    db.run("DELETE FROM papers", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

// 关闭数据库（测试后）
afterAll(async () => {
  await new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

describe("Paper Management API Tests", () => {
  // 测试创建论文 API
  describe("POST /api/papers", () => {
    it("should create a new paper with valid timestamps", async () => {
      const res = await request(app).post("/api/papers").send(samplePaper);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: samplePaper.title,
        authors: samplePaper.authors,
        published_in: samplePaper.published_in,
        year: samplePaper.year,
      });
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("created_at");
      expect(res.body).toHaveProperty("updated_at");
      expect(res.body.created_at).toMatch(iso8601Regex);
      expect(res.body.updated_at).toMatch(iso8601Regex);
    });

    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/api/papers").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Validation Error");
      expect(res.body.messages).toEqual([
        "Title is required",
        "Authors are required",
        "Published venue is required",
        "Published year is required",
      ]);
    });
  });

  // 测试获取论文 API
  describe("GET /api/papers", () => {
    it("should retrieve a list of papers and check timestamps", async () => {
      const res = await request(app).get("/api/papers");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();

      res.body.forEach((paper) => {
        expect(paper).toHaveProperty("created_at");
        expect(paper).toHaveProperty("updated_at");
        expect(paper.created_at).toMatch(iso8601Regex);
        expect(paper.updated_at).toMatch(iso8601Regex);
      });
    });
  });

  // 测试获取单篇论文 API
  describe("GET /api/papers/:id", () => {
    it("should retrieve a paper by ID and check timestamps", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app).get(`/api/papers/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(createRes.body);
      expect(res.body.created_at).toMatch(iso8601Regex);
      expect(res.body.updated_at).toMatch(iso8601Regex);
    });
  });

  // 测试更新论文 API
  describe("PUT /api/papers/:id", () => {
    it("should update an existing paper and check updated timestamp", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const updatedPaper = { ...samplePaper, title: "Updated Title" };
      const res = await request(app)
        .put(`/api/papers/${createRes.body.id}`)
        .send(updatedPaper);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updatedPaper);
      expect(res.body).toHaveProperty("updated_at");
      expect(res.body.updated_at).toMatch(iso8601Regex);
    });
  });

  // 测试删除论文 API
  describe("DELETE /api/papers/:id", () => {
    it("should delete a paper by ID", async () => {
      const createRes = await request(app).post("/api/papers").send(samplePaper);
      const res = await request(app).delete(`/api/papers/${createRes.body.id}`);

      expect(res.status).toBe(204);

      // 确保删除后无法找到该论文
      const getRes = await request(app).get(`/api/papers/${createRes.body.id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
