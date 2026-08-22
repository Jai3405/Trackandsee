import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const displaySerif = localFont({
  src: './fonts/TcjimmyserifproBold.otf',
  variable: '--font-display-serif',
  weight: '700',
});
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displaySerif.variable} ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
