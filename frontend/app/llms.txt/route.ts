import { NextResponse } from "next/server";
import { absoluteUrl, siteConfig } from "@/lib/site";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.name} is a web application for document-grounded AI chat. Users create spaces, upload source material, and ask natural-language questions about that material. Answers are designed to stay grounded in retrieved document chunks and can surface citations.

## Primary

- [Homepage](${absoluteUrl("/")}): Product overview, positioning, core features, workflow, and FAQ for ${siteConfig.name}.

## Product Facts

- Supports PDF, TXT, and Markdown uploads.
- Supports pasted text that can be saved as a document.
- Organizes work into separate document spaces.
- Supports summaries, key findings, bullet points, and follow-up questions.
- Can answer cross-document questions when relevant evidence spans multiple files.

## Optional

- [Login](${absoluteUrl("/login")}): Authentication entry point for returning users.

Authenticated application areas under \`/spaces\`, \`/space/*\`, and \`/auth/*\` are not intended as public discovery content for search engines.
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
