import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart/context';
import { FavoritesProvider } from '@/lib/favorites/context';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Costura & Ponto — Aviamentos e Acessórios',
  description: 'Aviamentos, linhas de costura, fios de overloque, calcadores especiais, aparelhos industriais e ferramentas de corte. Envio rápido para todo o Brasil.',
  icons: {
    icon: '/favicon-32x32.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#fcfaf7] text-stone-800 min-h-screen flex flex-col antialiased selection:bg-[#f7ece8] selection:text-[#a34839]`}>
        <FavoritesProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <Footer />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  );
}

