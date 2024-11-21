"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const Z_RESPONSE = z.object({
  error: z.string().optional()
});
function handleLogin(username: string, password: string, setError: (error: string) => void, setLoggingIn: (loggingIn: boolean) => void) {
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

    const tryResponse = Z_RESPONSE.safeParse(await response.json());
    
    if (!tryResponse.success) {
      setError("Unknown error, try again later");
      setLoggingIn(false);
      return;
    }

    if (response.status !== 200) {
      setError(tryResponse.data.error ?? "");
      setLoggingIn(false);
      return;
    }

    window.location.href=`/`; //redirect to home
  })();
}

export default function ClientLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [loggingIn, setLoggingIn] = useState(false);

  return (
    <div>
      <h1>Login</h1>
      <form>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Username</p>
          <input className="text-black p-1" type="text" id="username" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUsername(e.target.value)} />
        </div>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Password</p>
          <input className="text-black p-1" type="password" id="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} />
        </div>
        <input type="button" className="border-solid border-white border rounded-lg p-2" disabled={loggingIn} onClick={()=>{
           setLoggingIn(true);
           handleLogin(username, password, setError, setLoggingIn);
        }} value="Login" />
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