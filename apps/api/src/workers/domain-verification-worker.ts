import type { FastifyInstance } from "fastify";
import { pollPendingDomains } from "../services/domain-service";

export function startDomainVerificationWorker(fastify: FastifyInstance) {
  const intervalMs = Number(process.env.DOMAIN_VERIFICATION_POLL_MS ?? 60_000);

  async function runPoll() {
    try {
      const results = await pollPendingDomains();
      fastify.log.info(
        {
          checked: results.length,
        },
        "domain verification poll completed",
      );
    } catch (error) {
      fastify.log.error(error, "domain verification poll failed");
    }
  }

  const interval = setInterval(runPoll, intervalMs);
  interval.unref();

  fastify.addHook("onClose", async () => {
    clearInterval(interval);
  });

  return {
    runPoll,
  };
}
