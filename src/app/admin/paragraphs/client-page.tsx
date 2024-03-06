"use client"

import { useState, useEffect } from "react";
import { z } from "zod";

const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string(),
  source: z.string(),
  languageScript: z.object({
    id: z.number(),
    languageScript: z.string(),
  }),
  languageScriptIndex: z.number()
});
type Paragraph = z.infer<typeof Z_PARAGRAPH>;

const Z_RESPONSE = z.object({
  paragraphs: z.array(Z_PARAGRAPH)
});

async function getParagraphs() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/paragraph`, {
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

  useEffect(()=>{
    void (async ()=>setParagraphs(await getParagraphs()))();
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
  
    const i = paragraphs.findIndex((paragraph)=>paragraph.id === paragraphId);
    const newParagraphs = paragraphs.toSpliced(i, 1);
  
    setParagraphs([...newParagraphs]);
  }

  return (
    <div>
      Paragraphs <br/>
      {paragraphs.map((paragraph)=> 
        <div className="border-solid border-white border" key={paragraph.id}>
          id: {paragraph.id}<br/>
          text: {paragraph.text}<br/>
          author: {paragraph.author}<br/>
          source: {paragraph.source}<br/>
          languageScript: {paragraph.languageScript.languageScript}<br/>
          languageScriptIndex: {paragraph.languageScriptIndex}<br/>
          <button className="border-solid border-red-700 border rounded-lg p-2" onClick={()=>handleDelete(paragraph.id)}>X</button>
        </div>
      )}
      {paragraphs.length === 0 ? "No paragraphs found" : ""}
    </div>
  );
}