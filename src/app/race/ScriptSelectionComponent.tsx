"use client";

function startRace() {
  //makes an api fetch to get a text paragraph for the race
  console.log("hello");
}

export default function ScriptSelectionComponent() {
  return (
      <div className="">
      Select the script you'd like to use
      <div className="flex">
        <select name="script" id="script" className="bg-black">
          <option value="cyrillic-russian">Cyrillic (Russian)</option>
          <option value="latin-english">Latin (English)</option>
        </select>
        <button className="border-solid border-white border rounded-lg p-2" onClick={()=>startRace()}>Start Race</button>
      </div>
    </div>
  );
}