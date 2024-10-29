"use client";

import { useState, useEffect, FormEvent } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import { LanguageScripts } from "@/js/language-scripts";
import { Word, Z_WORD } from "@/js/types";

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
  const [viewPage, setViewPage] = useState(1);
  const wordsPerPage = 25;

  const [newWord, setNewWord] = useState<Omit<Word, "id"> | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedWords = await getWords();
      setWords(fetchedWords);
    })();
  },[]);

  function handleDelete(wordId: number) {
    void (async ()=>{
      try {
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
  }

  function deleteManyWords() {
    const wordIds = words.map((word)=>word.id);
    
    void (async ()=>{
      try {
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
  }

  function handlePageChange() {
    const pageSelector = document.querySelector("#page-select");
    if (!(pageSelector instanceof HTMLSelectElement)) {
      throw "pageSelector is not of HTMLSelectElement type";
    }

    setViewPage(Number(pageSelector.value));
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
      try {
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
        setNewWord(null);
      }
      catch(e: unknown) {
        console.error("Word add failed", e);
      }
    })();
  }

  const refFilteredWords: {items: Word[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Word>({
    items: words,
    refFilteredItems: refFilteredWords,
    selectFilters: {
      languageScripts: {
        getter: word => word.languageScript.languageScript,
        options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
      }
    },
    filters: {
      "id": { getter: (word: Word) => word.id },
      "word": { getter: (word: Word) => word.word }
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyWords
  });

  return (
    <div>
      {filterOptionsComponent}

      <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setNewWord(newWord ? null : {
          word: "",
          languageScript: {
            languageScript: Object.values(LanguageScripts)[0].internal
          }
        })} value="Add Word" />
      <br/><br/>

      {
        //add word form
        newWord ?
        <div className="border-solid border-green-700 border">
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
                <input type="button" className="border-solid border-gray-200 border-2 rounded-lg p-2" onClick={()=>setNewWord(null)} value="Cancel" />
                <input type="submit" className="border-solid border-green-700 border-2 rounded-lg p-2" value="Add" />
              </div>
            </form>
          </div>
        :
        ""
      }

      <div className="flex justify-between">
        <h1>Words</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={handlePageChange} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredWords.items.length / wordsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>
      <br/>
      {refFilteredWords.items.slice(viewPage * wordsPerPage - wordsPerPage, viewPage * wordsPerPage).map((word)=>
        <div className="border-solid border-white border" key={word.id}>
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
      {refFilteredWords.items.length === 0 ? "No words found" : ""}
    </div>
  );
}