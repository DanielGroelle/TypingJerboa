"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { z } from "zod";
import { useState } from "react";

const Z_RESPONSE = z.object({
  preferences: z.object({
    languageScript: z.object({
      id: z.number(),
      languageScript: z.string()
    })
  })
});
async function setPreferences(languageScript: string) {
  try {
    Z_RESPONSE.parse(await (await fetch(`/api/user/preferences`, {
      method: "POST",
      body: JSON.stringify({languageScript}),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "setPreferences failed";
  }
}

const Z_DELETE_RESPONSE = z.object({
  success: z.boolean()
});
function clearLessons(setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void (async ()=>{
    const tryRequest = Z_DELETE_RESPONSE.safeParse(await (await fetch(`/api/user/lessons`, {
      method: "DELETE",
      mode: "cors",
      cache: "default"
    })).json());

    if (tryRequest.success) {
      setSuccess("Successfully cleared user lesson data.");
      setError(null);
    }
    else {
      setError("Unable to successfully clear lesson data!");
      setSuccess(null);
    }
  })();
}

function clearRaces(setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void (async ()=>{
    const tryRequest = Z_DELETE_RESPONSE.safeParse(await (await fetch(`/api/user/races`, {
      method: "DELETE",
      mode: "cors",
      cache: "default"
    })).json());

    if (tryRequest.success) {
      setSuccess("Successfully cleared user race data.");
      setError(null);
    }
    else {
      setError("Unable to successfully clear race data!");
      setSuccess(null);
    }
  })();
}

function deleteAccount(setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void (async ()=>{
    const tryRequest = Z_DELETE_RESPONSE.safeParse(await (await fetch(`/api/user`, {
      method: "DELETE",
      mode: "cors",
      cache: "default"
    })).json());

    if (tryRequest.success) {
      window.location.href=`/`; //redirect to home
    }
    else {
      setError("Unable to successfully delete account!");
      setSuccess(null);
    }
  })();
}

const Z_PASSWORD_RESPONSE = z.object({
  error: z.string().optional()
});
function updatePassword(
  currentPassword: string,
  newPassword: string,
  confirmNewPassword: string,
  setError: (error: string | null) => void,
  setSuccess: (success: string | null) => void,
  setPasswordUpdated: (passwordUpdated: boolean) => void
) {
  if (confirmNewPassword !== newPassword) {
    setError("Passwords do not match!");
    setSuccess(null);
    return;
  }

  void (async()=>{
    const response = await fetch(`/api/user`, {
      method: "POST",
      body: JSON.stringify({
        unhashedCurrentPassword: currentPassword,
        unhashedNewPassword: newPassword
      }),
      mode: "cors",
      cache: "default"
    });

    const tryResponse = Z_PASSWORD_RESPONSE.safeParse(await response.json());
    
    setPasswordUpdated(false);
    if (!tryResponse.success) {
      setError("Unknown error, try again later");
      setSuccess(null);
      return;
    }

    if (response.status !== 200) {
      setError(tryResponse.data.error ?? "");
      setSuccess(null);
      return;
    }

    setSuccess("Successfully updated password.");
    setError(null);
  })();
}

export default function ClientAccount({languageScriptPreference}: {languageScriptPreference: string | undefined}) {
  const [primaryLanguageScript, setPrimaryLanguageScript] = useState(languageScriptPreference ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [passwordUpdated, setPasswordUpdated] = useState(false);

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        {
          confirmation ?
          <div className="fixed left-0 top-0 w-full h-full bg-neutral-950/50 flex justify-center items-center">
            <div className="absolute border-solid border-white border rounded-lg p-2 text-center">
              <p className="mb-3">Are you sure? This action is not reversible!</p>
              <div className="flex">
                <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 mr-2" value="Confirm" onClick={()=>{
                  if (confirmation === "clearLessons") clearLessons(setError, setSuccess);
                  if (confirmation === "clearRaces") clearRaces(setError, setSuccess);
                  if (confirmation === "deleteAccount") deleteAccount(setError, setSuccess);
                  setConfirmation(null);
                }} />
                <input type="button" className="border-solid border-white border-2 rounded-lg p-2" onClick={() => {
                  setConfirmation(null);
                }} value="Cancel" />
              </div>
            </div>
          </div>
          :
          ""
        }

        <h2 className="text-lg">Preferences</h2>
        <div>
          <span>Primary Language Script:</span>
          <select name="script" id="script" value={primaryLanguageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
            void (async ()=>await setPreferences(e.target.value))();
            setPrimaryLanguageScript(e.target.value);
          }}>
            {Object.values(LanguageScripts).map(({internal, display})=>(
              <option key={internal} value={internal}>{display}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="border-solid border-red-500 border rounded-lg w-fit p-2 mb-2" hidden={typeof error !== "string"}>
          {error}
        </div>

        <div className="border-solid border-green-500 border rounded-lg w-fit p-2 mb-2" hidden={typeof success !== "string"}>
          {success}
        </div>

        <h2 className="text-lg">Account Actions</h2>
        <div className="flex flex-col w-fit sm:w-1/2">
          <form>
            <div className="sm:flex mb-1">
              <p style={{width: "9.5rem"}}>Current Password</p>
              <input className="text-black p-1" type="password" id="current-password" required value={currentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setCurrentPassword(e.target.value)} />
            </div>
            <div className="sm:flex mb-1">
              <p style={{width: "9.5rem"}}>New Password</p>
              <input className="text-black p-1" type="password" id="new-password" required value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setNewPassword(e.target.value)} />
            </div>
            <div className="sm:flex mb-1">
              <p style={{width: "9.5rem"}}>Confirm New Password</p>
              <input className="text-black p-1" type="password" id="confirm-new-password" required value={confirmNewPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setConfirmNewPassword(e.target.value)} />
            </div>
            <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2 my-1" disabled={passwordUpdated} onClick={()=>{
              setPasswordUpdated(true);
              updatePassword(currentPassword, newPassword, confirmNewPassword, setError, setSuccess, setPasswordUpdated);
            }} value="Update Password" />
          </form>

          <div className="w-fit sm:w-1/2">
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1 w-full" onClick={()=>setConfirmation("clearLessons")} value="Clear Lesson Data" />
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1 w-full" onClick={()=>setConfirmation("clearRaces")} value="Clear Race Data" />
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1 w-full" onClick={()=>setConfirmation("deleteAccount")} value="Delete Account" />
          </div>
        </div>
      </div>
    </div>
  );
}