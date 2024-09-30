import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";
import { useState } from "react";

const Z_RESPONSE = z.object({
  startTime: z.string().nullable(),
  paragraphText: z.string().nullable(),
  raceId: z.string().nullable()
})

async function startRace(
  setRaceInfo: (raceParagraph: string, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) => void,
  setError: (error: string | null) => void
) {
  //find the select element
  const scriptElement = document.querySelector("#script");
  if (!(scriptElement instanceof HTMLSelectElement)) {
    throw "Script selector was not select element";
  }

  //access the selected value in the select
  const scriptSelected = scriptElement.options[scriptElement.selectedIndex].value;

  let response;
  try {
    //fetch startTime and paragraphText
    response = Z_RESPONSE.parse(await (await fetch(`/api/race/start`, {
      method: "POST",
      body: JSON.stringify({
        languageScript: scriptSelected
      }),
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

export default function ScriptSelectionComponent({setRaceInfo}: { setRaceInfo: (
  raceParagraph: string,
  startTime: Date | null,
  raceId: string | null,
  scriptSelectionHidden: boolean,
  timerHidden: boolean
) => void }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="border-solid border-red-500 border rounded-lg p-2" hidden={typeof error !== "string"}>
        {error}
      </div>
      Select the script you&apos;d like to use
      <div className="flex">
        <select name="script" id="script">
          {/*TODO: automatically generate this from languageScripts object*/}
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
        <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {
          void (async ()=>await startRace(setRaceInfo, setError))();
        }} value="Start Race"/>
      </div>
    </div>
  );
}