import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MY MUSIC HUB - Personal Music Hub',
  description: 'Cyberpunk Lo-Fi Personal Music Player aggregating YouTube, SoundCloud and audio streams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-[#09090b] text-white flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
