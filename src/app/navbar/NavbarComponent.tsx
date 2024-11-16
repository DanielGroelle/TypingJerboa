import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import LogoutButtonComponent from "./LogoutButtonComponent";
import NavigationComponent from "../components/NavigationComponent";

export default async function NavbarComponent() {
  //get loginToken from cookie to check if the user is logged in
  const cookieStore = cookies();
  const loginToken = cookieStore.get("loginToken");

  return (
    <nav className="flex border-solid border-b-2 border-white">
      <div className="flex-2 px-4 py-2 text-center border-solid border-r-2 border-white">
        <Link href="/">TypingJerboa</Link>
      </div>
      
      <div className="flex-2 px-6 py-2 text-center">
        <Link href="/">Home</Link>
      </div>
      <div className="flex-2 px-6 py-2 text-center">
        <Link href="/learn">Learn</Link>
      </div>
      <div className="flex-2 px-6 py-2 text-center">
        <Link href="/race">Race</Link>
      </div>
      <div className="flex-2 px-6 py-2 text-center">
        <Link href="/stats">Stats</Link>
      </div>
      <div className="flex-2 px-6 py-2 text-center">
        <Link href="/news">News</Link>
      </div>

      <div className="flex-grow px-4 py-2 border-solid border-r-2 border-white">
      </div>
      {await (async ()=>{
        //if user logged in
        if (loginToken !== undefined) {
          const user = await prisma.user.findUnique({
            select: {username: true},
            where: {loginToken: loginToken.value}
          });
          if (user === null) {
            throw "User not found";
          }
          return (
            <div className="flex">
              <div className="flex-2 px-4 py-2 text-center border-solid border-l-2 border-white">
                <NavigationComponent className="" name={user.username} route="/account" />
              </div>
              <div className="flex-2 px-4 py-2 text-center">
                <LogoutButtonComponent />
              </div>
            </div>
          );
        }
        //if user not logged in
        else {
          return (
            <>
              <div className="flex-2 px-4 py-2 text-center border-solid border-l-2 border-white">
                <Link href="/register">Register</Link>
              </div>
              <div className="flex-2 px-4 py-2 text-center border-solid border-l-2 border-white">
                <Link href="/login">Login</Link>
              </div>
            </>
          );
        }
      })()}
    </nav>
  );
}