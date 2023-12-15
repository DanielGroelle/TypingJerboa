"use client";

import React, {useState, ChangeEvent, ClipboardEvent, MouseEvent} from "react";
import "../globals.css";

export default function TextInputComponent({raceParagraphArray}: {raceParagraphArray: string[]}) {
  const [userInput, setUserInput] = useState("");

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newUserInput = event.currentTarget.value;
    setUserInput(newUserInput);

    //check if userinput matches raceparagraph
    if (newUserInput.length >= raceParagraphArray.length) {
      console.log("finish!!");
    }
  };

  //returns the appropriate class based on if the input char matches the raceParagraph char
  function correctIncorrectClassName(char: string, i: number) {
    if (userInput[i] === undefined) {
      return "empty";
    }
    if (char !== userInput[i]) {
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
          return <span className={correctIncorrectClassName(character, i)} key={i}>{character}</span>
        })}
      </div>
      <textarea className="text-black resize-none min-w-full" onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
    </div>
  );
}