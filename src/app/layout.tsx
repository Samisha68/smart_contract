// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Import for wallet adapter CSS
import { WalletContextProvider } from '../components/walletContextProvider';

// Initialize the Inter font with Latin subset for better performance
const inter = Inter({ subsets: ['latin'] });

// Define metadata for the application
export const metadata: Metadata = {
  title: 'Bijlee Token App',
  description: 'A decentralized application for Bijlee token transactions on Solana',
  keywords: 'Solana, Blockchain, Cryptocurrency, Token, DApp',
  // Add Open Graph metadata for better social sharing
  openGraph: {
    title: 'Bijlee Token App',
    description: 'A decentralized application for Bijlee token transactions on Solana',
    type: 'website',
    locale: 'en_US',
    url: 'https://your-app-url.com',
  },
};

// Root layout component that wraps all pages
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-gray-50`}>
        {/* Dynamic viewport meta tag for better mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* The main application wrapper */}
        <div className="min-h-screen flex flex-col">
          {/* Header section */}
          <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Bijlee Token
                </h1>
                {/* Wallet connection button will be rendered here by child components */}
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Wrap children with WalletContextProvider for Solana wallet functionality */}
              <WalletContextProvider>
                {children}
              </WalletContextProvider>
            </div>
          </main>

          {/* Footer section */}
          <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Bijlee Token. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>

        {/* Add any global scripts or third-party integrations here */}
      </body>
    </html>
  );
}