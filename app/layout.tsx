import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Punjabi Music | Designed by Anshul Jaiswal",
  description: "Music visualizer",
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}