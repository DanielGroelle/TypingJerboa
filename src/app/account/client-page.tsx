"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { z } from "zod";
import { useEffect, useState } from "react";

const Z_RESPONSE = z.object({
  preferences: z.object({
    languageScript: z.object({
      id: z.number(),
      languageScript: z.string()
    })
  })
});
async function getPreferences() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/user/preferences`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log(e);
    throw "getPreferences failed";
  }

  return response.preferences;
}

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
      console.log("hi")
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
      console.log("hi")
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
      window.location.href=`${window.location.protocol}//${window.location.host}/`; //redirect to home
    }
    else {
      setError("Unable to successfully delete account!");
      setSuccess(null);
    }
  })();
}

export default function ClientAccount() {
  const [primaryLanguageScript, setPrimaryLanguageScript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const userPreferences = await getPreferences();
      setPrimaryLanguageScript(userPreferences.languageScript.languageScript);
    })();
  }, []);

  //TODO: have a popup asking "are you sure?"

  return (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="border-solid border-red-500 border rounded-lg p-2" hidden={typeof error !== "string"}>
          {error}
        </div>

        <div className="border-solid border-green-500 border rounded-lg p-2" hidden={typeof success !== "string"}>
          {success}
        </div>

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
        <h2 className="text-lg">Account Actions</h2>
        <div className="flex flex-col w-1/5">
          <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1" onClick={()=>clearLessons(setError, setSuccess)} value="Clear Lesson Data" />
          <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1" onClick={()=>clearRaces(setError, setSuccess)} value="Clear Race Data" />
          <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 my-1" onClick={()=>deleteAccount(setError, setSuccess)} value="Delete Account" />
        </div>
      </div>
    </div>
  );
}