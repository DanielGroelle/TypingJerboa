"use client";

import { useState } from "react";

function handleLogout() {
  void fetch(`/api/logout`, {
    method: "GET",
    mode: "cors",
    cache: "default"
  }).then(()=>{
    location.reload();
  });
}

export default function LogoutButtonComponent() {
  const [loggingOut, setLoggingOut] = useState(false);

  return (
    <input type="button" disabled={loggingOut} onClick={()=>{
      setLoggingOut(true);
      handleLogout();
    }} value="Logout" />
  );
}