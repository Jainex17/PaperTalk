import type { Metadata } from "next";
import "./globals.css";
import { SpaceProvider } from "@/context/SpaceContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

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
