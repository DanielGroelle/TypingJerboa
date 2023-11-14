import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from "next/link";

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
    <html lang="en" className="h-full">
      <body className={`flex flex-col h-full ${inter.className}`}>
        <header className="flex border-solid border-b-2 border-white">
          <div className="flex-2 px-4 py-2 text-center border-solid border-r-2 border-white">
            <Link href="/">TypingJerboa</Link>
          </div>
          <div className="flex-1 px-4 py-2 text-center border-solid border-x-2 border-white">

          </div>
          <div className="flex-2 px-4 py-2 text-center border-solid border-l-2 border-white">
            <Link href="/login">Register</Link>
          </div>
        </header>

        <div className="grow py-4 sm:px-16 px-8">
          {children}
        </div>

        <footer className="flex border-solid border-t-2 border-t-white py-4">
          <div className="flex-1 text-center border-solid border-white">
            <Link href="/about">About</Link>
          </div>
          <div className="flex-1 text-center text-sm border-solid border-white">
            Copyright whatever
          </div>
        </footer>
      </body>
    </html>
  )
};