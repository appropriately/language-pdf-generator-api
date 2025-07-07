import { FastifyInstance } from "fastify";
import request from "supertest";
import { createInstance } from "../app.js";

describe("Base Endpoints", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createInstance({ logLevel: "warn" });
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return API info for root endpoint", async () => {
    const response = await request(app.server).get("/api/v1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("version");
    expect(response.body.version).toBe(process.env.npm_package_version);
  });

  it("should return 404 for non-existent route", async () => {
    const response = await request(app.server).get("/non-existent");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });
});
