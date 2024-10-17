import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";
import { useEffect, useState } from "react";

const Z_RESPONSE = z.object({
  startTime: z.string().nullable(),
  paragraphText: z.string().nullable(),
  raceId: z.string().nullable()
});
async function startRace(
  languageScript: string,
  setRaceInfo: (raceParagraph: string, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) => void,
  setError: (error: string | null) => void
) {
  let response;
  try {
    //fetch startTime and paragraphText
    response = Z_RESPONSE.parse(await (await fetch(`/api/race/start`, {
      method: "POST",
      body: JSON.stringify({languageScript}),
      mode: "cors",
      cache: "default"
    })).json());
    
    //if no paragraph was found set the error message
    if (response.raceId === null || response.paragraphText === null || response.startTime === null) {
      setError("No paragraph for that language script found");
    }
    //if paragraph was found set the race info to start the race
    else {
      setError(null);
      setRaceInfo(response.paragraphText, new Date(response.startTime), response.raceId, true, false);
    }
  }
  catch(e: unknown) {
    throw "startRace failed";
  }
}

const Z_ME_RESPONSE = z.object({
  user: z.object({
    id: z.number(),
    username: z.string(),
    createdAt: z.string()
  })
});
const Z_LANGUAGESCRIPT_RESPONSE = z.object({
  preferences: z.object({
    languageScript: z.object({
      id: z.number(),
      languageScript: z.string()
    })
  })
});
async function getLanguageScript() {
  const tryRequest = Z_ME_RESPONSE.safeParse(await (await fetch(`/api/me`, {
    method: "GET",
    mode: "cors",
    cache: "default"
  })).json());

  if (!tryRequest.success) {
    return null;
  }

  let response;
  try {
    response = Z_LANGUAGESCRIPT_RESPONSE.parse(await (await fetch(`/api/user/preferences`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log(e);
    throw "getLanguageScript failed";
  }

  return response.preferences.languageScript.languageScript;
}

export default function ScriptSelectionComponent({setRaceInfo}: { setRaceInfo: (
  raceParagraph: string,
  startTime: Date | null,
  raceId: string | null,
  scriptSelectionHidden: boolean,
  timerHidden: boolean
) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [languageScript, setLanguageScript] = useState("");

  useEffect(()=>{
    void (async ()=>{
      const languageScript = await getLanguageScript();
      if (languageScript) setLanguageScript(languageScript);
    })();
  }, []);

  return (
    <div>
      <div className="border-solid border-red-500 border rounded-lg p-2" hidden={typeof error !== "string"}>
        {error}
      </div>
      Select the script you&apos;d like to use
      <div className="flex">
        <select name="script" id="script" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setLanguageScript(e.target.value)}>
          {Object.values(LanguageScripts).map(({internal, display})=>(
            <option key={internal} value={internal}>{display}</option>
          ))}
        </select>
        <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {
          void (async ()=>await startRace(languageScript, setRaceInfo, setError))();
        }} value="Start Race"/>
      </div>
    </div>
  );
}