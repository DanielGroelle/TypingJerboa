"use client";

import { User, Z_USER } from "@/js/types";
import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import ItemCardComponent from "../ItemCardComponent";
import PageSelectComponent from "../PageSelectComponent";
import ConfirmationComponent from "../ConfirmationComponent";

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

  const [confirmation, setConfirmation] = useState<(() => void) | null>(null);

  useEffect(()=>{
    void (async ()=>setUsers(await getUsers()))();
  },[]);

  function handleDelete(userId: number) {
    setConfirmation(() => () => {
      void (async ()=>{
        try {
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
    });
  }

  function handleSave(editUser: User) {
    void (async ()=>{
      try {
        const response = Z_USER.parse(await(await fetch(`/api/admin/user/edit`, {
          method: "POST",
          body: JSON.stringify({...editUser}),
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

      <ConfirmationComponent confirmation={confirmation} setConfirmation={setConfirmation} message={"Are you sure? All data for this user will be lost. This action is not reversible!"} />

      <div className="flex justify-between">
        <h1>Users</h1>
        <PageSelectComponent itemsLength={refFilteredUsers.items.length} viewPage={viewPage} setViewPage={setViewPage} itemsPerPage={usersPerPage} />
      </div>

      <div className="flex flex-col overflow-y-auto">
        {refFilteredUsers.items.slice(viewPage * usersPerPage - usersPerPage, viewPage * usersPerPage).map((user)=>
          (<ItemCardComponent
            item={user}
            itemFields={{
              "id": {getter: (user: User) => user.id, editType: null, options: null},
              "username": {getter: (user: User) => user.username, editType: "text", options: null},
              "admin": {getter: (user: User) => String(user.admin), editType: "checkbox", options: null},
              "createdAt": {getter: (user: User) => user.createdAt, editType: null, options: null}
            }}
            editParams={{
              items: users,
              setItems: setUsers,
              saveItem: handleSave
            }}
            deleteItem={handleDelete}
            key={user.id}
          />)
        )}
      </div>
      {refFilteredUsers.items.length === 0 ? "No users found" : ""}
    </div>
  );
}