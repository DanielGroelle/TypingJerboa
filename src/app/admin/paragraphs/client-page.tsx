"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";
import FilterOptionsComponent from "../FilterOptionsComponent";
import Papa from "papaparse";

export const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  source: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  }),
  selectable: z.boolean()
});
export type Paragraph = z.infer<typeof Z_PARAGRAPH>;

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

  function handleSave(event: FormEvent<HTMLFormElement>) {
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

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newParagraph === null) throw "New Paragraph is null!";

    void (async ()=>{
      try{
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

  function handleCsvSelect(e: ChangeEvent<HTMLInputElement>) {
    //dont allow upload of files other than csv
    if (e) {
      if (e.target.files?.[0]?.type !== "text/csv") {
        e.target.value = "";
      }
    }
  }

  const Z_CSV_RESULTS_DATA = z.array(z.array(z.string()));
  const Z_PARAGRAPHS_ARRAY = z.object({
    data: z.array(Z_PARAGRAPH)
  });

  function importFromCsv() {
    const csvFileInput = document.getElementById("csv-import");
    const languageScriptSelector = document.querySelector("#language-script-csv-select");

    if (csvFileInput instanceof HTMLInputElement && languageScriptSelector instanceof HTMLSelectElement) {
      const csvFile = csvFileInput.files?.[0];
      if (csvFile) {
        Papa.parse(csvFile, {
          // delimiter: ",", feel like delimiter shouldnt be specified in-case at some point a weird csv variant is used
          //papaparse is good at guessing anyways, it just returns an error when it has to guess
          complete: (results)=>{
            if (results.errors.length) {
              console.error("Errors parsing csv", results.errors);
            }

            const data = Z_CSV_RESULTS_DATA.parse(results.data);
            const author = data?.[0]?.[0];
            const source = data?.[0]?.[1];
            const texts = data.slice(1, data.length - 1).map((arr)=>arr[0]);
            const languageScript = languageScriptSelector.value;
            const selectable = true;

            void (async ()=>{
              try{
                const response = Z_PARAGRAPHS_ARRAY.parse(await(await fetch(`/api/admin/paragraph/bulk`, {
                  method: "POST",
                  body: JSON.stringify({
                    texts,
                    author,
                    source,
                    languageScript,
                    selectable
                  }),
                  mode: "cors",
                  cache: "default"
                })).json());

                //rerender edits
                const newParagraphs = [...response.data, ...paragraphs]
                setParagraphs(newParagraphs);
              }
              catch(e: unknown) {
                console.error("Bulk paragraph add failed", e);
              }
            })();
          }
        });
      }
    }
  }

  const refFilteredParagraphs: {items: Paragraph[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Paragraph>({
    items: paragraphs,
    refFilteredItems: refFilteredParagraphs,
    selectFilter: {
      getter: (paragraph)=>paragraph.languageScript.languageScript,
      options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
    },
    filters: {
      "id": { getter: (paragraph: Paragraph) => paragraph.id.toString() },
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
        <label htmlFor="csv-import" className="mr-1">Import From CSV</label>
        <input type="file" name="csv-import" id="csv-import" className="text-xs" accept=".csv" onChange={(e)=>handleCsvSelect(e)} />
        <input type="button" className="border-solid border-green-600 border rounded-lg p-2" onClick={importFromCsv} value="Import"/>
        languageScript: 
        <select id="language-script-csv-select">
        {Object.values(LanguageScripts).map((languageScript)=>{
          return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
        })}
        </select>
      </div>
      {
          //add paragraph form
          newParagraph ?
          <div className="border-solid border-green-700 border" key="adding">
            <form onSubmit={handleAdd}>
                <div className="flex">
                  <span>text:</span>
                  <textarea id="text-input" className="w-full resize-none" value={newParagraph.text} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>)=>{
                    setNewParagraph({...newParagraph, text: e.target.value});
                  }}></textarea><br/>
                </div>
                <div className="flex">
                  <span>author:</span>
                  <input type="text" id="author-input" className="w-full" value={newParagraph.author} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                    setNewParagraph({...newParagraph, author: e.target.value});
                  }}/><br/>
                </div>
                <div className="flex">
                  <span>source:</span>
                  <input type="text" id="source-input" className="w-full" value={newParagraph.source} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                    setNewParagraph({...newParagraph, source: e.target.value});
                  }}/><br/>
                </div>
                languageScript:<select id="language-script-edit-select" value={newParagraph.languageScript.languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                    setNewParagraph({...newParagraph, languageScript: {languageScript: e.target.value}});
                  }}>
                  {
                    Object.values(LanguageScripts).map((languageScript)=>{
                      return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
                    })
                  }
                </select><br/>
                <div>
                  selectable:<select id="selectable-select" value={newParagraph.selectable.toString()} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                    setNewParagraph({...newParagraph, selectable: e.target.value === "true"});
                  }}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select><br/>
                </div>
                <div>
                  <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setNewParagraph(null)} value="Cancel" />
                  <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
                </div>
              </form>
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
          <div className="border-solid border-white border" key={paragraph.id}>
            {
              //if theres a paragraph we're editing, display a form to change values
              editParagraph?.id === paragraph.id ?
              <form onSubmit={handleSave}>
                id: {paragraph.id}<br/>
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
                  <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(paragraph.id)} value="X" />
                </div>
              </form>
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