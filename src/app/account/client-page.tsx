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

export default function ClientAccount() {
  const [primaryLanguageScript, setPrimaryLanguageScript] = useState("");

  useEffect(()=>{
    void (async ()=>{
      const userPreferences = await getPreferences();
      setPrimaryLanguageScript(userPreferences.languageScript.languageScript);
    })();
  }, []);

  return (
    <div>
      Primary Language Script:
      <select name="script" id="script" value={primaryLanguageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
        void (async ()=>await setPreferences(e.target.value))();
        setPrimaryLanguageScript(e.target.value);
      }}>
        {Object.values(LanguageScripts).map(({internal, display})=>(
          <option key={internal} value={internal}>{display}</option>
        ))}
      </select>
      <br/><br/><br/><br/><br/><br/>
      
      <div>
        <h2 className="text-lg">Account Actions</h2>

        <input type="button" className="border-solid border-red-700 border rounded-lg p-2" onClick={() => 1} value="Clear User Data" />
        <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={() => 1} value="Delete Account" />
      </div>
    </div>
  );
}