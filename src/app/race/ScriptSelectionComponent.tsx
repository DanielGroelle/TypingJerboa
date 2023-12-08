"use client";

import {z} from "zod";
import {LanguageScripts} from "@/js/language-scripts";

const Z_RESPONSE = z.object({
  startTime: z.string(),
  paragraphText: z.string()
})

async function startRace() {
  //find the select element
  const scriptElement = document.querySelector("#script");
  if (!(scriptElement instanceof HTMLSelectElement)) {
    throw "Script selector was not select element";
  }

  //access the selected value in the select
  const scriptSelected = scriptElement.options[scriptElement.selectedIndex].value;
  console.log(scriptSelected);

  const res = await fetch(`api/race/timer`, {
    method: "POST",
    body: JSON.stringify({
      languageScript: scriptSelected
    }),
    mode: "cors",
    cache: "default"
  });

  const response = Z_RESPONSE.parse(await res.json());
  console.log(response);

  return response.paragraphText;
}

export default function ScriptSelectionComponent({raceParagraphCallback}: {raceParagraphCallback: (paragraph: string) => void}) {
  return (
    <div className="">
      Select the script you&apos;d like to use
      <div className="flex">
        <select name="script" id="script" className="bg-black">
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
        <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {void (async ()=>raceParagraphCallback(await startRace()))()}} value="Start Race"/>
      </div>
    </div>
  );
}