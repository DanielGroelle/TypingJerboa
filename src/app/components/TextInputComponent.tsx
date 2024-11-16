import { KeyboardMap } from "@/js/language-scripts";
import { useRouter } from "next/navigation";
import { ClipboardEvent, MouseEvent, useCallback, useState } from "react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
  event.preventDefault();
}
function handleTextAreaContextMenu(event: MouseEvent<HTMLTextAreaElement>) {
  event.preventDefault();
}
function handleParagraphContextMenu(event: MouseEvent<HTMLParagraphElement>) {
  event.preventDefault();
}

export default function TextInputComponent({paragraphArray, startTime, languageScript, endGame, gameId, userInput, setUserInput, userInputRef, newUserInputRef}: {
  paragraphArray: string[],
  startTime: Date | null,
  languageScript: string,
  endGame: (mistakes: number, gameId: string | null, router: AppRouterInstance) => void,
  gameId: string | null,
  userInput: string,
  setUserInput: (userInput: string) => void,
  userInputRef: React.MutableRefObject<string>,
  newUserInputRef: React.MutableRefObject<string | null>,
}) {
  const router = useRouter();

  const [selectionRange, setSelectionRange] = useState({start: 0, end: 0});
  const [mistakes, setMistakes] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  //sets the users cursor where it should be on every render
  const updateSelectionState = useCallback((node: HTMLTextAreaElement) => {
    if (node !== null) {
      node.setSelectionRange(selectionRange.start, selectionRange.end);
    }
  }, [selectionRange, userInput]);

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const newUserInput = newUserInputRef.current ?? event.currentTarget.value;
    if (newUserInputRef.current === null) {
      setSelectionRange({start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd});
    }
    newUserInputRef.current = null;
  
    const oldLength = userInput.length;
    const newLength = newUserInput.length;
  
    //make sure the user doesnt keep typing past a mistake by 5 characters
    //newLength < oldLength means user is backspacing which is fine
    const MISTAKE_TOLERANCE = 5;
    if (newLength < oldLength || charStatus(newUserInput, newLength - MISTAKE_TOLERANCE - 1, paragraphArray) !== "incorrect") {
      //make sure the game has started and also isnt finished
      if (startTime && startTime.getTime() < new Date().getTime() && !gameFinished) {
        setUserInput(newUserInput);
        userInputRef.current = newUserInput;
      }
    }
  
    //check if a mistake was made
    //mistakes only count if the previous character is not a mistake
    if (newLength > oldLength &&
    charStatus(newUserInput, newLength - 1, paragraphArray) === "incorrect" &&
    charStatus(newUserInput, newLength - 2, paragraphArray) !== "incorrect") {
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
    }
  
    //check if the userInput is equal to the paragraph and that game has actually started in order to end the game
    if (newUserInput === paragraphArray.join("") && new Date().getTime() >= (startTime?.getTime() ?? 0)) {
      setGameFinished(true);
      endGame(mistakes, gameId, router);
    }
  }
  
  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    //TODO: find a way to reimplement ctrl-z
    //good luck
    if (event.ctrlKey && (event.code === "KeyZ" || event.code === "KeyA")) {
      event.preventDefault();
      return;
    }
  
    const shiftKey = event.shiftKey ? "shift" : "noshift";
    if (event.ctrlKey || KeyboardMap["latin-english"][shiftKey][event.code] === undefined) {
      return;
    }
  
    const pos = event.currentTarget.selectionStart;
    const endPos = event.currentTarget.selectionEnd;
    const newUserInput = event.currentTarget.value.slice(0, pos) + KeyboardMap[languageScript][shiftKey][event.code] + event.currentTarget.value.slice(endPos);
  
    //set newUserInputRef to be the converted value from the origin languageScript to desired languageScript
    newUserInputRef.current = newUserInput;
    setSelectionRange({start: pos + 1, end: pos + 1});
  }
  
  //returns the appropriate class name based on if the current paragraph char matches the userInput char
  //needs to take in the userInput string in case the state variable hasnt updated yet
  function charStatus(userInput: string, i: number, paragraphArray: string[]) {
    if (userInput[i] === undefined) {
      return "empty";
    }
    if (paragraphArray[i] !== userInput[i]) {
      return "incorrect";
    }
    return "correct";
  }

  return (
    <>
    <div className="border-solid border-white border font-mono text-lg p-1 select-none" hidden={paragraphArray.length === 0} onContextMenu={handleParagraphContextMenu}>
      {paragraphArray.map((character, i)=>{
        return <span className={charStatus(userInput, i, paragraphArray)} key={i}>{character}</span>
      })}

      {//for inputed characters that exceed paragraph length
      [...userInput.slice(paragraphArray.length)].map((_, i)=>{
          return <span className="incorrect" key={i}>&nbsp;</span>
      })}
    </div>

    <textarea id="main-text-input" className="text-black resize-none font-mono text-lg min-w-full p-1"
      hidden={startTime === null}
      placeholder="Type paragraph here"
      autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false"
      value={userInput}
      ref={updateSelectionState}
      onChange={handleChange} onKeyDown={handleKeyDown} onPaste={handlePaste} onContextMenu={handleTextAreaContextMenu}>
    </textarea>
    </>
  );
}