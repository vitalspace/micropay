import { Elysia, t } from "elysia";
import {
  createMessage,
  getConversation,
  getUserMessages,
} from "../controllers/message.controller";
export const messageRoutes = new Elysia({
  detail: {
    tags: ["Message"],
  },
})
  .post("/messages", createMessage, {
    body: t.Object({
      sender_address: t.String({
        minLength: 1,
        maxLength: 100,
      }),
      receiver_address: t.String({
        minLength: 1,
        maxLength: 100,
      }),
      campaign_id: t.Optional(t.Number()),
      message: t.String({
        minLength: 1,
        maxLength: 256,
      }),
      subject: t.Optional(t.String()),
    }),
  })
  .get("/messages/user", getUserMessages, {
    query: t.Object({
      address: t.String({
        minLength: 1,
      }),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  })
  .get("/messages/conversation/:userAddress/:otherAddress", getConversation, {
    params: t.Object({
      userAddress: t.String({
        minLength: 1,
      }),
      otherAddress: t.String({
        minLength: 1,
      }),
    }),
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      campaign_id: t.Optional(t.String()),
    }),
  });
