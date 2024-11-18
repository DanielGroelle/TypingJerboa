import { LanguageScripts } from "@/js/language-scripts";
import { Paragraph, Z_PARAGRAPH } from "@/js/types";
import { FormEvent } from "react";

function handleAdd(
  event: FormEvent<HTMLFormElement>,
  paragraphs: Paragraph[],
  setParagraphs: (paragraphs: Paragraph[]) => void,
  newParagraph: Omit<Paragraph, "id"> ,
  setNewParagraph: (paragraph: Omit<Paragraph, "id">  | null) => void
) {
  event.preventDefault();

  if (newParagraph === null) throw "New Paragraph is null!";

  void (async ()=>{
    try {
      const response = Z_PARAGRAPH.parse(await(await fetch(`/api/admin/paragraph`, {
        method: "POST",
        body: JSON.stringify(newParagraph),
        mode: "cors",
        cache: "default"
      })).json());

      setParagraphs([response, ...paragraphs]);
      setNewParagraph(null);
    }
    catch(e: unknown) {
      console.error("Paragraph add failed", e);
    }
  })();
}

export default function AddParagraphFormComponent({paragraphs, setParagraphs, newParagraph, setNewParagraph}: {
  paragraphs: Paragraph[],
  setParagraphs: (paragraphs: Paragraph[]) => void,
  newParagraph: Omit<Paragraph, "id"> | null,
  setNewParagraph: (newParagraph: Omit<Paragraph, "id"> | null) => void
}) {
  return (
    <>
    {
      newParagraph ?
      <div className="border-solid border-green-700 border">
        <form onSubmit={(e)=>handleAdd(e, paragraphs, setParagraphs, newParagraph, setNewParagraph)}>
            <div className="flex">
              <span>text:</span>
              <textarea id="text-input" className="w-full resize-none" value={newParagraph.text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>{
                setNewParagraph({...newParagraph, text: e.target.value});
              }}></textarea><br/>
            </div>

            <div className="flex">
              <span>author:</span>
              <input type="text" id="author-input" className="w-full" value={newParagraph.author ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                setNewParagraph({...newParagraph, author: e.target.value});
              }}/><br/>
            </div>

            <div className="flex">
              <span>source:</span>
              <input type="text" id="source-input" className="w-full" value={newParagraph.source  ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                setNewParagraph({...newParagraph, source: e.target.value});
              }}/><br/>
            </div>

            languageScript:
            <select id="language-script-edit-select" value={newParagraph.languageScript.languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
              setNewParagraph({...newParagraph, languageScript: {languageScript: e.target.value}});
            }}>
              {
                Object.values(LanguageScripts).map((languageScript)=>{
                  return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
                })
              }
            </select>
            <br/>

            <div>
              selectable:
              <select id="selectable-select" value={newParagraph.selectable.toString()} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                setNewParagraph({...newParagraph, selectable: e.target.value === "true"});
              }}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
            <br/>

            <div>
              <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setNewParagraph(null)} value="Cancel" />
              <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
            </div>
          </form>
        </div>
      :
      ""
    }
    </>
  );
}