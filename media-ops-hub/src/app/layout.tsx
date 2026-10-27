import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Media Ops Hub - Vận Hành 4 Fanpage Facebook & Telegram Bot 24/7',
  description: 'Trung tâm chỉ huy vận hành Reels Pháp - Hà Lan và kéo traffic AdSense thestorypress.online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark h-full bg-slate-950 text-slate-100">
      <body className="h-full flex overflow-hidden font-sans antialiased bg-slate-950">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
