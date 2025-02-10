const request = require("supertest");
const app = require("../src/server");
const { db } = require("../src/database");



// Clean up before all tests
beforeAll(async () => {
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM papers", (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

describe('Papers API Tests', () => {
  // POST /api/papers
  describe('POST /api/papers', () => {
    it('should return validation error for missing fields', async () => {
      const res = await request(app).post('/api/papers').send({
        authors: 'John Doe',
        published_in: 'ICSE 2024'
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: 'Validation Error',
        messages: [
          'Title is required',
          'Published year is required'
        ]
      });
    });

    it('should return validation error for invalid year', async () => {
      const res = await request(app).post('/api/papers').send({
        title: 'Invalid Year Paper',
        authors: 'John Doe, Jane Smith',
        published_in: 'ICSE 2024',
        year: 1899
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: 'Validation Error',
        messages: ['Valid year after 1900 is required']
      });
    });

    it('should create a paper successfully with valid input', async () => {
      const res = await request(app).post('/api/papers').send({
        title: 'Valid Paper Title',
        authors: 'John Doe, Jane Smith',
        published_in: 'ACM SIGMOD',
        year: 2023
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Valid Paper Title',
        authors: 'John Doe, Jane Smith',
        published_in: 'ACM SIGMOD',
        year: 2023
      });
    });
  });

  // GET /api/papers
  describe('GET /api/papers', () => {
    it('should fetch all papers successfully', async () => {
      const res = await request(app).get('/api/papers');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('should return validation error for invalid query parameter', async () => {
      const res = await request(app).get('/api/papers?year=invalidYear');
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        error: 'Validation Error',
        message: 'Invalid query parameter format'
      });
    });
  });

  // PUT /api/papers/:id
  describe('PUT /api/papers/:id', () => {
    it('should return 404 for updating a non-existent paper', async () => {
      const res = await request(app).put('/api/papers/999').send({
        title: 'Updated Title',
        authors: 'Jane Doe',
        published_in: 'IEEE',
        year: 2024
      });
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        error: 'Paper not found'
      });
    });

    it('should update a paper successfully', async () => {
      const createRes = await request(app).post('/api/papers').send({
        title: 'Paper to Update',
        authors: 'John Smith',
        published_in: 'IEEE Transactions',
        year: 2022
      });
      const paperId = createRes.body.id;

      const res = await request(app).put(`/api/papers/${paperId}`).send({
        title: 'Updated Paper Title',
        authors: 'Jane Doe, John Smith',
        published_in: 'IEEE Transactions',
        year: 2025
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({
        title: 'Updated Paper Title',
        authors: 'Jane Doe, John Smith',
        published_in: 'IEEE Transactions',
        year: 2025
      });
    });
  });

  // DELETE /api/papers/:id
  describe('DELETE /api/papers/:id', () => {
    it('should return 404 for deleting a non-existent paper', async () => {
      const res = await request(app).delete('/api/papers/999');
      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        error: 'Paper not found'
      });
    });

    it('should delete a paper successfully', async () => {
      const createRes = await request(app).post('/api/papers').send({
        title: 'Paper to Delete',
        authors: 'John Smith',
        published_in: 'ACM SIGMOD',
        year: 2023
      });
      const paperId = createRes.body.id;

      const res = await request(app).delete(`/api/papers/${paperId}`);
      expect(res.statusCode).toBe(204);
    });
  });
});
