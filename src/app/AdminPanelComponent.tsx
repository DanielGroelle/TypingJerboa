import Link from "next/link";
import { cookies } from "next/headers";
import { userIsAdmin } from "./api/admin/user/route";

export default async function AdminPanelComponent() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (token === undefined) {
    return <></>;
  }

  const isAdmin = await userIsAdmin(token.value);

  if (isAdmin) {
    return (
      <div className="pb-4">
        <div className="text-2xl">
            <Link href="/admin">Admin</Link>
        </div>
        <div>
            Administrator panel
        </div>
      </div>
    );
  }
  else {
    return <></>;
  }
}