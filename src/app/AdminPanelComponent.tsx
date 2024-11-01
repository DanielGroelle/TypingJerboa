import Link from "next/link";
import { cookies } from "next/headers";
import { userIsAdmin } from "./api/admin/user/is-admin/route";

export default async function AdminPanelComponent() {
  const cookieStore = cookies();
  const loginToken = cookieStore.get("loginToken");

  if (loginToken === undefined) {
    return;
  }

  const isAdmin = await userIsAdmin(loginToken.value);
  if (!isAdmin) {
    return;
  }

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