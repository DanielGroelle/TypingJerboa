"use client"

import Link from "next/link";
import { FormEvent } from "react";

export default function ClientLogin() {
  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

    void (async()=>{
      try {
        await (await fetch(`/api/login`, {
          method: "POST",
          body: JSON.stringify({
            username: username,
            unhashedPassword: password
          }),
          mode: "cors",
          cache: "default"
        })).json();
      }
      catch(e: unknown) {
        throw "Login failed";
      }
    })();
  }

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