"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";

const Z_RESPONSE = z.object({
  error: z.string().optional()
});
function handleLogin(event: FormEvent<HTMLFormElement>, username: string, password: string, setError: (error: string) => void) {
  event.preventDefault();

  void (async()=>{
    const response = await fetch(`/api/login`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        unhashedPassword: password
      }),
      mode: "cors",
      cache: "default"
    });

    const tryRequest = Z_RESPONSE.safeParse(await response.json());
    
    if (!tryRequest.success) {
      setError("Unknown error, try again later");
      return;
    }

    if (response.status !== 200) {
      setError(tryRequest.data.error ?? "");
      return;
    }

    window.location.href=`${window.location.protocol}//${window.location.host}/`; //redirect to home
  })();
}

export default function ClientLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={e => handleLogin(e, username, password, setError)}>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Username</p>
          <input className="text-black" type="text" id="username" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUsername(e.target.value)} />
        </div>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Password</p>
          <input className="text-black" type="password" id="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} />
        </div>
        <input type="submit" className="border-solid border-white border rounded-lg p-2" value="Login"/>
      </form>

      <div className="border-solid border-red-500 border rounded-lg w-fit p-2 mt-2" hidden={typeof error !== "string"}>
        {error}
      </div>

      <div className="mt-8">
        <span>Register an account to save your progress!</span>
        <Link className="underline p-1 ml-1" href="/register">Register</Link>
      </div>
    </div>
  );
}