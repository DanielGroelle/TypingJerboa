import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";
import { useState } from "react";
import { ReturnedParagraph } from "./client-page";

const Z_RESPONSE = z.object({
  startTime: z.string().nullable(),
  paragraph: z.object({
    text: z.string().nullable(),
    author: z.string().nullable(),
    source: z.string().nullable()
  }),
  raceId: z.string().nullable()
});
async function startRace(
  languageScript: string,
  setRaceInfo: (raceParagraph: ReturnedParagraph | null, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) => void,
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
    if (response.raceId === null || response.paragraph.text === null || response.startTime === null) {
      setError("No paragraph for that language script found");
    }
    //if paragraph was found set the race info to start the race
    else {
      setError(null);
      setRaceInfo(response.paragraph, new Date(response.startTime), response.raceId, true, false);
    }
  }
  catch(e: unknown) {
    console.error(e)
    setError("Unknown error occurred when starting race!");
    throw "startRace failed";
  }
}

export default function ScriptSelectionComponent({setRaceInfo, languageScript, setLanguageScript}: {
  setRaceInfo: (
    raceParagraph: ReturnedParagraph | null,
    startTime: Date | null,
    raceId: string | null,
    scriptSelectionHidden: boolean,
    timerHidden: boolean
  ) => void,
  languageScript: string,
  setLanguageScript: (languageScript: string) => void
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="border-solid border-red-500 border rounded-lg w-fit p-2" hidden={typeof error !== "string"}>
        {error}
      </div>
      
      <p>Select the script you&apos;d like to use</p>
      <div className="flex">
        <select name="script" id="script" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setLanguageScript(e.target.value)}>
          {Object.values(LanguageScripts).map(({internal, display})=>(
            <option key={internal} value={internal}>{display}</option>
          ))}
        </select>
        <input type="button" className="border-solid border-white border-2 rounded-lg p-2" onClick={() => {
          void (async ()=>await startRace(languageScript, setRaceInfo, setError))();
        }} value="Start Race"/>
      </div>
    </div>
  );
}