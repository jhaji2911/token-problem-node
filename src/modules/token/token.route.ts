import { FastifyInstance } from "fastify";
import { $ref } from "./token.schema";
import {
  createToken,
  assignToken,
  deleteToken,
  keepAlive,
  unblockToken,
} from "./token.controller";

export const tokenRoutes = async (app: FastifyInstance) => {
  app.post(
    "/generate-token",
    {
      schema: {
        body: $ref("createTokenSchema"),
      },
    },
    createToken
  );

  app.post(
    "/assign-token",
    {
      schema: {
        body: $ref("assignTokenSchema"),
      },
    },
    assignToken
  );

  app.post(
    "/unblock-token",
    {
      schema: {
        body: $ref("unblockTokenSchema"),
      },
    },
    unblockToken
  );

  app.delete(
    "/delete-token",
    {
      schema: {
        body: $ref("deleteTokenSchema"),
      },
    },
    deleteToken
  );

  app.post(
    "/keep-alive",
    {
      schema: {
        body: $ref("keepAliveSchema"),
      },
    },
    keepAlive
  );

  app.log.info("⚙️ Token route registered");
};
