import ClientNews from "./client-page";
import { userIsAdmin } from "../api/admin/user/is-admin/route";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function News() {
  const isAdmin = await userIsAdmin(cookies().get("loginToken")?.value ?? "");
  const AdminLink = (<><Link className="border-solid border-blue-600 border rounded-lg p-2" href="/admin/news">Admin News Panel</Link><br/><br/></>);

  return (
    <ClientNews AdminLink={isAdmin ? AdminLink : null}/>
  );
}