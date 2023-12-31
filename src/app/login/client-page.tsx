"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

function handleLogin(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const router = useRouter();

  //get username and password from form
  const usernameSelector = document.querySelector("#username");
  const passwordSelector = document.querySelector("#password");
  if (!(usernameSelector instanceof HTMLInputElement)) {
    throw "Username selector was not an HTMLInputElement";
  }
  if (!(passwordSelector instanceof HTMLInputElement)) {
    throw "Password selector was not an HTMLInputElement";
  }

  const username = usernameSelector.value;
  const password = passwordSelector.value;

  void fetch(`/api/login`, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      unhashedPassword: password
    }),
    mode: "cors",
    cache: "default"
  })
  .then(()=>router.refresh());
}

export default function ClientLogin() {
  return (
    <div className="">
      Login
      <form className="" onSubmit={handleLogin}>
        <div>
          Username
          <input className="text-black" type="text" id="username" required></input>
        </div>
        <div>
          Password
          <input className="text-black" type="password" id="password" required></input>
        </div>
        <input type="submit" className="border-solid border-white border rounded-lg p-2" value="Login"/>
      </form>

      <Link href="/register">Register</Link>
    </div>
  );
}