type GoogleServiceAccountFields = {
  project_id: string;
  client_email: string;
  private_key: string;
};

export type GoogleServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

function normalizePrivateKey(value: string): string {
  return value.includes("\\n") ? value.replace(/\\n/g, "\n") : value;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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

  if (!obj.project_id || !obj.client_email || !obj.private_key) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON must include project_id, client_email, and private_key"
    );
  }

  return {
    project_id: obj.project_id,
    client_email: obj.client_email,
    private_key: obj.private_key,
  };
}

export function getGoogleServiceAccountConfig(): GoogleServiceAccountConfig {
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
    process.env.GOOGLE_PROJECT_ID || getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PROJECT_ID");
  const clientEmail = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const privateKey = normalizePrivateKey(getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"));

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}
