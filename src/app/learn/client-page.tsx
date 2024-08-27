"use client";

import { ManualKeyboardMapping, ManualKeyboardMap, LanguageScripts } from "@/js/language-scripts";
import { useState, useRef, ChangeEvent, ClipboardEvent, MouseEvent } from "react";

export default function ClientLearn() {
  const [languageScript, setLanguageScript] = useState(LanguageScripts.LATIN_ENGLISH as string);
  const [learnPromptArray, setLearnPromptArray] = useState([]);
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");
  const [lessonFinished, setLessonFinished] = useState(false);
  const [startTime, setStartTime] = useState(null as Date | null);
  const lessons = ManualKeyboardMap[languageScript];
  
  function handleScriptChange() {
    const scriptSelect = document.querySelector("#script-select");
    if(!(scriptSelect instanceof HTMLSelectElement)) {
      throw "ScriptSelect not an instance of HTMLSelectElement";
    }
    setLanguageScript(scriptSelect.value);
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const newUserInput = event.currentTarget.value;
    const oldLength = userInput.length;
    const newLength = newUserInput.length;

    //make sure the user doesnt keep typing past a mistake by 5 characters
    //newLength < oldLength means user is backspacing which is fine
    const MISTAKE_TOLERANCE = 5;
    if (newLength < oldLength || charStatus(newUserInput, newLength - MISTAKE_TOLERANCE - 1) !== "incorrect") {
      //make sure the lesson has started and also isnt finished
      if (startTime && startTime.getTime() < new Date().getTime() && !lessonFinished) {
        setUserInput(newUserInput);
        userInputRef.current = newUserInput;
      }
    }

    //check if the userInput is equal to the learnPrompt in order to end the lesson
    if (newUserInput === learnPromptArray.join("")) {
      setLessonFinished(true);
      // endLesson(mistakes, lessonId, router);
    }
  }

  //returns the appropriate class name based on if the current learnPrompt char matches the userInput char
  //needs to take in the userInput string in case the state variable hasnt updated yet
  const charStatus = (userInput: string, i: number) => {
    if (userInput[i] === undefined) {
      return "empty";
    }
    if (learnPromptArray[i] !== userInput[i]) {
      return "incorrect";
    }
    return "correct";
  }

  const displaySidebarCharsByType = (lessonType: keyof ManualKeyboardMapping) => {
    const lessonsList = [] as string[];
    for (const lessonList of Object.values(lessons[lessonType])) {
      //join together lesson characters into one string
      const joinedLessons = lessonList.map((lesson) => lesson.join(" "));
      lessonsList.push(...joinedLessons);
    }

    return lessonsList.map((lesson, i)=>{
      let tailwindClassNames = "text-left border-dotted border-b-2 border-white p-2";
  
      //if last lesson, dont have a dotted line underneath
      if (i === lessonsList.length - 1) {
        tailwindClassNames = "text-left p-2";
      }
  
      return (
        <button key={lesson} onClick={()=>{console.log(lesson)}} className={tailwindClassNames}>
          {(i + 1) + ": " + lesson}
        </button>
      );
    });
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
    <div>
      {/* script selection */}
      <div className="flex justify-end">
        Language Script:
        <select name="script-select" id="script-select" onChange={handleScriptChange} defaultValue={languageScript}>
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
      </div>

      {/* lessons sidebar */}
      <div className="flex">
        <div className="flex flex-col border-solid border-r-2 rounded border-white p-2">
          <h3 className="">Lessons</h3>
          <h4>Letters</h4>
          {displaySidebarCharsByType("letters")}
          <h4>Capitals</h4>
          {displaySidebarCharsByType("capitals")}
          <h4>Numbers</h4>
          {displaySidebarCharsByType("numbers")}
          <h4>Symbols</h4>
          {displaySidebarCharsByType("symbols")}
        </div>
        
        {/* center area */}
        <div className="m-4">
          <div>
            <button>New Characters</button>
            <button>Word Exercise</button>
            <button></button>
          </div>
          {languageScript}
          <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={() => {
            console.log("start");
            setStartTime(new Date());
            //TODO seeing an issue where if you ctrl-a then delete you can no longer input
            // void (async ()=>await startRace(setRaceInfo, setError))()
          }} value="Begin Lesson"/>

          <div className="border-solid border-white border select-none" onContextMenu={handleParagraphContextMenu}>
            {learnPromptArray.map((character, i)=>{
              return <span className={charStatus(userInput, i)} key={i}>{character}</span>
            })}

            {//for inputed characters that exceed paragraph length
            [...userInput.slice(learnPromptArray.length)].map((_, i)=>{
                return <span className="incorrect" key={i}>&nbsp;</span>
            })}
          </div>
          <textarea id="main-text-input" className="text-black resize-none min-w-full" value={userInput} onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
        </div>
      </div>
    </div>
  );
}