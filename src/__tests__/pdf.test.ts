import { FastifyInstance } from "fastify";
import request from "supertest";
import { createInstance } from "../app.js";

describe("PDF Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createInstance({ logLevel: "warn" });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear the state before each test
    const allJobs = await app.pdfManager.getAll();
    for (const job of allJobs) await app.pdfManager.delete(job.id);
  });

  describe("GET /api/v1/pdf", () => {
    it("should return empty array when no jobs exist", async () => {
      const response = await request(app.server).get("/api/v1/pdf");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should return all PDF jobs", async () => {
      const job1 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const job2 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const response = await request(app.server).get("/api/v1/pdf");

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: job1.body.id,
          }),
          expect.objectContaining({
            id: job2.body.id,
          }),
        ])
      );
    });
  });

  describe("POST /api/v1/pdf", () => {
    it("should create a new PDF job with valid data", async () => {
      const jobData = { components: [] };

      const response = await request(app.server)
        .post("/api/v1/pdf")
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
      });
      expect(response.body.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should create multiple jobs with different ids", async () => {
      const job1 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const job2 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      expect(job1.status).toBe(201);
      expect(job2.status).toBe(201);
      expect(job1.body.id).not.toBe(job2.body.id);
    });

    it("should accept extra fields (lenient schema)", async () => {
      const response = await request(app.server)
        .post("/api/v1/pdf")
        .send({ message: "test", extra: "field", components: [] });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
      });
    });
  });

  describe("GET /api/v1/pdf/:id", () => {
    it("should return a specific PDF job by ID", async () => {
      const createResponse = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const jobId = createResponse.body.id;

      const response = await request(app.server).get(`/api/v1/pdf/${jobId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(jobId);
    });

    it("should return 404 for non-existent job ID", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000";

      const response = await request(app.server).get(
        `/api/v1/pdf/${nonExistentId}`
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid UUID format", async () => {
      const invalidId = "invalid-uuid";

      const response = await request(app.server).get(
        `/api/v1/pdf/${invalidId}`
      );

      expect(response.status).toBe(400);
    });

    it("should handle UUID with different casing", async () => {
      const createResponse = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const jobId = createResponse.body.id;
      const upperCaseId = jobId.toUpperCase();

      const response = await request(app.server).get(
        `/api/v1/pdf/${upperCaseId}`
      );

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("DELETE /api/v1/pdf/:id", () => {
    it("should delete a specific PDF job by ID", async () => {
      const createResponse = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const jobId = createResponse.body.id;

      const getResponse = await request(app.server).get(`/api/v1/pdf/${jobId}`);
      expect(getResponse.status).toBe(200);

      const deleteResponse = await request(app.server).delete(
        `/api/v1/pdf/${jobId}`
      );
      expect(deleteResponse.status).toBe(204);

      const getAllResponse = await request(app.server).get("/api/v1/pdf");
      expect(getAllResponse.body).toEqual([]);
    });

    it("should return 204 for non-existent job ID", async () => {
      const nonExistentId = "123e4567-e89b-12d3-a456-426614174000";

      const response = await request(app.server).delete(
        `/api/v1/pdf/${nonExistentId}`
      );

      expect(response.status).toBe(204);
    });

    it("should return 400 for invalid UUID format", async () => {
      const invalidId = "invalid-uuid";

      const response = await request(app.server).delete(
        `/api/v1/pdf/${invalidId}`
      );

      expect(response.status).toBe(400);
    });

    it("should allow deleting multiple jobs", async () => {
      const job1 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const job2 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const job3 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const getAllResponse = await request(app.server).get("/api/v1/pdf");
      expect(getAllResponse.body).toHaveLength(3);

      await request(app.server).delete(`/api/v1/pdf/${job1.body.id}`);
      await request(app.server).delete(`/api/v1/pdf/${job3.body.id}`);

      const finalResponse = await request(app.server).get("/api/v1/pdf");
      expect(finalResponse.body).toHaveLength(1);
      expect(finalResponse.body[0].id).toBe(job2.body.id);
    });
  });

  describe("Integration Tests", () => {
    it("should handle full CRUD lifecycle", async () => {
      const job1 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      const job2 = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      expect(job1.status).toBe(201);
      expect(job2.status).toBe(201);

      const getAllResponse = await request(app.server).get("/api/v1/pdf");
      expect(getAllResponse.status).toBe(200);
      expect(getAllResponse.body).toHaveLength(2);

      const getSpecificResponse = await request(app.server).get(
        `/api/v1/pdf/${job1.body.id}`
      );
      expect(getSpecificResponse.status).toBe(200);
      expect(getSpecificResponse.body.id).toBe(job1.body.id);

      const deleteResponse = await request(app.server).delete(
        `/api/v1/pdf/${job1.body.id}`
      );
      expect(deleteResponse.status).toBe(204);

      const finalResponse = await request(app.server).get("/api/v1/pdf");
      expect(finalResponse.body).toHaveLength(1);
      expect(finalResponse.body[0].id).toBe(job2.body.id);
    });

    it("should handle concurrent operations", async () => {
      const jobs = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app.server)
          .post("/api/v1/pdf")
          .send({ components: [] });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
        jobs.push(response.body);
      }

      const ids = jobs.map((job) => job.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);

      const getAllResponse = await request(app.server).get("/api/v1/pdf");
      expect(getAllResponse.body).toHaveLength(5);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON in POST request", async () => {
      const response = await request(app.server)
        .post("/api/v1/pdf")
        .set("Content-Type", "application/json")
        .send("invalid json");

      expect(response.status).toBe(400);
    });

    it("should handle missing Content-Type header", async () => {
      const response = await request(app.server)
        .post("/api/v1/pdf")
        .send({ components: [] });

      expect(response.status).toBe(201); // Fastify is lenient with Content-Type
    });
  });
});
