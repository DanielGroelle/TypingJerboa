"use client";

import React, {useState, ChangeEvent, ClipboardEvent, MouseEvent} from "react";
import "../globals.css";

export default function TextInputComponent({raceParagraphArray}: {raceParagraphArray: string[]}) {
  const [userInput, setUserInput] = useState("");
  const [mistakes, setMistakes] = useState(0);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newUserInput = event.currentTarget.value;
    const oldLength = userInput.length;
    const newLength = newUserInput.length
    setUserInput(newUserInput);

    //check if a mistake was made
    //mistakes only count if the previous character is not a mistake
    if (newLength > oldLength &&
    correctIncorrectClassName(newLength - 1, newUserInput) === "incorrect" &&
    correctIncorrectClassName(newLength - 2, newUserInput) !== "incorrect") {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      console.log("mistake!", newMistakes);
    }

    //check if the race is finished
    if (newUserInput.length >= raceParagraphArray.length) {
      console.log("finish!!");
    }
  };

  //returns the appropriate class based on if the current raceParagraph char matches the userInput char
  //needs to take in the userInput string in case the state variable hasnt updated yet
  function correctIncorrectClassName(i: number, userInput: string) {
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
          return <span className={correctIncorrectClassName(i, userInput)} key={i}>{character}</span>
        })}
      </div>
      <textarea className="text-black resize-none min-w-full" onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
    </div>
  );
}