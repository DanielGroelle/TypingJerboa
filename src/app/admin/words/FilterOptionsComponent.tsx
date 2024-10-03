import { LanguageScripts } from "@/js/language-scripts";
import { Word, Z_WORD } from "./client-page";
import { useState, FormEvent } from "react";

export default function FilterOptionsComponent({words, setWords, handleFiltering, handleDeleteAllFiltered}: {
  words: Word[], setWords: (words: Word[]) => void, handleFiltering: (passedWords?: Word[]) => void, handleDeleteAllFiltered: () => void
}) {
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
    const wordSearch = document.querySelector("#word-search");
    if(!(wordSearch instanceof HTMLInputElement)) {
      throw "WordSearch not an instance of HTMLInputElement";
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

  function handleExact() {
    const exactSelect = document.querySelector("#exact-input");
    if(!(exactSelect instanceof HTMLInputElement)) {
      throw "ExactSelect not an instance of HTMLInputElement";
    }
    handleFiltering();
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const wordSelector = document.querySelector("#word-input");
    const languageScriptSelector = document.querySelector("#language-script-edit-select");
    if (!(wordSelector instanceof HTMLInputElement) ||
        !(languageScriptSelector instanceof HTMLSelectElement)
    ) {
      throw "Selected elements [wordSelector, languageScriptSelector] were of unexpected type";
    }

    const word = wordSelector.value;
    const languageScript = languageScriptSelector.value;

    void (async ()=>{
      try{
        const response = Z_WORD.parse(await(await fetch(`/api/admin/word`, {
          method: "POST",
          body: JSON.stringify({
            word,
            languageScript,
          }),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        setWords([response, ...words]);
        handleFiltering();
        setAdding(false);
      }
      catch(e: unknown) {
        console.error("Word add failed", e);
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
          <option>word</option>
        </select>
        Language Script:
        <select id="language-script-select" onChange={handleLanguageScript}>
          <option value="all">all</option>
          {
            Object.values(LanguageScripts).map((languageScript)=>{
              return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
            })
          }
        </select>
        Search:
        <input id="word-search" type="text" onChange={handleSearch}/>
        in
        <select id="filter-select" onChange={handleFilter}>
          <option>any</option>
          <option>id</option>
          <option>word</option>
        </select>

        <input type="checkbox" id="exact-input" onChange={handleExact}/>
        <label className="ml-1" htmlFor="exact-input">Exact</label>

        <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={handleDeleteAllFiltered} value="Delete all filtered" />

        <br/>
        <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setAdding(!adding)} value="Add Word" />
        <br/><br/>

        {
          //add word form
          adding ?
          <div className="border-solid border-green-700 border" key="adding">
            <form onSubmit={handleAdd}>
                <div className="flex">
                  <span>word:</span>
                  <input type="text" id="word-input" className="w-full"/><br/>
                </div>
                languageScript:<select id="language-script-edit-select">
                  {
                    Object.values(LanguageScripts).map((languageScript)=>{
                      return <option key={languageScript.internal} defaultValue={languageScript.internal}>{languageScript.internal}</option>
                    })
                  }
                </select><br/>
                <div>
                  <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setAdding(false)} value="Cancel" />
                  <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
                </div>
              </form>
            </div>
          :
          ""
        }
      </div>
  );
}