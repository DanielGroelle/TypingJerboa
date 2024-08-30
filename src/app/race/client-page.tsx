"use client";

import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TextInputComponent from "./TextInputComponent";
import TimerComponent from "./TimerComponent";
import React, { useState } from "react";

export default function ClientRace() {
  const [raceParagraph, setRaceParagraph] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [raceId, setRaceId] = useState<string | null>(null);

  const [scriptSelectionHidden, setScriptSelectionHidden] = useState(false);
  const [timerHidden, setTimerHidden] = useState(true);

  function setRaceInfo(raceParagraph: string, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) {
    setRaceParagraph(raceParagraph);
    setStartTime(startTime);
    setRaceId(raceId);
    setScriptSelectionHidden(scriptSelectionHidden);
    setTimerHidden(timerHidden);
  }

  const raceParagraphArray = [...raceParagraph ?? ""];

  return (
    <div>
      <div className="flex flex-col m-10">
        <div className="flex w-full justify-between">
          {!scriptSelectionHidden ? <ScriptSelectionComponent setRaceInfo={setRaceInfo} /> : ""}
          {!timerHidden ? <TimerComponent startTime={startTime} /> : ""}
        </div>
        <TextInputComponent raceParagraphArray={raceParagraphArray} raceId={raceId} startTime={startTime} />
      </div>
    </div>
  );
}