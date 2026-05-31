const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeSiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Site URL cannot be empty.");
  }

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

function resolveSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  if (configuredUrl) {
    return normalizeSiteUrl(configuredUrl);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Missing site URL. Set NEXT_PUBLIC_SITE_URL for production builds so sitemap, robots, canonicals, and llms.txt use your real domain."
    );
  }

  return FALLBACK_SITE_URL;
}

export const siteUrl = resolveSiteUrl();

export const siteConfig = {
  name: "PaperTalk",
  defaultTitle: "PaperTalk | Talk with your documents",
  description:
    "PaperTalk is an AI-powered document chat app for uploading reports, contracts, notes, and research files, then asking grounded questions with source-backed answers.",
  keywords: [
    "AI document chat",
    "document question answering",
    "RAG",
    "PDF chat",
    "research assistant",
    "contract analysis",
    "report summarization",
    "document citations",
  ],
};

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}
