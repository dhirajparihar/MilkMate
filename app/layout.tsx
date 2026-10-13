import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Doodh Dost — Milk Distributor App',
  description: 'Your daily milk business, made simple. Order taking, early-morning deliveries, returns, stock ledger, billing, and UPI/Cash tracking.',
  openGraph: {
    title: 'Doodh Dost — Milk Distributor App',
    description: 'Your daily milk business, made simple. Order taking, deliveries, returns, and billing.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Doodh Dost — Milk Distributor App',
    description: 'Your daily milk business, made simple.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#246B4B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="bg-[#F8FAF8] text-[#202820] antialiased selection:bg-[#B9E6C8] selection:text-[#246B4B]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
