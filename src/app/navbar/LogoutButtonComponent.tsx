"use client"

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

export default async function LogoutButtonComponent() {
  const router = useRouter();
  return (
    <button onClick={()=>handleLogout(router)}>Logout</button>
  );
}