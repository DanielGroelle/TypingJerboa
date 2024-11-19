"use client";

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
  return (
    <input type="button" onClick={handleLogout} value="Logout" />
  );
}