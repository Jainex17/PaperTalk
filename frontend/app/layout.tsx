import type { Metadata } from "next";
import "./globals.css";
import { SpaceProvider } from "@/context/SpaceContext";
import { GlobalProvider } from "@/context/GlobalContext";

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
      <body
        className={`dark`}
      >
        <GlobalProvider>
          <SpaceProvider>
            {children}
          </SpaceProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
