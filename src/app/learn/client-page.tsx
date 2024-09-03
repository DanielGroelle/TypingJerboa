"use client";

import { ManualKeyboardMapping, ManualKeyboardMap, LanguageScripts } from "@/js/language-scripts";
import { useState, useRef, ChangeEvent, ClipboardEvent, MouseEvent } from "react";

export default function ClientLearn() {
  const [languageScript, setLanguageScript] = useState<string>(LanguageScripts.LATIN_ENGLISH);
  const [learnPromptArray, setLearnPromptArray] = useState([]);
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");
  const [activeMode, setActiveMode] = useState<string>("new-characters");
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [lessonFinished, setLessonFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
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
      let tailwindClassNames = "text-left p-2 hover:bg-cyan-800";
      //if not last lesson, add a dotted line underneath
      if (i !== lessonsList.length - 1) {
        tailwindClassNames += " border-dotted border-b-2 border-white";
      }
      if (lesson === activeLesson) {
        tailwindClassNames += " bg-cyan-950";
      }
      return (
        <input type="button" key={lesson} onClick={()=>{setActiveLesson(lesson)}} className={tailwindClassNames} value={(i + 1) + ": " + lesson} />
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
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {/* script selection */}
      <div className="flex justify-end">
        Language Script:
        <select name="script-select" id="script-select" onChange={handleScriptChange} defaultValue={languageScript}>
          <option value={LanguageScripts.CYRILLIC_RUSSIAN}>Cyrillic (Russian)</option>
          <option value={LanguageScripts.LATIN_ENGLISH}>Latin (English)</option>
        </select>
      </div>

      <div className="flex overflow-y-hidden">
        {/* lessons sidebar */}
        <div className="flex flex-col overflow-y-hidden">
          <h1>Lessons</h1>
          <div className="flex flex-col border-solid border-r-2 rounded border-white p-2 overflow-y-scroll">
            <h4><strong>Letters</strong></h4>
            {displaySidebarCharsByType("letters")}
            <h4><strong>Capitals</strong></h4>
            {displaySidebarCharsByType("capitals")}
            <h4><strong>Numbers</strong></h4>
            {displaySidebarCharsByType("numbers")}
            <h4><strong>Symbols</strong></h4>
            {displaySidebarCharsByType("symbols")}
          </div>
        </div>
        
        {/* center area */}
        <div className="m-4">
          <div>
            <input type="button" className="border-solid border-white border rounded-lg p-2 mr-2" onClick={()=>{
              setActiveMode("new-characters");
            }} style={{backgroundColor: (activeMode === "new-characters") ? "rgb(39 39 42)" : ""}} value="New Characters" />
            <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
              setActiveMode("word-exercise");
            }} style={{backgroundColor: (activeMode === "word-exercise") ? "rgb(39 39 42)" : ""}} value="Word Exercise" />
          </div>
          <br/>
          Selected: {activeLesson ?? "None"}
          <br/>
          
          {!startTime ?
            //if lesson not started show "begin lesson" button
            <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
              if (activeLesson) setStartTime(new Date());
              // void (async ()=>await startRace(setRaceInfo, setError))()
            }} value="Begin Lesson" />
            :
            //else show "end lesson" button
            <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
              setStartTime(null);
              setLearnPromptArray([]);
              setUserInput("");
            }} value="End Lesson" />
          }

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