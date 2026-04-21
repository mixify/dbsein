import type { Metadata } from "next";
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
      <head>
        <link rel="stylesheet" href="/xp.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
