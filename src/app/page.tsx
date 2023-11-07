import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main>
        <div className="pb-4">
            <div className="text-2xl">
                <a href="#">Learn</a>
            </div>
            <div>
                Follow a step-by-step set of lessons that teach you how to type in a given language
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <a href="#">Race</a>
            </div>
            <div>
                Test your typing abilities by participating in a timed race against the clock
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <a href="#">Stats</a>
            </div>
            <div>
                View stats about yourself
            </div>
        </div >
        <div className="pb-4">
            <div className="text-2xl">
                <a href="#">News</a>
            </div>
            <div>
                Latest news about the site
            </div>
        </div>
    </main>
  )
}