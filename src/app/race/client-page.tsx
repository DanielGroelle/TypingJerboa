"use client";

import React, { useEffect, useRef, useState } from "react";
import { LanguageScripts } from "@/js/language-scripts";
import { reportParagraph } from "@/utility/utility";
import ScriptSelectionComponent from "./ScriptSelectionComponent";
import TimerComponent from "./TimerComponent";
import TextInputComponent from "../components/TextInputComponent";
import { useRouter } from "next/navigation";

export type ReturnedParagraph = {
  text: string | null,
  author: string | null,
  source: string | null
}

function handleWPM(startTime: Date | null, userInput: string): number {
  if (!startTime) return 0;

  const minutesPassed = (Date.now() - startTime.getTime()) / 1000 / 60;
  const newWPM = (userInput.length / 5) / minutesPassed;

  return newWPM;
}

export default function ClientRace({languageScriptPreference}: {languageScriptPreference: string | undefined}) {
  const router = useRouter();

  const [raceParagraph, setRaceParagraph] = useState<ReturnedParagraph | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [raceId, setRaceId] = useState<string | null>(null);
  const [languageScript, setLanguageScript] = useState(languageScriptPreference ?? Object.values(LanguageScripts)[0].internal);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");
  const newUserInputRef = useRef<string | null>(null);

  const [WPM, setWPM] = useState(0);

  const raceParagraphArray = [...raceParagraph?.text ?? ""];

  useEffect(()=>{
    //on race start
    if (raceParagraphArray.length !== 0) {
      //focus on the text box
      const textInput = document.getElementById("main-text-input");
      if (textInput) {
        textInput.focus();
      }

      //set the wpm every 100ms
      const intervalId = setInterval(()=>{
        //needs to be a reference to avoid closure keeping userInput as an empty string
        setWPM(handleWPM(startTime, userInputRef.current));

        //if race finished, clear the interval
        if (userInputRef.current === raceParagraphArray.join("")) {
          clearInterval(intervalId);
        }
      }, 100);

      //cleanup the interval when user leaves the page
      return () => clearInterval(intervalId);
    }
  }, [raceParagraph]);

  useEffect(()=>{
    setWPM(handleWPM(startTime, userInput));
  }, [userInput])

  function setRaceInfo(raceParagraph: ReturnedParagraph | null, startTime: Date | null, raceId: string | null) {
    setRaceParagraph(raceParagraph);
    setStartTime(startTime);
    setRaceId(raceId);
  }

  function endRace(mistakes: number) {
    void (async ()=>{
      try {
        await (await fetch(`/api/race/finish`, {
          method: "POST",
          body: JSON.stringify({
            mistakes: mistakes,
            endTime: new Date(),
            raceId
          }),
          mode: "cors",
          cache: "default"
        })).json();
      }
      catch(e: unknown) {
        throw "Failed finishing race";
      }
      router.push(`/race/finish?id=${raceId}`);
    })();
  }

  return (
    <div>
      <div className="flex flex-col m-10 w-full">
        <div className="flex w-full justify-between">
          {!startTime ? <ScriptSelectionComponent setRaceInfo={setRaceInfo} languageScript={languageScript} setLanguageScript={setLanguageScript} /> : ""}
          {startTime ? <TimerComponent startTime={startTime} /> : ""}
        </div>
        <div className="w-1/2">
          <div>
            {/*if the race is started show wpm*/}
            {startTime !== null ? <h2 className="text-xl">{WPM.toFixed(1)}wpm</h2> : ""}
          </div>
          
          <TextInputComponent paragraphArray={raceParagraphArray} startTime={startTime} languageScript={languageScript} endGame={endRace} userInput={userInput} setUserInput={setUserInput} userInputRef={userInputRef} newUserInputRef={newUserInputRef} />
        </div>

        <div>
          {
            raceId ?
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg my-1 p-2" onClick={()=>reportParagraph(raceId, setError, setSuccess)} value="Report Paragraph" />
            :
            ""
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