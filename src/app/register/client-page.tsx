"use client"

import Link from "next/link";
import { FormEvent } from "react";

export default function ClientRegister() {
  function handleRegister(event: FormEvent<HTMLFormElement>) {
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
        await (await fetch(`/api/register`, {
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
        throw "Registration failed";
      }
    })();
  }

  return (
    <div className="">
      Register
      <form className="" onSubmit={handleRegister}>
        <div>
          Username
          <input className="text-black" type="text" id="username" required></input>
        </div>
        <div>
          Password
          <input className="text-black" type="password" id="password" required></input>
        </div>
        <input type="submit" className="border-solid border-white border rounded-lg p-2" value="Register"/>
      </form>

      <Link href="/login">Login</Link>
    </div>
  );
}