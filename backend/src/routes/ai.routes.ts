import { Elysia, t } from "elysia";

import { improveService, analyzeService } from "../controllers/ai.controller";

export const aiRoutes = new Elysia({
  detail: {
    tags: ["AI"],
  },
}).post("/improve", improveService, {
  body: t.Object({
    field: t.Union([t.Literal("name"), t.Literal("description")]),
    context: t.String({ minLength: 10, maxLength: 1000 }),
    currentValue: t.String({ minLength: 1, maxLength: 1000 }),
  }),
}).post("/analyze-service", analyzeService, {
  body: t.Object({
    services: t.Array(t.Object({
      name: t.String({ minLength: 1, maxLength: 256 }),
      description: t.String({ minLength: 1, maxLength: 1000 }),
      service_type: t.String(),
      amount: t.String(),
      total_raised: t.String(),
      supporter_count: t.Number(),
      is_active: t.Boolean(),
    })),
  }),
});
