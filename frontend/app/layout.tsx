import type { Metadata } from "next";
import "./globals.css";
import { SpaceProvider } from "@/context/SpaceContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { siteConfig, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.defaultTitle,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  openGraph: {
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`dark`}
      >
        <AuthProvider>
          <SpaceProvider>
            {children}
            <Toaster position="top-right" theme="dark" richColors />
          </SpaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
