import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import {
  createDomain,
  deleteDomain,
  DomainApiError,
  getOrganizationId,
  listDomains,
  normalizeDomain,
  syncDomainStatus,
} from "../services/domain-service";

const createDomainSchema = z.object({
  domain: z.string().min(1).max(255),
  organizationId: z.string().uuid().optional(),
});

const domainParamsSchema = z.object({
  domain: z.string().min(1).max(255).transform(normalizeDomain),
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
      message: "Something went wrong while processing the domain request.",
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

      const organizationId = getOrganizationId(request.headers, parsedBody.data);
      const result = await createDomain({
        domain: parsedBody.data.domain,
        organizationId,
      });

      return reply.status(201).send({
        success: true,
        data: {
          domain: result.domain,
          records: result.records,
        },
      });
    } catch (error) {
      request.log.error(error);
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
      const result = await syncDomainStatus(parsedParams.data.domain, organizationId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error(error);
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
      const result = await syncDomainStatus(parsedParams.data.domain, organizationId);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error) {
      request.log.error(error);
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
      request.log.error(error);
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
      request.log.error(error);
      return sendError(reply, error);
    }
  });
}
