import Link from "next/link";

export default function Home() {
  return (
    <main>
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/learn">Learn</Link>
            </div>
            <div>
                Follow a step-by-step set of lessons that teach you how to type in a chosen language
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/race">Race</Link>
            </div>
            <div>
                Test your typing abilities by participating in a timed race against the clock
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/stats">Stats</Link>
            </div>
            <div>
                View stats about yourself
            </div>
        </div >
        <div className="pb-4">
            <div className="text-2xl">
                <Link href="/news">News</Link>
            </div>
            <div>
                Latest news about the site
            </div>
        </div>
    </main>
  )
}