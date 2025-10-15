import { Elysia, t } from "elysia";

import { createService } from "../controllers/services.controller";
export const serviceRoutes = new Elysia({
  detail: {
    tags: ["Service"],
  },
}).post("/create", createService, {
  body: t.Object({
    type: t.Union([
      t.Literal("donation"),
      t.Literal("business"),
      t.Literal("product"),
    ]),
    name: t.String({ minLength: 2, maxLength: 100 }),
    description: t.String({ minLength: 10, maxLength: 256 }),
    goal: t.Optional(t.Number({ minimum: 0 })),
    price: t.Optional(t.Number({ minimum: 0 })),
    image: t.Optional(t.String()),
    createdBy: t.String({ minLength: 66, maxLength: 66 }),
  }),
});
