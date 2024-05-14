import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";

const Z_RESPONSE = z.object({
  startTime: z.string(),
  paragraphText: z.string(),
  raceId: z.string()
})

async function startRace(
  setRaceInfo: (raceParagraph: string, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) => void
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
    response = Z_RESPONSE.parse(await (await fetch(`/api/race/timer`, {
      method: "POST",
      body: JSON.stringify({
        languageScript: scriptSelected
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "startRace failed";
  }

  setRaceInfo(response.paragraphText, new Date(response.startTime), response.raceId, true, false)
}

export default function ScriptSelectionComponent({setRaceInfo}: { setRaceInfo: (
  raceParagraph: string,
  startTime: Date | null,
  raceId: string | null,
  scriptSelectionHidden: boolean,
  timerHidden: boolean
) => void }) {
  return (
    <div className="">
      Select the script you&apos;d like to use
      <div className="flex">
        <select name="script" id="script">
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
        <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {
          void (async ()=>await startRace(setRaceInfo))()
        }} value="Start Race"/>
      </div>
    </div>
  );
}