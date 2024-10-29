"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { Paragraph, Z_PARAGRAPH } from "@/js/types";
import { LanguageScripts } from "@/js/language-scripts";
import FilterOptionsComponent from "../FilterOptionsComponent";
import CsvImportComponent from "./CsvImportComponent";
import AddParagraphFormComponent from "./AddParagraphFormComponent";
import ItemCardComponent from "../ItemCardComponent";

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

  const [newParagraph, setNewParagraph] = useState<Omit<Paragraph, "id"> | null>(null);
  const [confirmation, setConfirmation] = useState<(() => void) | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedParagraphs = await getParagraphs();
      setParagraphs(fetchedParagraphs);
    })();
  }, []);

  function handleSave(editParagraph: Paragraph) {
    void (async ()=>{
      try {
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
  }

  function handleDelete(paragraphId: number) {
    setConfirmation(() => () => {
      void (async ()=>{
        try {
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
    
      const i = paragraphs.findIndex((paragraph)=>paragraph.id === paragraphId);
      const newParagraphs = paragraphs.toSpliced(i, 1);

      //go to previous page if deleting the last paragraph on the current page
      if (viewPage * paragraphsPerPage - paragraphsPerPage >= refFilteredParagraphs.items.length - 1) {
        if (viewPage > 1) setViewPage(viewPage - 1);
      }
    
      setParagraphs([...newParagraphs]);
    });
  }

  function deleteManyParagraphs(paragraphs: Paragraph[]) {
    setConfirmation(() => () => {
      const paragraphIds = paragraphs.map((paragraph)=>paragraph.id);
      
      void (async ()=>{
        try {
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
    
      const newParagraphs = paragraphs.filter((paragraph)=>{
        return !paragraphIds.includes(paragraph.id)
      });

      setParagraphs([...newParagraphs]);
    });
  }

  const refFilteredParagraphs: {items: Paragraph[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Paragraph>({
    items: paragraphs,
    refFilteredItems: refFilteredParagraphs,
    selectFilters: {
      languageScripts: {
        getter: paragraph => paragraph.languageScript.languageScript,
        options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
      },
      selectable: {
        getter: paragraph => paragraph.selectable.toString(),
        options: ["true", "false"]
      }
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

      {
        confirmation ?
        <div className="fixed left-0 top-0 w-full h-full bg-neutral-950/50 flex justify-center items-center">
          <div className="absolute border-solid border-white border bg-black rounded-lg p-2 text-center">
            <p className="mb-3">Are you sure? Deleting a paragraph will also delete any associated races. This action is not reversible!</p>
            <div className="flex">
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2 mr-2" value="Confirm" onClick={() => {
                confirmation();
                setConfirmation(null);
              }} />
              <input type="button" className="border-solid border-white border-2 rounded-lg p-2" onClick={() => {
                setConfirmation(null);
              }} value="Cancel" />
            </div>
          </div>
        </div>
        :
        ""
      }

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
          (
            <ItemCardComponent
              item={paragraph}
              itemFields={{
                "id": {getter: (paragraph: Paragraph) => paragraph.id, editType: null, options: null},
                "author": {getter: (paragraph: Paragraph) => paragraph.author, editType: "text", options: null},
                "source": {getter: (paragraph: Paragraph) => paragraph.source, editType: "text", options: null},
                "text": {getter: (paragraph: Paragraph) => paragraph.text, editType: "text", options: null},
                "languageScript": {getter: (paragraph: Paragraph) => paragraph.languageScript.languageScript, editType: "languageScript", options: null},
                "selectable": {getter: (paragraph: Paragraph) => String(paragraph.selectable), editType: "checkbox", options: null}
              }}
              editParams={{
                items: paragraphs,
                setItems: setParagraphs,
                saveItem: handleSave
              }}
              deleteItem={handleDelete}
              key={paragraph.id}
            />
          )
        )}
        {/*if there are no paragraphs to show, display not found message*/}
        {refFilteredParagraphs.items.length === 0 ? "No paragraphs found" : ""}
      </div>
    </div>
  );
}