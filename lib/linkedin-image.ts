function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaImage(html: string): string | null {
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  if (ogImageMatch?.[1]) {
    return decodeHtml(ogImageMatch[1]);
  }

  const twitterImageMatch = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  if (twitterImageMatch?.[1]) {
    return decodeHtml(twitterImageMatch[1]);
  }

  return null;
}

export async function getLinkedInProfileImage(linkedinUrl: string): Promise<string | null> {
  try {
    const url = new URL(linkedinUrl);
    if (!url.hostname.includes("linkedin.com")) {
      return null;
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const imageUrl = extractMetaImage(html);

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
