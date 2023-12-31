"use client"

import { useRouter } from "next/navigation";

function handleLogout() {
  const router = useRouter();
  
  void fetch(`/api/logout`, {
    method: "GET",
    mode: "cors",
    cache: "default"
  }).then(()=>{
    router.refresh();
  });
}

export default async function LogoutButtonComponent() {
  return (
    <button onClick={handleLogout}>Logout</button>
  );
}