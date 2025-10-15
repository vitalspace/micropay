import { describe, it, expect, mock } from "bun:test";
import { createService } from "../controllers/services.controller";
import Service from "../models/services.model.js";
import User from "../models/user.model.js";

// Mock User model
mock.module("../models/user.model.js", () => ({
  default: class MockUser {
    static findOne = mock();
  },
}));

// Mock Service model
const mockSave = mock(() => Promise.resolve());
mock.module("../models/services.model.js", () => ({
  default: class MockService {
    save = mockSave;
    constructor(data: any) {
      Object.assign(this, data);
    }
  },
}));

describe("createService", () => {
  it("should create a service successfully", async () => {
    const ctx = {
      body: {
        type: "donation",
        name: "Test Service",
        description: "Test description",
        goal: 100,
        price: 50,
        image: "image.jpg",
        createdBy: "0x123",
      },
      set: { status: 200 },
    } as any;

    // Mock user found
    (User as any).findOne.mockResolvedValue({ _id: "userId", address: "0x123" });

    const result = await createService(ctx);

    expect(ctx.set.status).toBe(201);
    expect(result.message).toBe("Service created successfully");
  });

  it("should return 400 for missing required fields", async () => {
    const ctx = {
      body: {
        type: "donation",
        // missing name
        description: "Test description",
        image: "image.jpg",
        createdBy: "0x123",
      },
      set: { status: 200 },
    } as any;

    const result = await createService(ctx);

    expect(ctx.set.status).toBe(400);
    expect(result.message).toBe("Missing required fields");
  });

  it("should return 400 for invalid service type", async () => {
    const ctx = {
      body: {
        type: "invalid",
        name: "Test Service",
        description: "Test description",
        image: "image.jpg",
        createdBy: "0x123",
      },
      set: { status: 200 },
    } as any;

    const result = await createService(ctx);

    expect(ctx.set.status).toBe(400);
    expect(result.message).toBe("Invalid service type");
  });

  it("should return 404 if user not found", async () => {
    const ctx = {
      body: {
        type: "donation",
        name: "Test Service",
        description: "Test description",
        image: "image.jpg",
        createdBy: "0x123",
      },
      set: { status: 200 },
    } as any;

    // Mock user not found
    (User as any).findOne.mockResolvedValue(null);

    const result = await createService(ctx);

    expect(ctx.set.status).toBe(404);
    expect(result.message).toBe("User not found");
  });

  it("should return 500 on internal error", async () => {
    const ctx = {
      body: {
        type: "donation",
        name: "Test Service",
        description: "Test description",
        image: "image.jpg",
        createdBy: "0x123",
      },
      set: { status: 200 },
    } as any;

    // Mock user found
    (User as any).findOne.mockResolvedValue({ _id: "userId", address: "0x123" });
    // Mock save to throw error
    mockSave.mockRejectedValueOnce(new Error("Save failed"));

    const result = await createService(ctx);

    expect(ctx.set.status).toBe(500);
    expect(result.message).toBe("internal server error");
  });
});