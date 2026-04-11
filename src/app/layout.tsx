import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'StockFlow — Inventory Management',
    template: '%s | StockFlow',
  },
  description: 'Real-time inventory tracking and management for modern businesses.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'StockFlow',
  },
  applicationName: 'StockFlow',
  keywords: ['inventory management', 'stock tracking', 'warehouse management', 'inventory software', 'SaaS', 'product management', 'low stock alerts', 'business inventory', 'StockFlow'],
  authors: [{ name: 'Phearun Lykashing' }],
  creator: 'Phearun Lykashing',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://stock-flow-six-vert.vercel.app',
    siteName: 'StockFlow',
    title: 'StockFlow — Free Inventory Management Software',
    description: 'Track your stock, manage products, get low stock alerts, and grow your business. Free to start, no credit card required.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StockFlow — Free Inventory Management Software',
    description: 'Track your stock, manage products, get low stock alerts. Free to start.',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
