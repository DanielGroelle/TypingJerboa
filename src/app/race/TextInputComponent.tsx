"use client";

import React, { useState, useEffect, ChangeEvent, ClipboardEvent, MouseEvent } from "react";
import "../globals.css";

export default function TextInputComponent({raceParagraphArray, raceId}: {raceParagraphArray: string[], raceId: string | null}) {
  const [userInput, setUserInput] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [textAreaDisabled, setTextAreaDisabled] = useState(true);

  useEffect(()=>{
    if (raceParagraphArray.length !== 0) {
      setTextAreaDisabled(false);
    }
  }, [raceParagraphArray])

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newUserInput = event.currentTarget.value;
    const oldLength = userInput.length;
    const newLength = newUserInput.length;

    //make sure the user doesnt keep typing past a mistake by 5 characters
    //newLength < oldLength means user is backspacing which is fine
    const MISTAKE_TOLERANCE = 5;
    if (newLength < oldLength || charStatus(newUserInput, newLength - MISTAKE_TOLERANCE - 1) !== "incorrect") {
      setUserInput(newUserInput);
    }

    //check if a mistake was made
    //mistakes only count if the previous character is not a mistake
    if (newLength > oldLength &&
    charStatus(newUserInput, newLength - 1) === "incorrect" &&
    charStatus(newUserInput, newLength - 2) !== "incorrect") {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
    }

    //check if the race is finished
    if (newUserInput.length === raceParagraphArray.length) {
      let hasMistake = false;
      for (let i = 1; i <= MISTAKE_TOLERANCE; i++) {
        hasMistake ||= charStatus(newUserInput, newLength - i) === "incorrect";
      }

      if (!hasMistake) {
        //finish the race by sending the endTime and mistakes
        void (async ()=>{
          try {
            setTextAreaDisabled(true);
            await (await fetch(`/api/race`, {
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
        //TODO: use SuperJSON for request stringification. sending dates is annoying rn
      }
    }
  }

  //returns the appropriate class based on if the current raceParagraph char matches the userInput char
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
  }

  const handleParagraphContextMenu = (event: MouseEvent<HTMLParagraphElement>) => {
    event.preventDefault();
  }

  return (
    <div className="w-1/2">
      <div className="border-solid border-white border select-none" onContextMenu={handleParagraphContextMenu}>
        {raceParagraphArray.map((character, i)=>{
          return <span className={charStatus(userInput, i)} key={i}>{character}</span>
        })}

        {//for inputted characters that exceed paragraph length
        [...userInput.slice(raceParagraphArray.length)].map((_, i)=>{
            return <span className="incorrect" key={i}>&nbsp;</span>
        })}
      </div>
      <textarea className="text-black resize-none min-w-full" disabled={textAreaDisabled} value={userInput} onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
    </div>
  );
}