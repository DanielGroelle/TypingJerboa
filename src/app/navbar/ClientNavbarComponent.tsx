"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavigationComponent from "../components/NavigationComponent";

export default function ClientNavbarComponent() {
  const pathname = usePathname();

  //conditionally change the link to <NavigationComponent> to cause a page reload if on the same page
  //otherwise use <Link> to preserve soft-navigation
  return (
    <>
    <div className="flex-2 px-6 py-2 text-center">
      {pathname === "/" ? <NavigationComponent name="Home" route="/" className="" /> : <Link href="/">Home</Link>}
    </div>
    <div className="flex-2 px-6 py-2 text-center">
      {pathname === "/learn" ? <NavigationComponent name="Learn" route="/learn" className="" /> : <Link href="/learn">Learn</Link>}
    </div>
    <div className="flex-2 px-6 py-2 text-center">
      {pathname === "/race" ? <NavigationComponent name="Race" route="/race" className="" /> : <Link href="/race">Race</Link>}
    </div>
    <div className="flex-2 px-6 py-2 text-center">
      {pathname === "/stats" ? <NavigationComponent name="Stats" route="/stats" className="" /> : <Link href="/stats">Stats</Link>}
    </div>
    <div className="flex-2 px-6 py-2 text-center">
      {pathname === "/news" ? <NavigationComponent name="News" route="/news" className="" /> : <Link href="/news">News</Link>}
    </div>
    </>
);
}