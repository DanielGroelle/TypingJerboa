"use client";

import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TextInputComponent from "./TextInputComponent";
import TimerComponent from "./TimerComponent";
import React, {useState} from "react";

export default function ClientRace() {
  const [raceParagraph, setRaceParagraph] = useState("Text");
  const [startTime, setStartTime] = useState(null as Date | null);

  const raceParagraphArray = [...raceParagraph];

  return (
    <div>
      <div className="flex flex-col m-10">
        <div className="flex w-full justify-between">
          <ScriptSelectionComponent setRaceParagraph={setRaceParagraph} setStartTime={setStartTime} />
          <TimerComponent startTime={startTime} />
        </div>
        <TextInputComponent raceParagraphArray={raceParagraphArray}/>
      </div>
    </div>
  );
}