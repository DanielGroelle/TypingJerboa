"use client";

import {LanguageScripts} from "@/js/language-scripts";

function startRace() {
  //find the select element
  const scriptElement = document.querySelector("#script");
  if (!(scriptElement instanceof HTMLSelectElement)) {
    throw "Script selector was not select element";
  }

  //access the selected value in the select
  const scriptSelected = scriptElement.options[scriptElement.selectedIndex].value;
  console.log(scriptSelected);
  
  //TODO: makes an api fetch to get a text paragraph for the race
  if (scriptSelected === LanguageScripts.CYRILLIC_RUSSIAN) {
    return "Обернувшись, он заметил человека небольшого роста, в старом поношенном вицмундире, и не без ужаса узнал в нем Акакия Акакиевича. Лицо чиновника было бледно, как снег, и глядело совершенным мертвецом.";
  }
  else if (scriptSelected === LanguageScripts.LATIN_ENGLISH) {
    return "The theory of music emphasizes the elements from which music is composed. One such structure is the melody, which is a grouping of musical notes that combine into a basic, but immensely flexible structure. Another is the chord, which is two or more notes played simultaneously to create a harmony.";
  }
  throw "Script selected not found";
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
        <button className="border-solid border-white border rounded-lg p-2" onClick={()=>raceParagraphCallback(startRace())}>Start Race</button>
      </div>
    </div>
  );
}