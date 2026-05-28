import {
  CreateEmailIdentityCommand,
  DeleteEmailIdentityCommand,
  GetEmailIdentityCommand,
  PutEmailIdentityMailFromAttributesCommand,
  SESv2Client,
  type GetEmailIdentityCommandOutput,
} from "@aws-sdk/client-sesv2";

export type SesIdentity = {
  domain: string;
  exists: boolean;
  verified: boolean;
  dkimStatus?: string;
  dkimTokens: string[];
  mailFromDomain?: string;
  mailFromStatus?: string;
};

export class SesProviderError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 502,
    public details?: unknown,
  ) {
    super(message);
  }
}

let sesClient: SESv2Client | null = null;

export function getSesRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
}

function getSesClient() {
  if (!process.env.AWS_REGION && !process.env.AWS_DEFAULT_REGION) {
    throw new SesProviderError(
      "AWS_REGION is required before domains can be created.",
      "AWS_REGION_MISSING",
      500,
    );
  }

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new SesProviderError(
      "AWS SES credentials are missing. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.",
      "AWS_CREDENTIALS_MISSING",
      500,
    );
  }

  if (!sesClient) {
    sesClient = new SESv2Client({
      region: getSesRegion(),
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  return sesClient;
}

function parseSesError(error: unknown): SesProviderError {
  if (error instanceof SesProviderError) {
    return error;
  }

  const maybeError = error as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number; requestId?: string };
  };
  const name = maybeError.name ?? "SES_PROVIDER_ERROR";
  const httpStatusCode = maybeError.$metadata?.httpStatusCode;

  if (
    name === "TooManyRequestsException" ||
    name === "ThrottlingException" ||
    name === "LimitExceededException"
  ) {
    return new SesProviderError(
      "AWS SES is rate limiting this request. Please retry in a moment.",
      "SES_RATE_LIMITED",
      429,
      maybeError.$metadata,
    );
  }

  if (
    name === "AccessDeniedException" ||
    name === "InvalidClientTokenId" ||
    name === "UnrecognizedClientException" ||
    name === "SignatureDoesNotMatch"
  ) {
    return new SesProviderError(
      "AWS SES rejected the configured credentials. Check AWS access keys and IAM permissions.",
      "SES_AUTH_FAILED",
      502,
      maybeError.$metadata,
    );
  }

  if (name === "BadRequestException" || name === "InvalidParameterValue") {
    return new SesProviderError(
      maybeError.message ?? "AWS SES rejected the domain request.",
      "SES_BAD_REQUEST",
      400,
      maybeError.$metadata,
    );
  }

  return new SesProviderError(
    maybeError.message ?? "AWS SES request failed.",
    name,
    httpStatusCode && httpStatusCode >= 400 && httpStatusCode < 500 ? 400 : 502,
    maybeError.$metadata,
  );
}

function toIdentity(domain: string, response: GetEmailIdentityCommandOutput): SesIdentity {
  return {
    domain,
    exists: true,
    verified: Boolean(response.VerifiedForSendingStatus),
    dkimStatus: response.DkimAttributes?.Status,
    dkimTokens: response.DkimAttributes?.Tokens ?? [],
    mailFromDomain: response.MailFromAttributes?.MailFromDomain,
    mailFromStatus: response.MailFromAttributes?.MailFromDomainStatus,
  };
}

export async function getIdentity(domain: string): Promise<SesIdentity | null> {
  try {
    const response = await getSesClient().send(
      new GetEmailIdentityCommand({
        EmailIdentity: domain,
      }),
    );

    return toIdentity(domain, response);
  } catch (error) {
    const name = error instanceof Error ? error.name : "UnknownError";

    if (name === "NotFoundException") {
      return null;
    }

    throw parseSesError(error);
  }
}

export async function createIdentity(domain: string): Promise<SesIdentity> {
  try {
    const response = await getSesClient().send(
      new CreateEmailIdentityCommand({
        EmailIdentity: domain,
      }),
    );

    return {
      domain,
      exists: true,
      verified: Boolean(response.VerifiedForSendingStatus),
      dkimStatus: response.DkimAttributes?.Status,
      dkimTokens: response.DkimAttributes?.Tokens ?? [],
    };
  } catch (error) {
    throw parseSesError(error);
  }
}

export async function enableMailFrom(domain: string, mailFromDomain = `mail.${domain}`) {
  try {
    await getSesClient().send(
      new PutEmailIdentityMailFromAttributesCommand({
        EmailIdentity: domain,
        MailFromDomain: mailFromDomain,
        BehaviorOnMxFailure: "USE_DEFAULT_VALUE",
      }),
    );

    return mailFromDomain;
  } catch (error) {
    throw parseSesError(error);
  }
}

export async function deleteIdentity(domain: string) {
  try {
    await getSesClient().send(
      new DeleteEmailIdentityCommand({
        EmailIdentity: domain,
      }),
    );
  } catch (error) {
    throw parseSesError(error);
  }
}

export async function syncVerificationStatus(domain: string) {
  return getIdentity(domain);
}

export async function verifySesDomain(domain: string) {
  const existing = await getIdentity(domain);
  const identity = existing ?? (await createIdentity(domain));
  const mailFromDomain = await enableMailFrom(domain, `mail.${domain}`);
  const syncedIdentity = await getIdentity(domain);

  return {
    ...identity,
    ...(syncedIdentity ?? {}),
    mailFromDomain,
  };
}

export async function getSesDomainVerification(domain: string) {
  return getIdentity(domain);
}
