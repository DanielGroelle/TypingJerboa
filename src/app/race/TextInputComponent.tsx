"use client";

import React, {useState, ChangeEvent, ClipboardEvent, MouseEvent} from "react";

export default function TextInputComponent() {
  const [userInput, setUserInput] = useState("");
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    console.log(event.currentTarget.value);
    setUserInput(event.currentTarget.value);
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  };

  const handleContextMenu = (event: MouseEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
  }

  return (
    <textarea className="text-black resize-none" onChange={handleChange} onPaste={handlePaste} onContextMenu={handleContextMenu}></textarea>
  );
}