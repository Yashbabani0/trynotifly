import type { FastifyInstance } from "fastify";

export async function indexRoute(fastify: FastifyInstance) {
  fastify.get("/", async () => {
    return {
      hello: "world",
    };
  });
}
