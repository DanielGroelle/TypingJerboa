"use client";

import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function handleLogout(router: AppRouterInstance) {
  void fetch(`/api/logout`, {
    method: "GET",
    mode: "cors",
    cache: "default"
  }).then(()=>{
    router.refresh();
  });
}

export default function LogoutButtonComponent() {
  const router = useRouter();
  return (
    <input type="button" onClick={()=>handleLogout(router)} value="Logout" />
  );
}