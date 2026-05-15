import "server-only";

export interface SubstackProfile {
  id: number;
  name: string;
  handle: string;
}

const FETCH_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  Accept: "application/json",
};

function normalizeUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

/**
 * Profile URLs look like:
 *   https://substack.com/@handle
 *   https://www.substack.com/@handle
 *   https://substack.com/@handle/...
 */
export function extractHandleFromProfileUrl(input: string): string | null {
  const url = normalizeUrl(input);
  if (!url) return null;
  if (!/(^|\.)substack\.com$/i.test(url.hostname)) return null;
  const match = url.pathname.match(/^\/@([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Publication URLs look like:
 *   https://abc.substack.com
 *   https://abc.substack.com/p/some-slug
 *   https://custom.domain.example/p/...
 * Derive the primary (non-guest) byline handle from homepage_data.
 */
export async function extractHandleFromPublicationUrl(input: string): Promise<string | null> {
  const url = normalizeUrl(input);
  if (!url) return null;
  try {
    const base = `${url.protocol}//${url.host}`;
    const res = await fetch(`${base}/api/v1/homepage_data`, {
      headers: FETCH_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { newPosts?: Array<{ publishedBylines?: Array<{ handle?: string; is_guest?: boolean }> }> };
    const posts = data?.newPosts;
    if (!Array.isArray(posts) || posts.length === 0) return null;
    for (const post of posts) {
      const bylines = post?.publishedBylines ?? [];
      const primary =
        bylines.find((b) => b?.handle && !b?.is_guest) ??
        bylines.find((b) => b?.handle);
      if (primary?.handle) return primary.handle;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getSubstackProfile(handle: string): Promise<SubstackProfile | null> {
  try {
    const res = await fetch(
      `https://substack.com/api/v1/user/${encodeURIComponent(handle)}/public_profile`,
      { headers: FETCH_HEADERS, cache: "no-store" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<SubstackProfile> & Record<string, unknown>;
    if (!data || typeof data.id !== "number" || typeof data.handle !== "string") {
      return null;
    }
    return { id: data.id, name: (data.name as string) ?? data.handle, handle: data.handle };
  } catch {
    return null;
  }
}

export async function validateProfileUrl(url: string): Promise<SubstackProfile | null> {
  let handle = extractHandleFromProfileUrl(url);
  if (!handle) handle = await extractHandleFromPublicationUrl(url);
  if (!handle) return null;
  return getSubstackProfile(handle);
}
