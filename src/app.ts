import { join } from "path";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import fastifyCors from "@fastify/cors";
import { version } from "../package.json";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { fastifyRedis } from "@fastify/redis";
import { tokenSchemas } from "./modules/token/token.schema";
import { tokenRoutes } from "./modules/token/token.route";
import fastifyStatic from "@fastify/static";
import { SimpleIntervalJob, Task, ToadScheduler } from "toad-scheduler";
import { TOKEN_PREFIX } from "./utils/constants";

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  logger: true,
  // ...other options
};

const scheduler = new ToadScheduler();

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // scheduler logic

  const tokenCleanupTask = new Task("Token Cleanup", async () => {

    console.log('cleanup-task-in-progress')
    const redisClient = fastify.redis;
    const allTokens = await redisClient.keys(`${TOKEN_PREFIX}*`);
    const currentTime = Date.now();

    for (const token of allTokens) {
      const lastKeepAlive = await redisClient.get(token);
      if (
        lastKeepAlive &&
        currentTime - parseInt(lastKeepAlive) > 5 * 60 * 1000
      ) {
        await redisClient.del(token); // Delete token if keep-alive not received in last 5 minutes
        console.log(`Token ${token} has been deleted due to no keep-alive`);
      }
    }
  });

  fastify.register(fastifyCors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  fastify.register(fastifyRedis, {
    host: "127.0.0.1", // Replace with Redis server address
    port: 6379,
    // namespace: "ninja_redis", ? we can have multiple instances of redis cluster
  });

  fastify.decorateRequest("redis", null);

  fastify.addHook("onRequest", async (req, reply) => {
    req.redis = fastify.redis;
  });

  for (let schema of [...tokenSchemas]) {
    fastify.addSchema(schema);
  }

  const swaggerOptions = {
    swagger: {
      info: {
        title: "token-hero-node",
        description: "Helps you assigning token efficiently ",
        version,
      },
      host: "localhost:3000",
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"],
      tags: [{ name: "Default", description: "Default" }],
    },
    openapi: {
      info: {
        title: "token-hero-node",
        description: "Helps you assigning token efficiently ",
        version,
      },
      servers: [
        {
          url: "http://localhost:3000",
        },
      ],
    },
  };

  const swaggerUiOptions = {
    routePrefix: "/docs",
    exposeRoute: true,
  };

  // Register Swagger and Swagger UI
  fastify.register(fastifySwagger, swaggerOptions);
  fastify.register(fastifySwaggerUi, swaggerUiOptions);

  // Serve Swagger UI static files
  fastify.register(fastifyStatic, {
    root: join(__dirname, "public"),
    prefix: "/public/",
  });



  // Graceful shutdowns ✨
  const listeners = ["SIGINT", "SIGTERM"];
  listeners.forEach((signal) => {
    process.on(signal, async () => {
      await fastify.close();
      fastify.redis.quit() // O(1) complexity,writes pending operations
      fastify.log.warn("hero and redis are down");
      scheduler.stop();
      fastify.log.info("Scheduler is down!")
      process.exit(0);
    });
  });

  fastify.register(tokenRoutes, { prefix: "api/token" });

  // Schedule the cleanup job every 5 minutes
  const keepAliveJob = new SimpleIntervalJob({ minutes: 5 }, tokenCleanupTask);
  scheduler.addSimpleIntervalJob(keepAliveJob);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };
