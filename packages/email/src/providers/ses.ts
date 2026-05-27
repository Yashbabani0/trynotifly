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

let sesClient: SESv2Client | null = null;

export function getSesRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
}

function getSesClient() {
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

    throw error;
  }
}

export async function createIdentity(domain: string): Promise<SesIdentity> {
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
}

export async function enableMailFrom(domain: string, mailFromDomain = `mail.${domain}`) {
  await getSesClient().send(
    new PutEmailIdentityMailFromAttributesCommand({
      EmailIdentity: domain,
      MailFromDomain: mailFromDomain,
      BehaviorOnMxFailure: "USE_DEFAULT_VALUE",
    }),
  );

  return mailFromDomain;
}

export async function deleteIdentity(domain: string) {
  await getSesClient().send(
    new DeleteEmailIdentityCommand({
      EmailIdentity: domain,
    }),
  );
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
