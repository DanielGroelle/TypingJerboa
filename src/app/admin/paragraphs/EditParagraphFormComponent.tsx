import { LanguageScripts } from "@/js/language-scripts";
import { Paragraph, Z_PARAGRAPH } from "@/js/types";
import { FormEvent } from "react";

function handleSave(
  event: FormEvent<HTMLFormElement>,
  paragraphs: Paragraph[],
  setParagraphs: (paragraphs: Paragraph[]) => void,
  editParagraph: Paragraph | null,
  setEditParagraph: (editParagraph: Paragraph | null) => void
) {
  event.preventDefault();

  if (editParagraph === null) throw "Edit Paragraph is null!";

  void (async ()=>{
    try{
      const response = Z_PARAGRAPH.parse(await(await fetch(`/api/admin/paragraph/edit`, {
        method: "POST",
        body: JSON.stringify(editParagraph),
        mode: "cors",
        cache: "default"
      })).json());

      //rerender edits
      const paragraphIndex = paragraphs.findIndex((paragraph)=>paragraph.id === response.id);
      paragraphs[paragraphIndex] = response;

      setParagraphs([...paragraphs]);
    }
    catch(e: unknown) {
      throw "Edit failed";
    }
  })();
  
  setEditParagraph(null);
}

export default function EditParagraphFormComponent({paragraphs, setParagraphs, editParagraph, setEditParagraph, handleDelete}: {
  paragraphs: Paragraph[],
  setParagraphs: (paragraphs: Paragraph[]) => void,
  editParagraph: Paragraph,
  setEditParagraph: (editParagraph: Paragraph | null) => void,
  handleDelete: (id: number) => void
}) {
  return (
    <form onSubmit={e => handleSave(e, paragraphs, setParagraphs, editParagraph, setEditParagraph)}>
      id: {editParagraph.id}<br/>
      <div className="flex">
        <span>text:</span>
        <textarea id="text-input" className="w-full resize-none" value={editParagraph.text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>{
          setEditParagraph({...editParagraph, text: e.target.value});
        }}></textarea><br/>
      </div>
      <div className="flex">
        <span>author:</span>
        <input type="text" id="author-input" className="w-full" value={editParagraph.author} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
          setEditParagraph({...editParagraph, author: e.target.value});
        }}/><br/>
      </div>
      <div className="flex">
        <span>source:</span>
        <input type="text" id="source-input" className="w-full" value={editParagraph.source} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
          setEditParagraph({...editParagraph, source: e.target.value});
        }}/><br/>
      </div>
      languageScript:<select id="language-script-edit-select" value={editParagraph.languageScript.languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setEditParagraph({...editParagraph, languageScript: {languageScript: e.target.value}});
        }}>
        {
          Object.values(LanguageScripts).map((languageScript)=>{
            return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
          })
        }
      </select><br/>
      <div>
        selectable:<select id="selectable-select" value={editParagraph.selectable.toString()} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setEditParagraph({...editParagraph, selectable: e.target.value === "true"});
        }}>
          <option value="true">true</option>
          <option value="false">false</option>
        </select><br/>
      </div>
      <div className="flex justify-between">
        <div>
          <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setEditParagraph(null)} value="Cancel" />
          <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Save" />
        </div>
        <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(editParagraph.id)} value="X" />
      </div>
    </form>
  );
}