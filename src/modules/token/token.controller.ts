import { FastifyRequest, FastifyReply } from "fastify";
import { TCreateToken, TGeneralToken } from "./token.schema";
import { v4 as uuidv4 } from "uuid";
import { TOKEN_PREFIX } from "../..//utils/constants";

const generateTokenKey = (tokenId: string) => `${TOKEN_PREFIX}${tokenId}`;

// Controller to create tokens
export const createToken = async (
  req: FastifyRequest<{
    Body: TCreateToken;
  }>,
  reply: FastifyReply
) => {
  try {
    const { count } = req.body;
    const client = req.redis; // Access the Redis client from req

    if (!client) {
      throw new Error("Redis client is not available");
    }

    const tokens: string[] = [];
    for (let i = 0; i < count; i++) {
      const tokenId = uuidv4();
      await client.set(generateTokenKey(tokenId), "free"); // Correct usage of Redis set
      tokens.push(tokenId);
    }

    reply.send({ message: `${count} tokens created`, tokens });
  } catch (err) {
    reply.internalServerError(err.message || "Internal Server Error");
  }
};

// assignToken function rewritten with fixes
export const assignToken = async (
  req: FastifyRequest<{
    Body: TGeneralToken;
  }>,
  reply: FastifyReply
) => {
  try {
    const client = req.redis;
    const { tokenId } = req.body;

    if (!client) {
      throw new Error("Redis client is not available");
    }

    // If no tokenId is provided, assign a random free token
    if (!tokenId) {
      const tokenKeys = await client.keys(`${TOKEN_PREFIX}*`);
      if (tokenKeys.length === 0) {
        reply.status(404).send({ error: "No tokens available" });
        return;
      }
      console.log('keys=>',tokenKeys)

      // Shuffle and assign random free token
      const shuffledTokenKeys = tokenKeys.sort(() => 0.5 - Math.random());

      console.log('shuffled->',shuffledTokenKeys)
      let assignedToken: string | null = null;

      for (const key of shuffledTokenKeys) {
        const status = await client.get(key);
        console.log('status=>', status)
      if (status === "free") {
          assignedToken = key.replace(TOKEN_PREFIX, ""); // Extract tokenId from the key
        await client.set(key, "assigned", "EX", 60); // Assign the token and set expiration for 60s
          break;
      }
    }

      if (assignedToken) {
        reply.send({ message: `Token ${assignedToken} assigned` });
      } else {
        reply.status(404).send({ error: "No free token available" });
  }
    } else {
      // Check the status of the provided tokenId
      const tokenKey = generateTokenKey(tokenId);
      const status = await client.get(tokenKey);

      if (status === "assigned") {
        reply.status(400).send({ error: `Token ${tokenId} is already assigned` });
        return;
      }

      if (status === "free") {
        await client.set(tokenKey, "assigned", { EX: 60 }); // Assign the token and set expiration for 60s
        reply.send({ message: `Token ${tokenId} assigned` });
      } else {
        reply.status(404).send({ error: `Token ${tokenId} does not exist or is not free` });
      }
    }
  } catch (err) {
    reply.internalServerError(err.message || "Internal Server Error");
  }
};

export const unblockToken = async (
  req: FastifyRequest<{
    Body: TGeneralToken;
  }>,
  reply: FastifyReply
) => {
  try {
    const { tokenId } = req.body;
    const client = req.redis;

    if (!client) {
      throw new Error("Redis client is not available");
    }

    const tokenKey = generateTokenKey(tokenId);
    const status = await client.get(tokenKey);
    if (status === "assigned") {
      await client.set(tokenKey, "unblocked");
      reply.send({ message: `Token ${tokenId} unblocked` });
    } else {
      reply.status(400).send({ error: `Token ${tokenId} cannot be unblocked` });
    }
  } catch (err) {
    reply.internalServerError(err.message || "Internal Server Error");
  }
};

export const deleteToken = async (
  req: FastifyRequest<{
    Body: TGeneralToken;
  }>,
  reply: FastifyReply
) => {
  try {
    const { tokenId } = req.body;
    const client = req.redis;

    const tokenKey = generateTokenKey(tokenId);
    const status = await client.get(tokenKey);

    if (status) {
      await client.del(tokenKey);
      reply.send({ message: `Token ${tokenId} deleted` });
    } else {
      reply.status(404).send({ error: `Token ${tokenId} does not exist` });
    }
  } catch (err) {
    reply.internalServerError(err.message || "Internal Server Error");
  }
};

export const keepAlive = async (
  req: FastifyRequest<{
    Body: TGeneralToken;
  }>,
  reply: FastifyReply
) => {
  try {
    const { tokenId } = req.body;
    const client = req.redis;

    const tokenKey = generateTokenKey(tokenId);
    const status = await client.get(tokenKey);

    if (status === "assigned") {
      await client.expire(tokenKey, 60); // Extend TTL by 60 seconds
      reply.send({ message: `Token ${tokenId} kept alive` });
    } else {
      reply.status(400).send({ error: `Token ${tokenId} is not assigned` });
    }
  } catch (err) {
    reply.internalServerError(err.message || "Internal Server Error");
  }
};
