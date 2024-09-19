import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

// Schema for the Token
const tokenSchema = z.object({
  id: z.string().uuid(),  // A UUID to uniquely identify each token
  status: z.enum(["free", "assigned", "unblocked"]),  // The status of the token
  expiry: z.string().optional(),  // Expiry time for when the token should be auto-released
});

export type TToken = z.infer<typeof tokenSchema>; 

// Schema to create new tokens
const createTokenSchema = z.object({
  count: z.number().min(1),  // Number of tokens to generate in the pool
});

export type TCreateToken = z.infer<typeof createTokenSchema>;

// Schema to assign a token from the pool
const assignTokenSchema = z.object({
  tokenId: z.string().optional(),  // ID of the token to assign
});

// Schema to unblock a token
const unblockTokenSchema = z.object({
  tokenId: z.string().uuid(),  // ID of the token to unblock
});

// Schema to delete a token from the pool
const deleteTokenSchema = z.object({
  tokenId: z.string().uuid(),  // ID of the token to delete
});

// Schema to keep the token alive (within 60s)
const keepAliveSchema = z.object({
  tokenId: z.string().uuid(),  // ID of the token to keep alive
});

export type TGeneralToken = z.infer<typeof assignTokenSchema>; // common type for all tokens 

// Build the JSON schemas for Fastify
export const { schemas: tokenSchemas, $ref } = buildJsonSchemas(
  {
    tokenSchema,
    createTokenSchema,
    assignTokenSchema,
    unblockTokenSchema,
    deleteTokenSchema,
    keepAliveSchema,
  },
  { $id: "tokenSchemas" }  // Optional: Provide a schema ID namespace
);
