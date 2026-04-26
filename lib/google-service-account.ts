type GoogleServiceAccountFields = {
  project_id?: string;
  client_email: string;
  private_key: string;
};

export type GoogleServiceAccountConfig = {
  projectId?: string;
  clientEmail: string;
  privateKey: string;
};

function normalizePrivateKey(value: string): string {
  let key = value.trim();

  // Some env dashboards keep surrounding quotes when pasting JSON values.
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1);
  }

  // Handle common escaped newline variants from environment variable UIs.
  key = key
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Some dashboards strip PEM newlines entirely; rebuild a valid PEM block.
  const beginMarker = "-----BEGIN PRIVATE KEY-----";
  const endMarker = "-----END PRIVATE KEY-----";
  if (key.includes(beginMarker) && key.includes(endMarker) && !key.includes("\n")) {
    const body = key
      .replace(beginMarker, "")
      .replace(endMarker, "")
      .replace(/\s+/g, "");

    const wrappedBody = body.match(/.{1,64}/g)?.join("\n") || body;
    key = `${beginMarker}\n${wrappedBody}\n${endMarker}\n`;
  }

  return key;
}

function decodeBase64(input: string, sourceName: string): string {
  try {
    return Buffer.from(input.trim(), "base64").toString("utf8");
  } catch {
    throw new Error(`${sourceName} is not valid base64`);
  }
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Add it in your deployment environment (Production scope) and redeploy.`
    );
  }
  return value;
}

export function isGoogleServiceAccountConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 ||
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
      (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
        (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64 || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY))
  );
}

function parseServiceAccountJson(raw: string): GoogleServiceAccountFields {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must be a JSON object");
  }

  const obj = parsed as Partial<GoogleServiceAccountFields>;

  if (!obj.client_email || !obj.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key"
    );
  }

  return {
    project_id: obj.project_id,
    client_email: obj.client_email,
    private_key: obj.private_key,
  };
}

export function getGoogleServiceAccountConfig(): GoogleServiceAccountConfig {
  const fromJsonBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (fromJsonBase64) {
    const parsed = parseServiceAccountJson(
      decodeBase64(fromJsonBase64, "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64")
    );

    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }

  const fromJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (fromJson) {
    const parsed = parseServiceAccountJson(fromJson);
    return {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  }

  const projectId =
    process.env.GOOGLE_PROJECT_ID || process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID;
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKeyBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64;
  const privateKey = privateKeyBase64
    ? normalizePrivateKey(
        decodeBase64(
          privateKeyBase64,
          "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64"
        )
      )
    : normalizePrivateKey(getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"));

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}
