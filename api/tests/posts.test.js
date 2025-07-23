const request = require("supertest");
const app = require("../index");
const { generateToken } = require("../utils/jwt");

describe("DELETE /posts/:id", () => {
  // Generate tokens for test users
  const adminToken = generateToken({ id: "u2", role: "admin" });
  const userToken = generateToken({ id: "u1", role: "user" });

  // Test: Admin should be able to delete a post
  it("should allow admin to delete a post", async () => {
    const res = await request(app)
      .delete("/posts/p1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "Post p1 deleted." });
  });

  // Test: Regular user should not be allowed to delete a post
  it("should forbid normal user from deleting a post", async () => {
    const res = await request(app)
      .delete("/posts/123")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  // Test: Requests without a token should be rejected
  it("should reject missing or invalid token", async () => {
    const res = await request(app).delete("/posts/123");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
