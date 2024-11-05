import Link from "next/link";
import AdminPanelComponent from "./AdminPanelComponent";
import NavigationComponent from "./NavigationComponent";

export default function Home() {
  return (
    <main>
        <div className="pb-4">
            <div className="text-2xl">
              <NavigationComponent className="" name="Learn" route="/learn" />
              {/* clients browser caches page and soft-navigates with <Link>.
              this means if user changes a preference and navigates back to /learn etc, it will be cached and not display an updated page,
              so instead we use this custom component that does a window.location.href to force a reload on the client side.
              TODO: might be worth to find a way to conditionally render either a <Link> or <NavigationComponent> depending if the users preference has been changed */}
            </div>
            <div>
                Follow a step-by-step set of lessons that teach you how to type in a chosen language
            </div>
        </div>
        <div className="pb-4">
            <div className="text-2xl">
                <NavigationComponent className="" name="Race" route="/race" />
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
        <AdminPanelComponent />
    </main>
  )
}