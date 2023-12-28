"use client"

import { useState, useEffect } from "react";
import { z } from "zod";

const Z_USER = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string()
});
type User = z.infer<typeof Z_USER>;

const Z_RESPONSE = z.object({
  users: z.array(Z_USER)
});

async function getUsers() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/user`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "getUsers failed";
  }

  return response.users;
}

export default function ClientAdminUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(()=>{
    void (async ()=>setUsers(await getUsers()))();
  },[])

  function handleClick(userId: number) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/user`, {
          method: "DELETE",
          body: JSON.stringify({
            id: userId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = users.findIndex((user)=>user.id === userId);
    const newUsers = users.toSpliced(i, 1);

    setUsers([...newUsers])
  }

  return (
    <div>
      Users <br/>
      {users.map((user)=> 
        <div className="border-solid border-white border" key={user.id}>
          id: {user.id}<br/>
          username: {user.username}<br/>
          password: {user.password}
          <button className="border-solid border-red-700 border rounded-lg p-2" onClick={()=>handleClick(user.id)}>X</button>
        </div>
      )}
      {users.length === 0 ? "No users found" : ""}
    </div>
  );
}