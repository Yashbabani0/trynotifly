import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import {
  createDomain,
  createSenderEmail,
  deleteDomain,
  deleteSenderEmail,
  DomainApiError,
  getDomainDetails,
  getOrganizationId,
  listSenderEmails,
  listDomains,
  normalizeDomain,
  normalizeMailFromDomain,
  normalizeSenderEmail,
  setDefaultSenderEmail,
  syncDomainStatus,
  updateSenderEmailStatus,
  updateMailFromDomain,
  validateSenderForSend,
} from "../services/domain-service";

const createDomainSchema = z.object({
  domain: z.string().min(1).max(255),
});

const domainParamsSchema = z.object({
  domain: z.string().min(1).max(255).transform(normalizeDomain),
});

const mailFromBodySchema = z.object({
  mailFromDomain: z.string().min(1).max(255).transform(normalizeMailFromDomain),
});

const createSenderSchema = z.object({
  email: z.string().min(3).max(320).transform(normalizeSenderEmail),
  displayName: z.string().max(120).optional().nullable(),
  isDefault: z.boolean().optional(),
});

const senderParamsSchema = domainParamsSchema.extend({
  senderId: z.string().uuid(),
});

const updateSenderSchema = z.object({
  status: z.enum(["active", "disabled"]).optional(),
  isDefault: z.boolean().optional(),
});

const validateSenderSchema = z.object({
  from: z.string().min(3).max(320).transform(normalizeSenderEmail),
  requireExplicitSender: z.boolean().optional(),
});

function sendError(reply: FastifyReply, error: unknown) {
  if (error instanceof DomainApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  return reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        error instanceof Error
          ? error.message
          : "Domain request failed unexpectedly.",
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? {
              name: error.name,
              stack: error.stack,
            }
          : undefined,
    },
  });
}

