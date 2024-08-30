"use client";

import { useState, useEffect, FormEvent } from "react";
import { z } from "zod";
import { LanguageScripts } from "@/js/language-scripts";
import FilterOptionsComponent from "./FilterOptionsComponent";

export const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  source: z.string(),
  languageScript: z.object({
    id: z.number(),
    languageScript: z.string(),
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
  const [displayParagraphs, setDisplayParagraphs] = useState<Paragraph[]>([]); //displayParagraphs used to allow for filtering and searching
  
  const [paragraphEditing, setParagraphEditing] = useState<number | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedParagraphs = await getParagraphs();
      setParagraphs(fetchedParagraphs);
      setDisplayParagraphs(fetchedParagraphs);
    })();
  },[]);

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
  
    setParagraphs([...newParagraphs]);
    setDisplayParagraphs([...newParagraphs]);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const textSelector = document.querySelector("#text-input");
    const authorSelector = document.querySelector("#author-input");
    const sourceSelector = document.querySelector("#source-input");
    const languageScriptSelector = document.querySelector("#language-script-edit-select");
    const selectableSelector = document.querySelector("#selectable-select");
    if (!(textSelector instanceof HTMLTextAreaElement) ||
        !(authorSelector instanceof HTMLInputElement) ||
        !(sourceSelector instanceof HTMLInputElement) ||
        !(languageScriptSelector instanceof HTMLSelectElement) ||
        !(selectableSelector instanceof HTMLSelectElement)
    ) {
      throw "Selected elements [textSelector, authorSelector, sourceSelector, languageScriptSelector, selectableSelector] were of unexpected type";
    }

    const text = textSelector.value;
    const author = authorSelector.value;
    const source = sourceSelector.value;
    const languageScript = languageScriptSelector.value;
    const selectable = selectableSelector.value === "true"; //converts the selectableSelector string to a boolean based on if its === "true"

    void (async ()=>{
      try{
        const response = Z_PARAGRAPH.parse(await(await fetch(`/api/admin/paragraph/edit`, {
          method: "POST",
          body: JSON.stringify({
            id: paragraphEditing,
            text,
            author,
            source,
            languageScript,
            selectable
          }),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        const paragraphIndex = paragraphs.findIndex((paragraph)=>paragraph.id === response.id);
        paragraphs[paragraphIndex] = response;

        setParagraphs([...paragraphs]);
        handleFiltering();
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
    
    setParagraphEditing(null);
  }

  function handleFiltering() {
    // sort: ascending/descending
    // sortBy: id/text/author/source
    // languageScript: all/languageScript1/languageScript2/...
    // search: input text
    // searchIn: any/id/text/author/source

    const sortSelector = document.querySelector("#sort-select");
    const sortBySelector = document.querySelector("#sort-by-select");
    const languageScriptSelector = document.querySelector("#language-script-select");
    const searchSelector = document.querySelector("#paragraph-search");
    const searchInSelector = document.querySelector("#filter-select");
    if (!(sortSelector instanceof HTMLSelectElement) ||
        !(sortBySelector instanceof HTMLSelectElement) ||
        !(languageScriptSelector instanceof HTMLSelectElement) ||
        !(searchSelector instanceof HTMLInputElement) ||
        !(searchInSelector instanceof HTMLSelectElement)
    ) {
      throw "Selected elements [sortSelector, sortBySelector, languageScriptSelector, searchSelector, searchInSelector] were of unexpected type";
    }

    const sort = sortSelector.value;
    type Sort = "id" | "text" | "author" | "source";
    const sortBy = sortBySelector.value as Sort;
    const languageScript = languageScriptSelector.value;
    const search = searchSelector.value.toLowerCase();
    const searchIn = searchInSelector.value;

    //start filtering based on languageScript
    let newDisplayParagraphs = paragraphs.filter((paragraph)=>paragraph.languageScript.languageScript === languageScript || languageScript === "all");

    //filter based on search
    newDisplayParagraphs = newDisplayParagraphs.filter((paragraph)=>{
      if (search === "") {
        return true;
      }

      let filtered = false;
      if (searchIn === "id" || searchIn === "any") {
        filtered ||= paragraph.id.toString() === search || paragraph.id.toString().includes(search);
      }
      if (searchIn === "text" || searchIn === "any") {
        filtered ||= paragraph.text.toLowerCase().includes(search);
      }
      if (searchIn === "author" || searchIn === "any") {
        filtered ||= paragraph.author.toLowerCase().includes(search);
      }
      if (searchIn === "source" || searchIn === "any") {
        filtered ||= paragraph.source.toLowerCase().includes(search);
      }
      return filtered;
    });

    //sort filtered paragraphs
    newDisplayParagraphs.sort((paragraphA, paragraphB)=>{
      let valueA = paragraphA[sortBy];
      let valueB = paragraphB[sortBy];
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA > valueB) {
        return sort === "ascending" ? 1 : -1;
      }
      else {
        return sort === "ascending" ? -1 : 1;
      }
    });

    setDisplayParagraphs([...newDisplayParagraphs]);
  }

  return (
    <div>
      <FilterOptionsComponent paragraphs={paragraphs} setParagraphs={setParagraphs} handleFiltering={handleFiltering}/>
      Paragraphs <br/>
      {displayParagraphs.map((paragraph)=>
        <div className="border-solid border-white border" key={paragraph.id}>
          {
            //if theres a paragraph we're editing, display a form to change values
            paragraphEditing === paragraph.id ?
            <form onSubmit={handleSave}>
              id: {paragraph.id}<br/>
              <div className="flex">
                <span>text:</span>
                <textarea id="text-input" className="w-full resize-none" defaultValue={paragraph.text}></textarea><br/>
              </div>
              <div className="flex">
                <span>author:</span>
                <input type="text" id="author-input" className="w-full" defaultValue={paragraph.author}/><br/>
              </div>
              <div className="flex">
                <span>source:</span>
                <input type="text" id="source-input" className="w-full" defaultValue={paragraph.source}/><br/>
              </div>
              languageScript:<select id="language-script-edit-select" defaultValue={paragraph.languageScript.languageScript}>
                {
                  Object.values(LanguageScripts).map((languageScript)=>{
                    return <option key={languageScript} defaultValue={languageScript}>{languageScript}</option>
                  })
                }
              </select><br/>
              <div>
                selectable:<select id="selectable-select" defaultValue={paragraph.selectable.toString()}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select><br/>
              </div>
              <div className="flex justify-between">
                <div>
                  <button type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setParagraphEditing(null)}>Cancel</button>
                  <button type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2">Save</button>
                </div>
                <button className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(paragraph.id)}>X</button>
              </div>
            </form>
            :
            //if we're not editing, display the paragraph data normally
            <div>
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
                <button className="border-solid border-green-700 border-2 rounded-lg p-2" onClick={()=>setParagraphEditing(paragraph.id)}>Edit</button>
                <button className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(paragraph.id)}>X</button>
              </div>
            </div>
          }
        </div>
      )}
      {/*if there are no paragraphs to show, display not found message*/}
      {displayParagraphs.length === 0 ? "No paragraphs found" : ""}
    </div>
  );
}