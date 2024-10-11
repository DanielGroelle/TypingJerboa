"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Paragraph, Z_PARAGRAPH } from "@/js/types";
import { LanguageScripts } from "@/js/language-scripts";
import FilterOptionsComponent from "../FilterOptionsComponent";
import CsvImportComponent from "./CsvImportComponent";
import AddParagraphFormComponent from "./AddParagraphFormComponent";
import EditParagraphFormComponent from "./EditParagraphFormComponent";

const Z_PARAGRAPH_RESPONSE = z.object({
  paragraphs: z.array(Z_PARAGRAPH)
});

async function getParagraphs() {
  let response;
  try {
    response = Z_PARAGRAPH_RESPONSE.parse(await (await fetch(`/api/admin/paragraph`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "getParagraphs failed";
  }

  return response.paragraphs;
}

export default function ClientAdminParagraphs() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [viewPage, setViewPage] = useState(1);
  const paragraphsPerPage = 25;

  const [editParagraph, setEditParagraph] = useState<Paragraph | null>(null);
  const [newParagraph, setNewParagraph] = useState<Omit<Paragraph, "id"> | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedParagraphs = await getParagraphs();
      setParagraphs(fetchedParagraphs);
    })();
  }, []);

  function handleDelete(paragraphId: number) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/paragraph`, {
          method: "DELETE",
          body: JSON.stringify({
            id: paragraphId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();

    //TODO: give some prompt that deleting is a destructive action for any races that used the paragraph
  
    const i = paragraphs.findIndex((paragraph)=>paragraph.id === paragraphId);
    const newParagraphs = paragraphs.toSpliced(i, 1);

    //go to previous page if deleting the last paragraph on the current page
    if (viewPage * paragraphsPerPage - paragraphsPerPage >= refFilteredParagraphs.items.length - 1) {
      if (viewPage > 1) setViewPage(viewPage - 1);
    }
  
    setParagraphs([...newParagraphs]);
  }

  function deleteManyParagraphs(paragraphs: Paragraph[]) {
    const paragraphIds = paragraphs.map((paragraph)=>paragraph.id);
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/paragraph/bulk`, {
          method: "DELETE",
          body: JSON.stringify({
            ids: paragraphIds
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();

    //TODO: give some prompt that deleting is a destructive action for any races that used the paragraph
  
    const newParagraphs = paragraphs.filter((paragraph)=>{
      return !paragraphIds.includes(paragraph.id)
    });

    setParagraphs([...newParagraphs]);
  }

  const refFilteredParagraphs: {items: Paragraph[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Paragraph>({
    items: paragraphs,
    refFilteredItems: refFilteredParagraphs,
    selectFilter: {
      getter: paragraph => paragraph.languageScript.languageScript,
      options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
    },
    filters: {
      "id": { getter: (paragraph: Paragraph) => paragraph.id },
      "text": { getter: (paragraph: Paragraph) => paragraph.text },
      "author": { getter: (paragraph: Paragraph) => paragraph.author },
      "source": { getter: (paragraph: Paragraph) => paragraph.source },
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyParagraphs
  });

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <div className="flex">
        <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setNewParagraph(newParagraph ? null : {
          text: "",
          author: "",
          source: "",
          languageScript: {
            languageScript: Object.values(LanguageScripts)[0].internal
          },
          selectable: true
        })} value="Add Paragraph" />
        <CsvImportComponent paragraphs={paragraphs} setParagraphs={setParagraphs}/>
      </div>

      <AddParagraphFormComponent paragraphs={paragraphs} setParagraphs={setParagraphs} newParagraph={newParagraph} setNewParagraph={setNewParagraph} />

      <div className="flex justify-between">
        <h1>Paragraphs</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredParagraphs.items.length / paragraphsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>
      <div className="flex flex-col overflow-y-auto">
        {refFilteredParagraphs.items.slice(viewPage * paragraphsPerPage - paragraphsPerPage, viewPage * paragraphsPerPage).map((paragraph)=>
          <div className="border-solid border-white border" key={paragraph.id}>
            {
              //if theres a paragraph we're editing, display a form to change values
              editParagraph?.id === paragraph.id ?
              <EditParagraphFormComponent paragraphs={paragraphs} setParagraphs={setParagraphs} editParagraph={editParagraph} setEditParagraph={setEditParagraph} handleDelete={handleDelete} />
              :
              //if we're not editing, display the paragraph data normally
              <>
                id: {paragraph.id}<br/>
                <div className="flex">
                  <span className="mr-1">text:</span>
                  <span>{paragraph.text}</span>
                </div>
                <div className="flex">
                  <span className="mr-1">author:</span>
                  <span>{paragraph.author}</span>
                </div>
                <div className="flex">
                  <span className="mr-1">source:</span>
                  <span>{paragraph.source}</span>
                </div>
                languageScript: {paragraph.languageScript.languageScript}<br/>
                selectable: {paragraph.selectable.toString()}<br/>
                <div className="flex justify-between">
                  <input type="button" className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setEditParagraph(paragraph)} value="Edit" />
                  <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(paragraph.id)} value="X" />
                </div>
              </>
            }
          </div>
        )}
        {/*if there are no paragraphs to show, display not found message*/}
        {refFilteredParagraphs.items.length === 0 ? "No paragraphs found" : ""}
      </div>
    </div>
  );
}