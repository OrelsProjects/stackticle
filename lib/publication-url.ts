// Resolves the newsletter base URL the extension expects.
// Prefers custom_domain when present, otherwise uses subdomain.substack.com.
export function publicationBaseUrl(pub: {
  subdomain: string;
  customDomain?: string | null;
}): string {
  if (pub.customDomain) return `https://${pub.customDomain}`;
  return `https://${pub.subdomain}.substack.com`;
}
