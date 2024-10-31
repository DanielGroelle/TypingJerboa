"use client";

import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TextInputComponent from "./TextInputComponent";
import TimerComponent from "./TimerComponent";
import { reportParagraph } from "@/utility/utility";
import React, { useState } from "react";

export type ReturnedParagraph = {
  text: string | null,
  author: string | null,
  source: string | null
}

export default function ClientRace() {
  const [raceParagraph, setRaceParagraph] = useState<ReturnedParagraph | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [raceId, setRaceId] = useState<string | null>(null);

  const [scriptSelectionHidden, setScriptSelectionHidden] = useState(false);
  const [timerHidden, setTimerHidden] = useState(true);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setRaceInfo(raceParagraph: ReturnedParagraph | null, startTime: Date | null, raceId: string | null, scriptSelectionHidden: boolean, timerHidden: boolean) {
    setRaceParagraph(raceParagraph);
    setStartTime(startTime);
    setRaceId(raceId);
    setScriptSelectionHidden(scriptSelectionHidden);
    setTimerHidden(timerHidden);
  }

  const raceParagraphArray = [...raceParagraph?.text ?? ""];

  return (
    <div>
      <div className="flex flex-col m-10 w-full">
        <div className="flex w-full justify-between">
          {!scriptSelectionHidden && <ScriptSelectionComponent setRaceInfo={setRaceInfo} />}
          {!timerHidden && <TimerComponent startTime={startTime} />}
        </div>
        <TextInputComponent raceParagraphArray={raceParagraphArray} raceId={raceId} startTime={startTime} />
        <div>
          {
            raceId &&
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg my-1 p-2" onClick={()=>reportParagraph(raceId, setError, setSuccess)} value="Report Paragraph" />
          }
          <div className="border-solid border-red-500 border rounded-lg w-fit p-2" hidden={typeof error !== "string"}>
            {error}
          </div>
          <div className="border-solid border-green-500 border rounded-lg w-fit p-2" hidden={typeof success !== "string"}>
            {success}
          </div>
        </div>
      </div>
    </div>
  );
}