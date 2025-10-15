import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import db from "./db/db";
import { aiRoutes } from "./routes/ai.routes";
import { messageRoutes } from "./routes/message.routes";
import { serviceRoutes } from "./routes/services.routes";
import { userRoutes } from "./routes/user.routes";

const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.ALLOW_ORIGIN || process.env.ALLOW_ORIGIN2;

db();
const app = new Elysia()
  .use(
    cors({
      origin: ORIGIN,
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
  .group("/api/v1", (app) =>
    app.use(userRoutes).use(aiRoutes).use(serviceRoutes).use(messageRoutes)
  )
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