export async function domainVerifyRoute(fastify: FastifyInstance) {
  fastify.post("/v1/domain/create", async (request, reply) => {
    try {
      const parsedBody = createDomainSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid create domain request.",
            details: parsedBody.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      request.log.info(
        {
          organizationId,
          rawDomain: parsedBody.data.domain,
          normalizedDomain: normalizeDomain(parsedBody.data.domain),
        },
        "domain.create.received",
      );
      const result = await createDomain({
        domain: parsedBody.data.domain,
        organizationId,
      });

      return reply.status(201).send({
        success: true,
        data: {
          domain: result.domain,
          records: result.records,
          statusSummary: result.statusSummary,
        },
      });
    } catch (error) {
      request.log.error({ error }, "domain.create.failed");
      return sendError(reply, error);
    }
  });

  fastify.get("/v1/domain/status/:domain", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid domain.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      request.log.info(
        {
          organizationId,
          domain: parsedParams.data.domain,
        },
        "domain.status.received",
      );
      const result = await syncDomainStatus(parsedParams.data.domain, organizationId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.status.failed");
      return sendError(reply, error);
    }
  });

  fastify.get("/v1/domain/:domain", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid domain.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await getDomainDetails({
        domain: parsedParams.data.domain,
        organizationId,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.details.failed");
      return sendError(reply, error);
    }
  });

  fastify.post("/v1/domain/check/:domain", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid domain.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      request.log.info(
        {
          organizationId,
          domain: parsedParams.data.domain,
        },
        "domain.check.received",
      );
      const result = await syncDomainStatus(parsedParams.data.domain, organizationId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.check.failed");
      return sendError(reply, error);
    }
  });

  fastify.delete("/v1/domain/:domain", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid domain.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await deleteDomain({
        domain: parsedParams.data.domain,
        organizationId,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.delete.failed");
      return sendError(reply, error);
    }
  });

  fastify.patch("/v1/domain/:domain/mail-from", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);
      const parsedBody = mailFromBodySchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid MAIL FROM request.",
            details: {
              params: parsedParams.success ? undefined : parsedParams.error.flatten().fieldErrors,
              body: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors,
            },
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await updateMailFromDomain({
        domain: parsedParams.data.domain,
        organizationId,
        mailFromDomain: parsedBody.data.mailFromDomain,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.mail_from.failed");
      return sendError(reply, error);
    }
  });

  fastify.get("/v1/domain/:domain/senders", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid domain.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await listSenderEmails({
        organizationId,
        domain: parsedParams.data.domain,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.senders.list.failed");
      return sendError(reply, error);
    }
  });

  fastify.post("/v1/domain/:domain/senders", async (request, reply) => {
    try {
      const parsedParams = domainParamsSchema.safeParse(request.params);
      const parsedBody = createSenderSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sender email request.",
            details: {
              params: parsedParams.success ? undefined : parsedParams.error.flatten().fieldErrors,
              body: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors,
            },
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await createSenderEmail({
        organizationId,
        domain: parsedParams.data.domain,
        email: parsedBody.data.email,
        displayName: parsedBody.data.displayName,
        isDefault: parsedBody.data.isDefault,
      });

      return reply.status(201).send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.senders.create.failed");
      return sendError(reply, error);
    }
  });

  fastify.patch("/v1/domain/:domain/senders/:senderId", async (request, reply) => {
    try {
      const parsedParams = senderParamsSchema.safeParse(request.params);
      const parsedBody = updateSenderSchema.safeParse(request.body);

      if (!parsedParams.success || !parsedBody.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sender email update.",
            details: {
              params: parsedParams.success ? undefined : parsedParams.error.flatten().fieldErrors,
              body: parsedBody.success ? undefined : parsedBody.error.flatten().fieldErrors,
            },
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);

      if (parsedBody.data.isDefault) {
        const result = await setDefaultSenderEmail({
          organizationId,
          domain: parsedParams.data.domain,
          senderId: parsedParams.data.senderId,
        });

        return reply.send({
          success: true,
          data: result,
        });
      }

      if (parsedBody.data.status) {
        const result = await updateSenderEmailStatus({
          organizationId,
          domain: parsedParams.data.domain,
          senderId: parsedParams.data.senderId,
          status: parsedBody.data.status,
        });

        return reply.send({
          success: true,
          data: result,
        });
      }

      return reply.status(400).send({
        success: false,
        error: {
          code: "NO_SENDER_UPDATE",
          message: "Provide status or isDefault to update a sender email.",
        },
      });
    } catch (error) {
      request.log.error({ error }, "domain.senders.update.failed");
      return sendError(reply, error);
    }
  });

  fastify.delete("/v1/domain/:domain/senders/:senderId", async (request, reply) => {
    try {
      const parsedParams = senderParamsSchema.safeParse(request.params);

      if (!parsedParams.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sender email.",
            details: parsedParams.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await deleteSenderEmail({
        organizationId,
        domain: parsedParams.data.domain,
        senderId: parsedParams.data.senderId,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.senders.delete.failed");
      return sendError(reply, error);
    }
  });

  fastify.post("/v1/domain/senders/validate", async (request, reply) => {
    try {
      const parsedBody = validateSenderSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sender validation request.",
            details: parsedBody.error.flatten().fieldErrors,
          },
        });
      }

      const organizationId = getOrganizationId(request.headers);
      const result = await validateSenderForSend({
        organizationId,
        from: parsedBody.data.from,
        requireExplicitSender: parsedBody.data.requireExplicitSender,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error({ error }, "domain.senders.validate.failed");
      return sendError(reply, error);
    }
  });

  fastify.get("/v1/domain/list", async (request, reply) => {
    try {
      const organizationId = getOrganizationId(request.headers);
      const domains = await listDomains(organizationId);

      return reply.send({
        success: true,
        data: {
          domains,
        },
      });
    } catch (error) {
      request.log.error({ error }, "domain.list.failed");
      return sendError(reply, error);
    }
  });
}
