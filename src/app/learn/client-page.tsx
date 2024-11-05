"use client";

import { ManualKeyboardMap, LanguageScripts } from "@/js/language-scripts";
import { useState, useRef, ChangeEvent, ClipboardEvent, MouseEvent, useEffect } from "react";
import { z } from "zod";
import SidebarComponent from "./SidebarComponent";
import { reportLesson } from "@/utility/utility";

//TODO: refactor this into several smaller components

export default function ClientLearn({languageScriptPreference}: {languageScriptPreference: string | undefined}) {
  const [languageScript, setLanguageScript] = useState<string>(languageScriptPreference ?? Object.values(LanguageScripts)[0].internal);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lessonText, setLessonText] = useState("");
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");

  const [activeMode, setActiveMode] = useState<"new-characters" | "word-exercise">("new-characters");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [lessonFinished, setLessonFinished] = useState(false);
  const lessons = ManualKeyboardMap[languageScript];
  const [finishedLessonsNewCharacters, setFinishedLessonsNewCharacters] = useState<Set<string>>(new Set([]));
  const [finishedLessonsWordExercise, setFinishedLessonsWordExercise] = useState<Set<string>>(new Set([]));
  const [lessonId, setLessonId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const Z_FINISHED_LESSONS_RESPONSE = z.object({
    finishedLessons: z.object({
      newCharacters: z.array(
        z.object({
          lessonCharacters: z.string()
        }
      )),
      wordExercise: z.array(
        z.object({
          lessonCharacters: z.string()
        }
      ))
    })
  });
  useEffect(()=>{
    void (async()=>{
      try {
        //fetch finished lessons and assign them to finishedLessons state variable
        const response = Z_FINISHED_LESSONS_RESPONSE.parse(await (await fetch(`/api/lesson`, {
          method: "GET",
          mode: "cors",
          cache: "default"
        })).json());
        const newCharactersFinishedLessons = response.finishedLessons.newCharacters.map((lesson)=>lesson.lessonCharacters);
        setFinishedLessonsNewCharacters(new Set([...newCharactersFinishedLessons]));
        const wordExerciseFinishedLessons = response.finishedLessons.wordExercise.map((lesson)=>lesson.lessonCharacters);
        setFinishedLessonsWordExercise(new Set([...wordExerciseFinishedLessons]));
      }
      catch(e: unknown) {
        throw "Fetch finishedLessons failed";
      }
    })();

    resetLesson();
    setActiveLesson(null);
  }, [languageScript]);

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

    //check if the userInput is equal to the learnText in order to end the lesson
    if (newUserInput === lessonText) {
      setLessonFinished(true);
      endLesson();
    }
  }

  //returns the appropriate class name based on if the current learnText char matches the userInput char
  //needs to take in the userInput string in case the state variable hasnt updated yet
  const charStatus = (userInput: string, i: number) => {
    if (userInput[i] === undefined) {
      return "empty";
    }
    if (lessonText[i] !== userInput[i]) {
      return "incorrect";
    }
    return "correct";
  }

  function assignLessonInfo(lessonText: string, startTime: Date | null, newLessonId: string | null) {
    setLessonText(lessonText);
    setStartTime(startTime);
    setLessonId(newLessonId);
  }

  const Z_RESPONSE = z.object({
    startTime: z.string().nullable(),
    lessonText: z.string().nullable(),
    lessonId: z.string().nullable()
  });
  async function startLesson(
    assignLessonInfo: (lessonText: string, startTime: Date | null, newLessonId: string | null) => void,
    setError: (error: string | null) => void
  ) {
    if (!activeLesson) {
      setError("No lesson selected");
      return;
    }

    let response;
    try {
      //fetch startTime, lessonText, and lessonId
      response = Z_RESPONSE.parse(await (await fetch(`/api/lesson/start`, {
        method: "POST",
        body: JSON.stringify({
          activeLesson: activeLesson?.split(""),
          languageScript: languageScript,
          mode: activeMode
        }),
        mode: "cors",
        cache: "default"
      })).json());
      
      //if no lesson was returned set the error message
      if (response.lessonId === null || response.lessonText === null || response.startTime === null) {
        setError("No lesson for that language script found");
      }
      //if lesson was found set the lesson info to start the lesson
      else {
        setError(null);
        assignLessonInfo(response.lessonText, new Date(response.startTime), response.lessonId);
      }
    }
    catch(e: unknown) {
      throw "startLesson failed";
    }
  }

  function endLesson() {
    void (async ()=>{
      try {
        await (await fetch(`/api/lesson/finish`, {
          method: "POST",
          body: JSON.stringify({
            endTime: new Date(),
            lessonId
          }),
          mode: "cors",
          cache: "default"
        })).json();
      }
      catch(e: unknown) {
        throw "Failed finishing lesson";
      }
    })();

    if (activeLesson) {
      if (activeMode === "new-characters") {
        setFinishedLessonsNewCharacters(new Set([...finishedLessonsNewCharacters, activeLesson]));
      }
      else {
        setFinishedLessonsWordExercise(new Set([...finishedLessonsWordExercise, activeLesson]));
      }
    }
    resetLesson();
  }

  function resetLesson() {
    setLessonId(null);
    setStartTime(null);
    setLessonText("");
    setUserInput("");
    setLessonFinished(false);
    setError(null);
    setSuccess(null);
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
        <select name="script-select" id="script-select" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>setLanguageScript(e.target.value)}>
          Language Script
          {Object.values(LanguageScripts).map(({internal, display})=>(
            <option key={internal} value={internal}>{display}</option>
          ))}
        </select>
      </div>

      <div className="flex overflow-y-hidden">
        <SidebarComponent
          lessons={lessons}
          activeLesson={activeLesson}
          setActiveLesson={setActiveLesson}
          finishedLessonsNewCharacters={finishedLessonsNewCharacters}
          finishedLessonsWordExercise={finishedLessonsWordExercise}
          resetLesson={resetLesson}
        />
        
        {/* center area */}
        <div className="m-4">
          <div className="border-solid border-red-500 border rounded-lg w-fit mb-1 p-2" hidden={typeof error !== "string"}>
            {error}
          </div>
          <div className="border-solid border-green-500 border rounded-lg w-fit mb-1 p-2" hidden={typeof success !== "string"}>
            {success}
          </div>

          <div>
            <input type="button" className="border-solid border-white border rounded-lg p-2 mr-2" onClick={()=>{
              setActiveMode("new-characters");
              resetLesson();
            }} style={{backgroundColor: (activeMode === "new-characters") ? "rgb(39 39 42)" : ""}} value="New Characters" />
            {/*TODO: lock word exercise until enough letter new character lessons have been completed, especially for numbers and symbols*/}
            <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
              setActiveMode("word-exercise");
              resetLesson();
            }} style={{backgroundColor: (activeMode === "word-exercise") ? "rgb(39 39 42)" : ""}} value="Word Exercise" />
          </div>
          <br/>
          Selected: {activeLesson ?? "None"}
          <br/>

          {!startTime ? 
            <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
              void (async ()=>await startLesson(assignLessonInfo, setError))();
            }} value="Begin Lesson" />
            :
            ""
          }

          <div className="border-solid border-white border select-none font-mono text-lg" hidden={lessonText.length === 0} onContextMenu={handleParagraphContextMenu}>
            {[...lessonText].map((character, i)=>{
              return <span className={charStatus(userInput, i)} key={i}>{character}</span>
            })}

            {//for inputed characters that exceed lessonText length
            [...userInput.slice(lessonText.length)].map((_, i)=>{
                return <span className="incorrect" key={i}>&nbsp;</span>
            })}
          </div>

          <textarea id="main-text-input" className="text-black resize-none font-mono min-w-full text-lg p-1" hidden={startTime === null} placeholder="Type characters here" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false" value={userInput} onChange={handleChange} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}></textarea>
          
          <div>
            {
              lessonId ?
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg my-1 p-2" onClick={()=>reportLesson(lessonId, setError, setSuccess)} value="Report Lesson" />
              :
              ""
            }
          </div>
        </div>
      </div>
    </div>
  );
}