"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "./FilterOptionsComponent";

export const Z_WORD = z.object({
  id: z.number(),
  word: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  })
});
export type Word = z.infer<typeof Z_WORD>;

const Z_RESPONSE = z.object({
  words: z.array(Z_WORD)
});

async function getWords() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/word`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "getWords failed";
  }

  return response.words;
}

export default function ClientAdminWords() {
  const [words, setWords] = useState<Word[]>([]);
  const [displayWords, setDisplayWords] = useState<Word[]>([]); //used to allow for filtering and searching
  const [viewPage, setViewPage] = useState(1);
  const wordsPerPage = 25;

  useEffect(()=>{
    void (async ()=>{
      const fetchedWords = await getWords();
      setWords(fetchedWords);
      handleFiltering(fetchedWords);
    })();
  },[]);

  function handleDelete(wordId: number) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/word`, {
          method: "DELETE",
          body: JSON.stringify({
            id: wordId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = words.findIndex((word)=>word.id === wordId);
    const newWords = words.toSpliced(i, 1);

    setWords([...newWords]);
    handleFiltering([...newWords]);
  }

  function handleFiltering(passedWords: Word[] | null = null, keepOnPage = false) {
    // sort: ascending/descending
    // sortBy: id/word
    // languageScript: all/languageScript1/languageScript2/...
    // search: input text
    // searchIn: any/id/word

    const sortSelector = document.querySelector("#sort-select");
    const sortBySelector = document.querySelector("#sort-by-select");
    const languageScriptSelector = document.querySelector("#language-script-select");
    const searchSelector = document.querySelector("#word-search");
    const searchInSelector = document.querySelector("#filter-select");
    const exactSelector = document.querySelector("#exact-input");
    if (!(sortSelector instanceof HTMLSelectElement) ||
        !(sortBySelector instanceof HTMLSelectElement) ||
        !(languageScriptSelector instanceof HTMLSelectElement) ||
        !(searchSelector instanceof HTMLInputElement) ||
        !(searchInSelector instanceof HTMLSelectElement) ||
        !(exactSelector instanceof HTMLInputElement)
    ) {
      throw "Selected elements [sortSelector, sortBySelector, languageScriptSelector, searchSelector, searchInSelector, exactSelector] were of unexpected type";
    }

    const sort = sortSelector.value;
    type Sort = "id" | "word";
    const sortBy = sortBySelector.value as Sort;
    const languageScript = languageScriptSelector.value;
    const search = searchSelector.value.toLowerCase();
    const searchIn = searchInSelector.value;
    const exact = exactSelector.checked;

    let filteringWords = words;
    if (passedWords) {
      filteringWords = passedWords;
    }

    //start filtering based on languageScript
    let newDisplayWords = filteringWords.filter((word)=>word.languageScript.languageScript === languageScript || languageScript === "all");
    //filter based on search
    newDisplayWords = newDisplayWords.filter((word)=>{
      if (search === "") {
        return true;
      }

      let filtered = false;
      if (searchIn === "id" || searchIn === "any") {
        filtered ||= (word.id.toString() === search) || (exact ? false : word.id.toString().includes(search));
      }
      if (searchIn === "word" || searchIn === "any") {
        filtered ||= (word.word === search) || (exact ? false : word.word.toLowerCase().includes(search));
      }
      return filtered;
    });

    //sort filtered words
    newDisplayWords.sort((wordA, wordB)=>{
      let valueA = wordA[sortBy];
      let valueB = wordB[sortBy];
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

    if (!keepOnPage) {
      //reset the page view to 1 on a new filter
      setViewPage(1);
      const pageSelector = document.querySelector("#page-select");
      if (!(pageSelector instanceof HTMLSelectElement)) {
        throw "pageSelector is not of HTMLSelectElement type";
      }
      pageSelector.value = "1";
    }
    
    setDisplayWords([...newDisplayWords]);
  }

  function handleDeleteAllFiltered() {
    const wordIds = words.map((word)=>word.id);
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/word/bulk`, {
          method: "DELETE",
          body: JSON.stringify({
            ids: wordIds
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const newWords = words.filter((word)=>{
      return !wordIds.includes(word.id)
    });

    setWords([...newWords]);
    handleFiltering([...newWords]);
  }

  function handlePageChange() {
    const pageSelector = document.querySelector("#page-select");
    if (!(pageSelector instanceof HTMLSelectElement)) {
      throw "pageSelector is not of HTMLSelectElement type";
    }

    setViewPage(Number(pageSelector.value));
  }

  return (
    <div>
      <FilterOptionsComponent words={words} setWords={setWords} handleFiltering={handleFiltering} handleDeleteAllFiltered={handleDeleteAllFiltered}/>
      
      <div className="flex justify-between">
        <h1>Words</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={handlePageChange} id="page-select">
            {Array.from(Array(Math.ceil(displayWords.length / wordsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>
      <br/>
      {displayWords.slice(viewPage * wordsPerPage - wordsPerPage, viewPage * wordsPerPage).map((word)=>
        <div className="border-solid border-white border flex justify-between" key={word.id}>
          <div>
            id: {word.id}<br/>
            word: {word.word}<br/>
            languageScript: {word.languageScript.languageScript}<br/>
          </div>
          <div>
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(word.id)} value="X" />
          </div>
        </div>
      )}
      {words.length === 0 ? "No words found" : ""}
    </div>
  );
}