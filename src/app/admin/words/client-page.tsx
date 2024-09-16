"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

const Z_WORD = z.object({
  id: z.number(),
  word: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  })
});
type Word = z.infer<typeof Z_WORD>;

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

  useEffect(()=>{
    void (async ()=>setWords(await getWords()))();
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
  }

  return (
    <div>
      <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={handleDeleteAllFiltered} value="Delete all visible" />
      <br/>
      Words
      <br/>
      {words.map((word)=> 
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