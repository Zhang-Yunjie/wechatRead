import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "阅读此刻",
  description: "把阅读中的念头留下来。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
