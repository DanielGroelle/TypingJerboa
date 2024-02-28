"use client";

import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TextInputComponent from "./TextInputComponent";
import TimerComponent from "./TimerComponent";
import React, { useState } from "react";

export default function ClientRace() {
  const [raceParagraph, setRaceParagraph] = useState(null as string | null);
  const [startTime, setStartTime] = useState(null as Date | null);
  const [raceId, setRaceId] = useState(null as string | null);

  const [scriptSelectionHidden, setScriptSelectionHidden] = useState(false);

  const raceParagraphArray = [...raceParagraph ?? ""];

  return (
    <div>
      <div className="flex flex-col m-10">
        <div className="flex w-full justify-between">
          {!scriptSelectionHidden ? <ScriptSelectionComponent props={{setRaceParagraph, setStartTime, setRaceId, setScriptSelectionHidden}} /> : ""}
          <TimerComponent startTime={startTime}/>
        </div>
        <TextInputComponent raceParagraphArray={raceParagraphArray} raceId={raceId}/>
      </div>
    </div>
  );
}