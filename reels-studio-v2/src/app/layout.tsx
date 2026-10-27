import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { NavTabs } from "@/components/NavTabs";

export const metadata: Metadata = {
  title: "The Story — Hệ Thống Sản Xuất Video Reels",
  description: "Dựng video Reels 9:16 tự động từ thẻ truyện, hàng đợi theo Page Facebook, Playwright + FFmpeg render daemon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
