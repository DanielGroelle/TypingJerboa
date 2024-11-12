"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { z } from "zod";

const Z_RESPONSE = z.object({
  error: z.string().optional()
});
function handleRegister(event: FormEvent<HTMLFormElement>, username: string, password: string, confirmPassword: string, setError: (error: string) => void) {
  event.preventDefault();

  if (confirmPassword !== password) {
    setError("Passwords do not match!");
    return;
  }

  void (async()=>{
    const response = await fetch(`/api/register`, {
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
      return;
    }

    if (response.status !== 200) {
      setError(tryResponse.data.error ?? "");
      return;
    }

    window.location.href=`/login`; //redirect to login
  })();
}

export default function ClientRegister() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={e => handleRegister(e, username, password, confirmPassword, setError)}>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Username</p>
          <input className="text-black p-1" type="text" id="username" required value={username} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUsername(e.target.value)} />
        </div>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Password</p>
          <input className="text-black p-1" type="password" id="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)} />
        </div>
        <div className="flex mb-1">
          <p style={{width: "5.5rem"}}>Confirm Password</p>
          <input className="text-black p-1" type="password" id="confirm-password" required value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setConfirmPassword(e.target.value)} />
        </div>
        <input type="submit" className="border-solid border-white border rounded-lg p-2" value="Register Account"/>
      </form>

      <div className="border-solid border-red-500 border rounded-lg w-fit p-2 mt-2" hidden={typeof error !== "string"}>
        {error}
      </div>

      <div className="mt-8">
        <span>Already have an account?</span>
        <Link className="underline p-1 ml-1" href="/login">Login</Link>
      </div>
    </div>
  );
}