"use client";

import { useState, useEffect, FormEvent } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import { LanguageScripts } from "@/js/language-scripts";
import { Word, Z_WORD } from "@/js/types";
import ItemCardComponent from "../ItemCardComponent";
import CsvImportComponent from "./CsvImportComponent";
import PageSelectComponent from "../PageSelectComponent";
import ConfirmationComponent from "../ConfirmationComponent";

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

  const [confirmation, setConfirmation] = useState<(() => void) | null>(null);

  useEffect(()=>{
    void (async ()=>{
      const fetchedWords = await getWords();
      setWords(fetchedWords);
    })();
  },[]);

  function handleSave(editWord: Word) {
    void (async ()=>{
      try {
        const response = Z_WORD.parse(await(await fetch(`/api/admin/word/edit`, {
          method: "POST",
          body: JSON.stringify({...editWord}),
          mode: "cors",
          cache: "default"
        })).json());

        //rerender edits
        const wordIndex = words.findIndex((word)=>word.id === response.id);
        words[wordIndex] = response;
  
        setWords([...words]);
      }
      catch(e: unknown) {
        throw "Edit failed";
      }
    })();
  }

  function handleDelete(wordId: number) {
    setConfirmation(() => () => {
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
    });
  }

  function deleteManyWords(deleteWords: Word[]) {
    setConfirmation(() => () => {
      const wordIds = deleteWords.map(word => word.id);

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
    });
  }

  function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  
    if (newWord === null) throw "New Word is null!";
  
    void (async ()=>{
      try {
        const response = Z_WORD.parse(await(await fetch(`/api/admin/word`, {
          method: "POST",
          body: JSON.stringify(newWord),
          mode: "cors",
          cache: "default"
        })).json());
  
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
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <ConfirmationComponent confirmation={confirmation} setConfirmation={setConfirmation} />

      <div className="flex">
        <input type="button" className="border-solid border-blue-600 border rounded-lg p-2 mr-2" onClick={()=>setNewWord(newWord ? null : {
          word: "",
          languageScript: {
            languageScript: Object.values(LanguageScripts)[0].internal
          }
        })} value="Add Word" />
        <CsvImportComponent words={words} setWords={setWords} />
      </div>

      {
        //add word form
        newWord ?
        <div className="border-solid border-green-700 border">
          <form onSubmit={handleAdd}>
              <div className="flex">
                <span>word:</span>
                <input type="text" id="word-input" className="w-full" onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                  setNewWord({...newWord, word: e.target.value});
                }}/><br/>
              </div>
              languageScript:<select id="language-script-edit-select" onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
                setNewWord({...newWord, languageScript: {languageScript: e.target.value}});
              }}>
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
        <PageSelectComponent itemsLength={refFilteredWords.items.length} viewPage={viewPage} setViewPage={setViewPage} itemsPerPage={wordsPerPage} />
      </div>

      <div className="flex flex-col overflow-y-auto">  
        {refFilteredWords.items.slice(viewPage * wordsPerPage - wordsPerPage, viewPage * wordsPerPage).map((word)=>
          (<ItemCardComponent
            item={word}
            itemFields={{
              "id": {getter: (word: Word) => word.id, editType: null, options: null},
              "word": {getter: (word: Word) => word.word, editType: "text", options: null},
              "languageScript": {getter: (word: Word) => word.languageScript.languageScript, editType: "languageScript", options: null}
            }}
            editParams={{
              items: words,
              setItems: setWords,
              saveItem: handleSave
            }}
            deleteItem={handleDelete}
            key={word.id}
          />)
        )}
      </div>
      {refFilteredWords.items.length === 0 ? "No words found" : ""}
    </div>
  );
}