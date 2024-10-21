"use client";

import { User, Z_USER } from "@/js/types";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";

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
  const [viewPage, setViewPage] = useState(1);
  const usersPerPage = 25;

  const [editUser, setEditUser] = useState<User | null>(null);

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
            admin: adminChecked,
            createdAt: null
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

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    if (editUser === null) throw "Edit User is null!";
  
    void (async ()=>{
      try{
        const response = Z_USER.parse(await(await fetch(`/api/admin/user/edit`, {
          method: "POST",
          body: JSON.stringify(editUser),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        const userIndex = users.findIndex((user)=>user.id === response.id);
        users[userIndex] = response;
  
        setUsers([...users]);
      }
      catch(e: unknown) {
        throw "Edit failed";
      }
    })();
    
    setEditUser(null);
  }

  const refFilteredUsers: {items: User[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<User>({
    items: users,
    refFilteredItems: refFilteredUsers,
    selectFilters: {
      roles: {
        getter: (user) => user.admin ? "admin" : "user",
        options: ["admin", "user"]
      }
    },
    filters: {
      "id": { getter: (user: User) => user.id },
      "username": { getter: (user: User) => user.username },
      "createdAt": { getter: (user: User) => new Date(user.createdAt) }
    },
    setViewPage: setViewPage,
    deleteManyItems: null
  });

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <div className="flex justify-between">
        <h1>Users</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredUsers.items.length / usersPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {refFilteredUsers.items.slice(viewPage * usersPerPage - usersPerPage, viewPage * usersPerPage).map((user)=>
          <div className="flex border-solid border-white border" key={user.id}>
            {
              editUser?.id === user.id ?
              <form onSubmit={handleSave}>
                id: {editUser.id}<br/>
                <div className="flex">
                  <span>username:</span>
                  <input type="text" id="username-input" className="w-full" value={editUser.username} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                    setEditUser({...editUser, username: e.target.value});
                  }}/><br/>
                </div>
                <div className="flex justify-between">
                  <div>
                    <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setEditUser(null)} value="Cancel" />
                    <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Save" />
                  </div>
                  <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(editUser.id)} value="X" />
                </div>
              </form>
              :
              <>
              <div className="flex-1">
                id: {user.id}<br/>
                username: {user.username}<br/>
                admin: {String(user.admin)}
                <input type="checkbox" checked={user.admin} onChange={(event)=>handleAdminCheckbox(event, user.id)}></input>
                <br/>
                created at: {user.createdAt}
              </div>
              <div>
                <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setEditUser(user)} value="Edit" />
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(user.id)} value="X" />
              </div>
              </>
            }
          </div>
        )}
      </div>
      {users.length === 0 ? "No users found" : ""}
    </div>
  );
}