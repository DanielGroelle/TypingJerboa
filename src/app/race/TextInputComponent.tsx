"use client";

import React, {useState, ChangeEvent, ClipboardEvent, MouseEvent} from "react";
import "../globals.css";

export default function TextInputComponent({raceParagraphArray}: {raceParagraphArray: string[]}) {
  const [correctCharacters, setCorrectCharacters] = useState<string[]>([]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const userInput = event.currentTarget.value;

    const newCorrectCharacters = raceParagraphArray.reduce((accumulator: string[], char, i)=>{
      if (userInput[i] === undefined) {
        return accumulator.concat("empty");
      }
      if (char !== userInput[i]) {
        return accumulator.concat("incorrect");
      }
      return accumulator.concat("correct");
    }, []);

    setCorrectCharacters(newCorrectCharacters);
  };

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
    <div>
      <div className="border-solid border-white border select-none" onContextMenu={handleParagraphContextMenu}>
        {raceParagraphArray.map((character, i)=>{
          return <span className={correctCharacters[i] ?? "empty"} key={i}>{character}</span>
        })}
      </div>
      <textarea className="text-black resize-none" onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
    </div>
  );
}