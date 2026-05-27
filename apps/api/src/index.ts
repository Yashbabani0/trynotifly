import { env } from "./config/env";
import { buildApp } from "./app";

async function startServer() {
  const fastify = await buildApp();

  try {
    await fastify.listen({
      port: env.PORT,
      host: env.HOST,
    });

    fastify.log.info(`server listening on http://${env.HOST}:${env.PORT}`);

    process.on("SIGINT", async () => {
      await fastify.close();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await fastify.close();
      process.exit(0);
    });
  } catch (error) {
    fastify.log.error(error);

    process.exit(1);
  }
}

startServer();
