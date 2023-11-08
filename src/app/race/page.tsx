import ScriptSelectionComponent from "./ScriptSelectionComponent";

export default function Race() {
  return (
    <div>
      
      <div className="flex flex-col m-10">
        <ScriptSelectionComponent/>
        Text
        <input type="text" className="text-black"></input>
      </div>
    </div>
  );
}