import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TypingJerboa',
  description: 'Learn to type in other languages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="flex border-solid border-2 border-b-white">
          <div className="flex-1 border-solid border-2 border-x-white">
            TypingJerboa
          </div>
          <div className="flex-1 border-solid border-2 border-x-white">
            0 Gems
          </div>
          <div className="flex-1 border-solid border-2 border-x-white">
            Login
          </div>
        </header>

        {children}
      </body>
    </html>
  )
};