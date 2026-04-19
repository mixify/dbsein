import type { Metadata } from "next";
import "98.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "DBSein",
  description: "review & log",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
