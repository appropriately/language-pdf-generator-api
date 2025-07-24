import { FastifyInstance } from "fastify";
import request from "supertest";
import createInstance from "../app.js";

describe("Template Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createInstance({ logLevel: "fatal" });
  });

  afterAll(async () => await app.close());

  describe("GET /api/v1/template", () => {
    it("should return all templates", async () => {
      const response = await request(app.server).get("/api/v1/template");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("should should successfully create and return a template", async () => {
      const job = await request(app.server).post("/api/v1/template").send({
        name: "Test Template",
        description: "Test Description",
      });

      const response = await request(app.server).get("/api/v1/template");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: job.body.id,
          }),
        ])
      );
    });
  });

  describe("POST /api/v1/template", () => {
    it("should return 400 if name is missing", async () => {
      const response = await request(app.server).post("/api/v1/template").send({
        description: "Test Description",
      });
      expect(response.status).toBe(400);
    });
  });
});
