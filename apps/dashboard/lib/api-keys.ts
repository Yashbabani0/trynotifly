import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import {
  and,
  apiKey,
  checkPlanLimit,
  count,
  db,
  eq,
  member,
  organization,
} from "@trynotifly/db";

export type ApiKeyType = "LIVE" | "TEST";
export type ApiKeyStatus = "ACTIVE" | "INACTIVE" | "REVOKED";

export class ApiKeyError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function hashApiKey(rawKey: string) {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

function secureEqual(a: string, b: string) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");

  return left.length === right.length && timingSafeEqual(left, right);
}

export function extractApiKeyPrefix(rawKey: string) {
  return rawKey.split("_").slice(0, 3).join("_");
}

function normalizeRole(role?: string | null) {
  return role?.toLowerCase();
}

export async function getOrganizationMembership(userId: string, organizationId: string) {
  return db.query.member.findFirst({
    where: and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
  });
}

export async function assertApiKeyManager(userId: string, organizationId: string) {
  const membership = await getOrganizationMembership(userId, organizationId);
  const role = normalizeRole(membership?.role);

  if (!membership) {
    throw new ApiKeyError(
      "You do not have access to this organization.",
      403,
      "ORGANIZATION_ACCESS_DENIED",
    );
  }

  if (role !== "owner" && role !== "admin") {
    throw new ApiKeyError(
      "Only organization owners and admins can manage API keys.",
      403,
      "INSUFFICIENT_ROLE",
      { role: membership.role },
    );
  }

  return membership;
}

export function generateApiKey(type: ApiKeyType) {
  const prefix = type === "LIVE" ? "tn_live" : "tn_test";
  const identifier = randomBytes(4).toString("hex");
  const secret = randomBytes(32).toString("hex");
  const keyPrefix = `${prefix}_${identifier}`;

  return {
    rawKey: `${keyPrefix}_${secret}`,
    prefix: keyPrefix,
  };
}

export async function createOrganizationApiKey(input: {
  organizationId: string;
  userId: string;
  name: string;
  type: ApiKeyType;
}) {
  await assertApiKeyManager(input.userId, input.organizationId);

  const name = input.name.trim();

  if (name.length < 2 || name.length > 80) {
    throw new ApiKeyError(
      "API key name must be between 2 and 80 characters.",
      400,
      "INVALID_API_KEY_NAME",
    );
  }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, input.organizationId),
  });

  if (!org) {
    throw new ApiKeyError("Workspace not found.", 404, "ORGANIZATION_NOT_FOUND");
  }

  const [activeKeys] = await db
    .select({ value: count() })
    .from(apiKey)
    .where(
      and(eq(apiKey.organizationId, input.organizationId), eq(apiKey.status, "ACTIVE")),
    );
  const limit = checkPlanLimit({
    plan: org.plan,
    key: "apiKeys",
    current: activeKeys?.value ?? 0,
  });

  if (!limit.allowed) {
    throw new ApiKeyError(limit.message, 402, limit.code, limit);
  }

  const generated = generateApiKey(input.type);
  const hashedKey = hashApiKey(generated.rawKey);

  const inserted = await db
    .insert(apiKey)
    .values({
      organizationId: input.organizationId,
      createdByUserId: input.userId,
      name,
      type: input.type,
      hashedKey,
      prefix: generated.prefix,
      status: "ACTIVE",
    })
    .returning();

  const created = inserted[0];

  if (!created) {
    throw new ApiKeyError("Failed to create API key.", 500, "DB_INSERT_FAILED");
  }

  return {
    apiKey: created,
    rawKey: generated.rawKey,
  };
}

export async function listOrganizationApiKeys(input: {
  organizationId: string;
  userId: string;
}) {
  const membership = await getOrganizationMembership(input.userId, input.organizationId);

  if (!membership) {
    throw new ApiKeyError(
      "You do not have access to this organization.",
      403,
      "ORGANIZATION_ACCESS_DENIED",
    );
  }

  return db.query.apiKey.findMany({
    where: eq(apiKey.organizationId, input.organizationId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
}

export async function revokeOrganizationApiKey(input: {
  organizationId: string;
  userId: string;
  keyId: string;
}) {
  await assertApiKeyManager(input.userId, input.organizationId);

  const existing = await db.query.apiKey.findFirst({
    where: and(eq(apiKey.id, input.keyId), eq(apiKey.organizationId, input.organizationId)),
  });

  if (!existing) {
    throw new ApiKeyError("API key not found.", 404, "API_KEY_NOT_FOUND");
  }

  if (existing.status === "REVOKED") {
    throw new ApiKeyError("API key is already revoked.", 409, "API_KEY_ALREADY_REVOKED");
  }

  const updated = await db
    .update(apiKey)
    .set({
      status: "REVOKED",
      revokedAt: new Date(),
      revokedByUserId: input.userId,
    })
    .where(eq(apiKey.id, input.keyId))
    .returning();

  return updated[0];
}

export async function verifyApiKey(rawKey: string) {
  const prefix = extractApiKeyPrefix(rawKey);
  const incomingHash = hashApiKey(rawKey);
  const candidates = await db.query.apiKey.findMany({
    where: eq(apiKey.prefix, prefix),
    limit: 2,
  });
  const found = candidates.find((candidate) => secureEqual(candidate.hashedKey, incomingHash));

  if (!found || found.status !== "ACTIVE") {
    return null;
  }

  await db
    .update(apiKey)
    .set({
      lastUsedAt: new Date(),
    })
    .where(eq(apiKey.id, found.id));

  return found;
}

export function publicApiKey(key: typeof apiKey.$inferSelect) {
  return {
    id: key.id,
    name: key.name,
    type: key.type,
    prefix: key.prefix,
    status: key.status,
    lastUsedAt: key.lastUsedAt,
    revokedAt: key.revokedAt,
    createdAt: key.createdAt,
    updatedAt: key.updatedAt,
  };
}
