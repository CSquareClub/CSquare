export type ParsedSponsor = {
  title: string;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  devfolioApplyLogoLightUrl: string | null;
  devfolioApplyLogoDarkUrl: string | null;
};

function toOptionalString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseSponsorObject(value: unknown): ParsedSponsor | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const title =
    toOptionalString(record.title) ||
    toOptionalString(record.name) ||
    toOptionalString(record.sponsorTitle);

  if (!title) return null;

  const logoUrl = toOptionalString(record.logoUrl) || toOptionalString(record.logo);
  const logoLightUrl = toOptionalString(record.logoLightUrl) || logoUrl;
  const logoDarkUrl = toOptionalString(record.logoDarkUrl) || logoLightUrl || logoUrl;
  const devfolioApplyLogoLightUrl =
    toOptionalString(record.devfolioApplyLogoLightUrl) ||
    toOptionalString(record.applyLogoLightUrl);
  const devfolioApplyLogoDarkUrl =
    toOptionalString(record.devfolioApplyLogoDarkUrl) ||
    toOptionalString(record.applyLogoDarkUrl) ||
    devfolioApplyLogoLightUrl;

  return {
    title,
    logoUrl,
    logoLightUrl,
    logoDarkUrl,
    devfolioApplyLogoLightUrl,
    devfolioApplyLogoDarkUrl,
  };
}

function parseSponsorsFromJsonString(raw: string): ParsedSponsor[] {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") {
            const title = toOptionalString(item);
            return title
              ? {
                  title,
                  logoUrl: null,
                  logoLightUrl: null,
                  logoDarkUrl: null,
                  devfolioApplyLogoLightUrl: null,
                  devfolioApplyLogoDarkUrl: null,
                }
              : null;
          }

          return parseSponsorObject(item);
        })
        .filter((item): item is ParsedSponsor => item !== null);
    }

    if (parsed && typeof parsed === "object") {
      const fromObject = parseSponsorObject(parsed);
      if (fromObject) return [fromObject];

      const sponsorsArray = (parsed as Record<string, unknown>).sponsors;
      if (Array.isArray(sponsorsArray)) {
        return sponsorsArray
          .map((item) => parseSponsorObject(item))
          .filter((item): item is ParsedSponsor => item !== null);
      }
    }
  } catch {
    // Fall through to plain text parsing.
  }

  return [];
}

export function parseEventSponsors(rawSponsors: string | null | undefined): ParsedSponsor[] {
  const normalized = toOptionalString(rawSponsors);
  if (!normalized) return [];

  const fromJson = parseSponsorsFromJsonString(normalized);
  if (fromJson.length > 0) return fromJson;

  return normalized
    .split(/\r?\n|,/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((title) => ({
      title,
      logoUrl: null,
      logoLightUrl: null,
      logoDarkUrl: null,
      devfolioApplyLogoLightUrl: null,
      devfolioApplyLogoDarkUrl: null,
    }));
}

export function getDevfolioApplyLogos(sponsors: ParsedSponsor[]): {
  light: string | null;
  dark: string | null;
} {
  const devfolioSponsor = sponsors.find(
    (sponsor) => sponsor.title.trim().toLowerCase() === "devfolio"
  );

  return {
    light: devfolioSponsor?.devfolioApplyLogoLightUrl || null,
    dark:
      devfolioSponsor?.devfolioApplyLogoDarkUrl ||
      devfolioSponsor?.devfolioApplyLogoLightUrl ||
      null,
  };
}

export function hasDevfolioRegistrationLink(url: string | null | undefined): boolean {
  if (!url) return false;
  return /devfolio\.(co|in|com)/i.test(url);
}
