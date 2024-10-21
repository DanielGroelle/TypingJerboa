import React, { useState, useEffect, ChangeEvent, ClipboardEvent, MouseEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import "../globals.css";

function handleWPM(startTime: Date | null, userInput: string): number {
  if (!startTime) return 0;

  const minutesPassed = (Date.now() - startTime.getTime()) / 1000 / 60;
  const newWPM = (userInput.length / 5) / minutesPassed;

  return newWPM;
}

function endRace(mistakes: number, raceId: string | null, router: AppRouterInstance) {
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
  })();

  router.push(`/race/finish?id=${raceId}`);
}

export default function TextInputComponent({raceParagraphArray, raceId, startTime}: {raceParagraphArray: string[], raceId: string | null, startTime: Date | null}) {
  const router = useRouter();

  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");

  const [mistakes, setMistakes] = useState(0);
  const [WPM, setWPM] = useState(0);

  const [raceFinished, setRaceFinished] = useState(false);

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
  }, [raceParagraphArray]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newUserInput = event.currentTarget.value;
    const oldLength = userInput.length;
    const newLength = newUserInput.length;

    //make sure the user doesnt keep typing past a mistake by 5 characters
    //newLength < oldLength means user is backspacing which is fine
    const MISTAKE_TOLERANCE = 5;
    if (newLength < oldLength || charStatus(newUserInput, newLength - MISTAKE_TOLERANCE - 1) !== "incorrect") {
      //make sure the race has started and also isnt finished
      if (startTime && startTime.getTime() < new Date().getTime() && !raceFinished) {
        setUserInput(newUserInput);
        userInputRef.current = newUserInput;

        setWPM(handleWPM(startTime, newUserInput));
      }
    }

    //check if a mistake was made
    //mistakes only count if the previous character is not a mistake
    if (newLength > oldLength &&
    charStatus(newUserInput, newLength - 1) === "incorrect" &&
    charStatus(newUserInput, newLength - 2) !== "incorrect") {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
    }

    //check if the userInput is equal to the raceParagraph and that race has actually started in order to end the race
    if (newUserInput === raceParagraphArray.join("") && new Date().getTime() >= (startTime?.getTime() ?? 0)) {
      setRaceFinished(true);
      endRace(mistakes, raceId, router);
    }
  }

  //returns the appropriate class name based on if the current raceParagraph char matches the userInput char
  //needs to take in the userInput string in case the state variable hasnt updated yet
  const charStatus = (userInput: string, i: number) => {
    if (userInput[i] === undefined) {
      return "empty";
    }
    if (raceParagraphArray[i] !== userInput[i]) {
      return "incorrect";
    }
    return "correct";
  }

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };
  const handleTextAreaContextMenu = (event: MouseEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };
  const handleParagraphContextMenu = (event: MouseEvent<HTMLParagraphElement>) => {
    event.preventDefault();
  };

  return (
    <div className="w-1/2">
      <div>
        {/*if the race is started show wpm*/}
        {raceParagraphArray.length !== 0 ? `${WPM.toFixed(1)}wpm` : ""}
      </div>
      <div className="border-solid border-white border p-1 select-none" onContextMenu={handleParagraphContextMenu}>
        {raceParagraphArray.map((character, i)=>{
          return <span className={charStatus(userInput, i)} key={i}>{character}</span>
        })}

        {//for inputed characters that exceed paragraph length
        [...userInput.slice(raceParagraphArray.length)].map((_, i)=>{
            return <span className="incorrect" key={i}>&nbsp;</span>
        })}
      </div>
      <textarea id="main-text-input" className="text-black resize-none min-w-full p-1" value={userInput} onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
    </div>
  );
}