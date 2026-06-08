import type { Metadata } from 'next';
import { Nunito, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import Navbar from '@/components/ui/Navbar';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'HushTales',
  description: 'Personalised animated bedtime stories in mum\'s voice',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0f0f0f] text-[#faf7f2]">
        <Providers>
          <Navbar />
          {/* pt-16 offsets the fixed navbar; full-screen hero pages use negative margin to reclaim it */}
          <main className="flex-1 pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
