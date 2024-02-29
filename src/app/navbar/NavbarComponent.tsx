import Link from "next/link";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import LogoutButtonComponent from "./LogoutButtonComponent";

export default async function NavbarComponent() {
  //get token from cookie to check if the user is logged in
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  return (
    <nav className="flex border-solid border-b-2 border-white">
      <div className="flex-2 px-4 py-2 text-center border-solid border-r-2 border-white">
        <Link href="/">TypingJerboa</Link>
      </div>
      <div className="flex-grow px-4 py-2 text-center border-solid border-r-2 border-white">

      </div>
      {await (async ()=>{
        //if user logged in
        if (token !== undefined) {
          const user = await prisma.user.findUnique({
            select: {username: true},
            where: {sessionToken: token.value}
          });
          if (user === null) {
            throw "User not found";
          }
          return (
            <div className="flex">
              <div className="flex-2 px-4 py-2 text-center border-solid border-l-2 border-white">
                {user.username}
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