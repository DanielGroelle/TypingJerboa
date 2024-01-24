import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import NavbarComponent from "./navbar/NavbarComponent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TypingJerboa",
  description: "Learn to type in other languages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`flex flex-col h-full ${inter.className}`}>
        <NavbarComponent />

        <div className="grow py-4 sm:px-16 px-8">
          {children}
        </div>

        <footer className="flex border-solid border-t-2 border-t-white py-4">
          <div className="flex-1 text-center">
            <Link href="/about">About</Link>
          </div>
          <div className="flex-1 text-center">
            <Link target="_blank" href="https://github.com/DanielGroelle/TypingJerboa/issues">Report an Issue</Link>
          </div>
          <div className="flex-1 text-center text-sm">
            <Link href="/license">Copyright & Licensing</Link>
          </div>
          {/* <div className="flex-1 text-center text-sm">
            <label htmlFor="display-language" className="m-1">Display Language:</label>
            <select name="display-language" id="display-language" className="bg-black border-solid border-2 border-white rounded-lg">
              <option value="english">English</option>
              <option value="russian">Russian</option>
            </select>
          </div> */}
        </footer>
      </body>
    </html>
  );
}