import Fastify from "fastify";
import { healthRoute } from "./routes/health-route";
import { indexRoute } from "./routes/index-route";
import { domainVerifyRoute } from "./routes/domainVerfiy-route";
import { fastifyCors } from "@fastify/cors";
import { startDomainVerificationWorker } from "./workers/domain-verification-worker";

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(fastifyCors, {
    origin: true,
  });

  fastify.register(indexRoute);
  fastify.register(healthRoute);
  fastify.register(domainVerifyRoute);

  if (process.env.DOMAIN_VERIFICATION_WORKER !== "false") {
    startDomainVerificationWorker(fastify);
  }

  return fastify;
}
