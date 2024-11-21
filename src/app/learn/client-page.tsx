"use client";

import { ManualKeyboardMap, LanguageScripts, LanguageVowels, LanguageScriptLiterals } from "@/js/language-scripts";
import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import SidebarComponent from "./SidebarComponent";
import { reportLesson } from "@/utility/utility";
import TextInputComponent from "../components/TextInputComponent";

//TODO: refactor this into several smaller components

export default function ClientLearn({languageScriptPreference}: {languageScriptPreference: string | undefined}) {
  const [languageScript, setLanguageScript] = useState<string>(languageScriptPreference ?? Object.values(LanguageScripts)[0].internal);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lessonText, setLessonText] = useState("");
  const [userInput, setUserInput] = useState("");
  const userInputRef = useRef("");
  const newUserInputRef = useRef<string | null>(null);

  const [activeMode, setActiveMode] = useState<"new-characters" | "word-exercise">("new-characters");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const lessons = ManualKeyboardMap[languageScript];
  const [finishedLessons, setFinishedLessons] = useState<Record<string, {newCharacters: string[], wordExercise: string[]}> | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [unlockedWordExercise, setUnlockedWordExercise] = useState(false);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [lessonReported, setLessonReported] = useState(false);

  const Z_FINISHED_LESSONS_RESPONSE = z.object({
    finishedLessons: z.record(
      z.string(), z.object({
        newCharacters: z.array(z.string()),
        wordExercise: z.array(z.string())
      })
    )
  });
  useEffect(()=>{
    void (async()=>{
      try {
        //fetch finished lessons for each language script
        const response = Z_FINISHED_LESSONS_RESPONSE.parse(await (await fetch(`/api/lesson`, {
          method: "GET",
          mode: "cors",
          cache: "default"
        })).json());

        setFinishedLessons(response.finishedLessons);
        determineWordExerciseUnlocked(response.finishedLessons);
      }
      catch(e: unknown) {
        throw "Fetch finishedLessons failed";
      }
    })();
  }, []);

  useEffect(()=>{
    setLessonStarted(false);
    setLessonReported(false);
  }, [error]);

  useEffect(()=>{
    determineWordExerciseUnlocked();

    resetLesson();
    setActiveLesson(null);
  }, [languageScript]);
  
  function determineWordExerciseUnlocked(finishedLessonsInternal: Record<string, {newCharacters: string[], wordExercise: string[]}> | null = finishedLessons) {
    const letterRegex = /\p{L}/u;
    const finishedLetterLessons = new Set(finishedLessonsInternal?.[languageScript].newCharacters.filter(
      letters => [...letters].some(letter => letterRegex.test(letter))
    ).map(letters => letters.toLowerCase())) ?? new Set([]);

    const finishedVowels = [...finishedLetterLessons].map(lesson => [...lesson]).flatMap(array => array).filter(
      letter => LanguageVowels[languageScript as LanguageScriptLiterals].some(vowel => vowel === letter)
    );

    const minLetterLessons = 4;
    const minVowels = 2;

    const unlocked = finishedLetterLessons.size >= minLetterLessons && finishedVowels.length >= minVowels;

    if (!unlocked) setActiveMode("new-characters");
    setUnlockedWordExercise(unlocked);
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
      const newFinishedLessons = {...finishedLessons};
      if (activeMode === "new-characters") {
        newFinishedLessons[languageScript].newCharacters.push(activeLesson);
        setFinishedLessons(newFinishedLessons);
        determineWordExerciseUnlocked(newFinishedLessons);
      }
      else {
        newFinishedLessons[languageScript].wordExercise.push(activeLesson);
        setFinishedLessons(newFinishedLessons);
        determineWordExerciseUnlocked(newFinishedLessons);
      }
    }
    resetLesson();
  }

  function resetLesson() {
    setLessonId(null);
    setStartTime(null);
    setLessonText("");
    setUserInput("");
    setError(null);
    setSuccess(null);
    setLessonStarted(false);
    setLessonReported(false);
  }

  const selectedModeColor = "rgb(7 89 133)";

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {/* script selection */}
      <div className="flex justify-end">
        Language Script:
        <select name="script-select" id="script-select" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=> {
          setLanguageScript(e.target.value);
        }}>
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
          finishedLessonsNewCharacters={new Set(finishedLessons?.[languageScript].newCharacters) ?? new Set([])}
          finishedLessonsWordExercise={new Set(finishedLessons?.[languageScript].wordExercise) ?? new Set([])}
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
            }} style={{backgroundColor: (activeMode === "new-characters") ? selectedModeColor : ""}} value="New Characters" />

            {
              /* conditionally allow Word Exercise as a mode if user has completed enough letter lessons and has enough vowels */
              unlockedWordExercise ?
              <input type="button" className="border-solid border-white border rounded-lg p-2" onClick={()=>{
                setActiveMode("word-exercise");
                resetLesson();
              }} style={{backgroundColor: (activeMode === "word-exercise") ? selectedModeColor : ""}} value="Word Exercise" />
              :
              <input type="button" className="border-dashed border-gray-400 text-gray-500 border rounded-lg p-2" disabled={true}
                style={{cursor: "not-allowed", backgroundColor: (activeMode === "word-exercise") ? selectedModeColor : ""}}
                value="Word Exercise"
              />
            }
          </div>
          <br/>

          <p className="text-lg">Selected: {activeLesson?.split("").join(" ") ?? "None"}</p>

          {!startTime ? 
            <input type="button" className="border-solid border-white border-2 rounded-lg p-2" disabled={lessonStarted} onClick={()=>{
              setLessonStarted(true);
              void (async ()=>await startLesson(assignLessonInfo, setError))();
            }} value="Begin Lesson" />
            :
            ""
          }

          <TextInputComponent paragraphArray={[...lessonText]} startTime={startTime} languageScript={languageScript} endGame={endLesson} userInput={userInput} setUserInput={setUserInput} userInputRef={userInputRef} newUserInputRef={newUserInputRef} />
          
          <div>
            {
              lessonId ?
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg my-1 p-2" disabled={lessonReported} onClick={()=>{
                setLessonReported(true);
                reportLesson(lessonId, setError, setSuccess);
              }} value="Report Lesson" />
              :
              ""
            }
          </div>
        </div>
      </div>
    </div>
  );
}