function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isLikelyGenericLinkedInImage(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("static.licdn.com") ||
    lower.includes("linkedin.com/favicon") ||
    lower.includes("guest_home")
  );
}

function extractMetaImage(html: string): string | null {
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  if (ogImageMatch?.[1]) {
    const decoded = decodeHtml(ogImageMatch[1]);
    if (!isLikelyGenericLinkedInImage(decoded)) {
      return decoded;
    }
  }

  const twitterImageMatch = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  if (twitterImageMatch?.[1]) {
    const decoded = decodeHtml(twitterImageMatch[1]);
    if (!isLikelyGenericLinkedInImage(decoded)) {
      return decoded;
    }
  }

  return null;
}

function extractLinkedInVectorImage(html: string): string | null {
  const rootUrlMatch = html.match(/"rootUrl"\s*:\s*"([^"]+)"/i);
  const segmentMatches = [...html.matchAll(/"fileIdentifyingUrlPathSegment"\s*:\s*"([^"]+)"/gi)];

  if (!rootUrlMatch?.[1] || !segmentMatches.length) {
    return null;
  }

  const rootUrl = decodeHtml(rootUrlMatch[1].replace(/\\\//g, "/"));
  const lastSegment = segmentMatches[segmentMatches.length - 1]?.[1];
  if (!lastSegment) return null;

  const segment = decodeHtml(lastSegment.replace(/\\\//g, "/"));
  const combined = `${rootUrl}${segment}`;

  if (isLikelyGenericLinkedInImage(combined)) {
    return null;
  }

  return combined;
}

export function getGeneratedAvatar(name?: string | null): string {
  const safeName = (name || "C Square Member").trim() || "C Square Member";
  const encoded = encodeURIComponent(safeName);
  return `https://ui-avatars.com/api/?name=${encoded}&background=0ea5e9&color=ffffff&size=512&rounded=true&bold=true`;
}

export async function getLinkedInProfileImage(linkedinUrl: string): Promise<string | null> {
  try {
    const url = new URL(linkedinUrl);
    if (!url.hostname.includes("linkedin.com")) {
      return null;
    }

    const normalizedUrl = `${url.origin}${url.pathname}`;

    const response = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    if (/authwall|checkpoint|login-submit/i.test(html)) {
      return null;
    }

    const imageUrl = extractMetaImage(html) || extractLinkedInVectorImage(html);

    if (!imageUrl) {
      return null;
    }

    const parsedImageUrl = new URL(imageUrl);
    if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
      return null;
    }

    return parsedImageUrl.toString();
  } catch {
    return null;
  }
}
