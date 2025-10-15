import { describe, it, expect, mock } from "bun:test";
import { improveService } from "../controllers/ai.controller";

// Mock Cerebras
mock.module("@cerebras/cerebras_cloud_sdk", () => ({
  default: class {
    chat = {
      completions: {
        create: mock(() => ({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: "Improved" } }] };
            yield { choices: [{ delta: { content: " text" } }] };
          },
        })),
      },
    };
  },
}));

describe("improveService", () => {
  it("should return error for missing fields", async () => {
    const ctx = {
      body: {},
      set: { status: 200 },
    } as any;

    const result = await improveService(ctx);

    expect(ctx.set.status).toBe(400);
    expect(result.message).toBe("Missing required fields: field, context, currentValue");
  });

  it("should return error for invalid field", async () => {
    const ctx = {
      body: { field: "invalid", context: "ctx", currentValue: "val" },
      set: { status: 200 },
    } as any;

    const result = await improveService(ctx);

    expect(ctx.set.status).toBe(400);
    expect(result.message).toBe("Invalid field. Must be 'name' or 'description'");
  });

  it("should improve text successfully", async () => {
    const ctx = {
      body: { field: "name", context: "campaign context", currentValue: "old name" },
      set: { status: 200 },
    } as any;

    const result = await improveService(ctx);

    expect(ctx.set.status).toBe(200);
    expect(result.improvedText).toBe("Improved text");
  });
});