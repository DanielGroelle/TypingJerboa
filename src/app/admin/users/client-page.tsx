"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { z } from "zod";

const Z_USER = z.object({
  id: z.number(),
  username: z.string(),
  admin: z.boolean()
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
  },[]);

  function handleDelete(userId: number) {
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

    setUsers([...newUsers]);
  }

  function handleAdminCheckbox(event: ChangeEvent<HTMLInputElement>, userId: number) {
    const adminChecked = event.currentTarget.checked;
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/user/edit`, {
          method: "POST",
          body: JSON.stringify({
            id: userId,
            username: null,
            admin: adminChecked
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Update failed";
      }
    })();

    const newUsers = users.map((user)=>{
      if (user.id === userId) {
        return {...user, admin: !user.admin};
      }
      return {...user};
    });
    setUsers(newUsers);
  }

  return (
    <div>
      Users <br/>
      {users.map((user)=> 
        <div className="flex border-solid border-white border" key={user.id}>
          <div className="flex-1">
            id: {user.id}<br/>
            username: {user.username}<br/>
            admin: {String(user.admin)}
            <input type="checkbox" checked={user.admin} onChange={(event)=>handleAdminCheckbox(event, user.id)}></input>
          </div>
          <div>
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(user.id)} value="X" />
          </div>
        </div>
      )}
      {users.length === 0 ? "No users found" : ""}
    </div>
  );
}