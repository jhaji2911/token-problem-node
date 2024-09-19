// src/types/fastify.d.ts

import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    redis: any; // or you can specify the exact type of your redis client
  }
}
