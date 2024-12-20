import { cookies } from "next/headers";
import Link from "next/link";
import prisma from "@/lib/prisma";
import LogoutButtonComponent from "./LogoutButtonComponent";
import NavigationComponent from "../components/NavigationComponent";
import ClientNavbarComponent from "./ClientNavbarComponent";

export default async function NavbarComponent() {
  //get loginToken from cookie to check if the user is logged in
  const cookieStore = cookies();
  const loginToken = cookieStore.get("loginToken");

  return (
    <nav className="flex border-solid border-b-2 border-white">
      <div className="flex-2 px-4 py-2 text-center border-solid border-r-0 sm:border-r-2 border-white">
        <Link href="/">TypingJerboa</Link>
      </div>

      <ClientNavbarComponent />

      <div className="flex-grow sm:px-4 sm:py-2"></div>

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