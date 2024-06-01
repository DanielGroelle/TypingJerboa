import { LanguageScripts } from "@/js/language-scripts";
import { Paragraph, Z_PARAGRAPH } from "./client-page";
import { useState, FormEvent } from "react";

export default function FilterOptionsComponent({paragraphs, setParagraphs, handleFiltering}: {paragraphs: Paragraph[], setParagraphs: (paragraphs: Paragraph[]) => void, handleFiltering: () => void}) {
  const [adding, setAdding] = useState(false);

  function handleSort() {
    const sortSelect = document.querySelector("#sort-select");
    if(!(sortSelect instanceof HTMLSelectElement)) {
      throw "SortSelect not an instance of HTMLSelectElement";
    }
    handleFiltering();
  }
  
  function handleSortBy() {
    const sortBySelect = document.querySelector("#sort-by-select");
    if(!(sortBySelect instanceof HTMLSelectElement)) {
      throw "SortBySelect not an instance of HTMLSelectElement";
    }
    handleFiltering();
  }
  
  function handleLanguageScript() {
    const languageScriptSelect = document.querySelector("#language-script-select");
    if(!(languageScriptSelect instanceof HTMLSelectElement)) {
      throw "LanguageScriptSelect not an instance of HTMLSelectElement";
    }
    handleFiltering();
  }
  
  function handleSearch() {
    const paragraphSearch = document.querySelector("#paragraph-search");
    if(!(paragraphSearch instanceof HTMLInputElement)) {
      throw "ParagraphSearch not an instance of HTMLInputElement";
    }
    handleFiltering();
  }
  
  function handleFilter() {
    const filterSelect = document.querySelector("#filter-select");
    if(!(filterSelect instanceof HTMLSelectElement)) {
      throw "FilterSelect not an instance of HTMLSelectElement";
    }
    handleFiltering();
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
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
        const response = Z_PARAGRAPH.parse(await(await fetch(`/api/admin/paragraph`, {
          method: "POST",
          body: JSON.stringify({
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
        setParagraphs([response, ...paragraphs]);
        handleFiltering();
        setAdding(false);
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  }

  return (
    <div>
        Sort:
        <select id="sort-select" onChange={handleSort}>
          <option>ascending</option>
          <option>descending</option>
        </select>
        by
        <select id="sort-by-select" onChange={handleSortBy}>
          <option>id</option>
          <option>text</option>
          <option>author</option>
          <option>source</option>
        </select>
        Language Script:
        <select id="language-script-select" onChange={handleLanguageScript}>
          <option value="all">all</option>
          {
            Object.values(LanguageScripts).map((languageScript)=>{
              return <option key={languageScript} value={languageScript}>{languageScript}</option>
            })
          }
        </select>
        Search:
        <input id="paragraph-search" type="text" onChange={handleSearch}/>
        in
        <select id="filter-select" onChange={handleFilter}>
          <option>any</option>
          <option>id</option>
          <option>text</option>
          <option>author</option>
          <option>source</option>
        </select>
        <button className="border-solid border-blue-600 border rounded-lg p-2" onClick={()=>setAdding(!adding)}>Add Paragraph</button>

        {
          //add paragraph form
          adding ?
          <div className="border-solid border-green-700 border" key="adding">
            <form onSubmit={handleAdd}>
                <div className="flex">
                  <span>text:</span>
                  <textarea id="text-input" className="w-full resize-none"></textarea><br/>
                </div>
                <div className="flex">
                  <span>author:</span>
                  <input type="text" id="author-input" className="w-full"/><br/>
                </div>
                <div className="flex">
                  <span>source:</span>
                  <input type="text" id="source-input" className="w-full"/><br/>
                </div>
                languageScript:<select id="language-script-edit-select">
                  {
                    Object.values(LanguageScripts).map((languageScript)=>{
                      return <option key={languageScript} defaultValue={languageScript}>{languageScript}</option>
                    })
                  }
                </select><br/>
                <div>
                  selectable:<select id="selectable-select" defaultValue="true">
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select><br/>
                </div>
                <div>
                  <button type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setAdding(false)}>Cancel</button>
                  <button type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2">Add</button>
                </div>
              </form>
            </div>
          :
          ""
        }
      </div>
  );
}