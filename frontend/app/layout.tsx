import type { Metadata } from "next";
import "./globals.css";
import { SpaceProvider } from "@/context/SpaceContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "PaperTalk",
  description: "AI-powered document chat interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=bespoke-serif@300,301,400,401,500,501,700,701,800&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`dark`}
      >
        <AuthProvider>
          <SpaceProvider>
            {children}
          </SpaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
