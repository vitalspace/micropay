import { describe, it, expect, mock } from "bun:test";
import { createUser, updateUser, profile } from "../controllers/user.controller";
import User from "../models/user.model.js";

// Mock User model
mock.module("../models/user.model.js", () => ({
  default: class MockUser {
    constructor(data: any) {
      Object.assign(this, data);
      (this as any).avatar = (this as any).avatar || "";
      (this as any).nickname = (this as any).nickname || "";
      (this as any).bio = (this as any).bio || "";
      (this as any).save = mock(() => Promise.resolve());
    }
    static findOne = mock();
    static findByIdAndUpdate = mock();
  },
}));

describe("createUser", () => {
  it("should create a new user successfully", async () => {
    const mockUser = { address: "0x123", avatar: "", nickname: "", bio: "" };
    const ctx = {
      body: { address: "0x123" },
      set: { status: 200 },
    } as any;

    // Mock findOne to return null (user doesn't exist)
    (User as any).findOne.mockResolvedValue(null);

    const result = await createUser(ctx);

    expect(ctx.set.status).toBe(201);
    expect(result).toBe(JSON.stringify(mockUser));
  });
});

describe("updateUser", () => {
  it("should update user successfully", async () => {
    const updatedUser = { address: "0x123", avatar: "new", nickname: "nick", bio: "bio" };
    const ctx = {
      body: { address: "0x123", avatar: "new", nickname: "nick", bio: "bio" },
      set: { status: 200 },
    } as any;

    (User as any).findByIdAndUpdate.mockResolvedValue(updatedUser);

    const result = await updateUser(ctx);

    expect(ctx.set.status).toBe(200);
    expect(result).toBe(JSON.stringify(updatedUser));
  });
});
