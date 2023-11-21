"use client";

import React, {useState, FormEvent} from "react";

export default function TextInputComponent() {
  const [userInput, setUserInput] = useState("");
  const handleChange = (event: FormEvent<HTMLTextAreaElement>) => {
    setUserInput(event.currentTarget.value);
  };

  return (
    <textarea className="text-black resize-none" onChange={handleChange}></textarea>
  );
}