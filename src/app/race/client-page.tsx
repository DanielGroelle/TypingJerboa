"use client";

import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TextInputComponent from "./TextInputComponent";
import React, {useState} from "react";

export default function ClientRace() {
  const [raceParagraph, setRaceParagraph] = useState("Text");

  return (
    <div>
      <div className="flex flex-col m-10">
        <ScriptSelectionComponent raceParagraphCallback={setRaceParagraph} />
        <p>{raceParagraph}</p>
        <TextInputComponent />
      </div>
    </div>
  );
}