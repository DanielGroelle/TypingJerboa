"use client";

import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";

const Z_RESPONSE = z.object({
  startTime: z.string(),
  paragraphText: z.string(),
  raceId: z.string()
})

async function startRace(
  setRaceParagraph: (paragraph: string) => void,
  setStartTime: (startTime: Date | null) => void,
  setRaceId: (raceId: string | null) => void,
  setScriptSelectionHidden: (hidden: boolean) => void
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

  setRaceParagraph(response.paragraphText);
  setStartTime(new Date(response.startTime));
  setRaceId(response.raceId);
  setScriptSelectionHidden(true);
}

export default function ScriptSelectionComponent({props}: {props: {
  setRaceParagraph: (raceParagraph: string | null) => void,
  setStartTime: (startTime: Date | null) => void,
  setRaceId: (raceId: string | null) => void,
  setScriptSelectionHidden: (hidden: boolean) => void
}}) {
  const {setRaceParagraph, setStartTime, setRaceId, setScriptSelectionHidden} = props;

  return (
    <div className="">
      Select the script you&apos;d like to use
      <div className="flex">
        <select name="script" id="script" className="bg-black">
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
        <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {void (async ()=>await startRace(setRaceParagraph, setStartTime, setRaceId, setScriptSelectionHidden))()}} value="Start Race"/>
      </div>
    </div>
  );
}