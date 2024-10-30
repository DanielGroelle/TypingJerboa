"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { useState, useEffect } from "react";
import { z } from "zod";

const Z_RESPONSE = z.object({
  races: z.number(),
  avgWpm: z.number(),
  avgMistakes: z.number(),
  bestWpm: z.number(),
  bestParagraph: z.string().nullable(),
  createdAt: z.string().nullable()
});

async function getStats(languageScript: string) {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/stat`, {
      method: "POST",
      body: JSON.stringify({
        languageScript: languageScript
      }),
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log(e);
    throw "getStats failed";
  }

  return response;
}

export default function ClientStats() {
  const [languageScript, setLanguageScript] = useState<string>(LanguageScripts["latin-english"].internal);
  const [stats, setStats] = useState<z.infer<typeof Z_RESPONSE> | null>(null);
  const [showParagraph, setShowParagraph] = useState(false);

  useEffect(()=>{
    void (async ()=>setStats(await getStats(languageScript)))();
  }, [languageScript]);

  return (
    <div>
      <div className="flex justify-end">
        <p>Language Script:</p>
        <select name="script-select" id="script-select" value={languageScript} onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{
          setLanguageScript(e.target.value);
        }}>
          {Object.values(LanguageScripts).map(({internal, display})=>(
            <option key={internal} value={internal}>{display}</option>
          ))}
          <option value="all">All Scripts</option>
        </select>
      </div>

      <h1>Stats</h1>
      <br/>
      <p>Races: {stats?.races}</p>
      <p>Average WPM: {stats?.avgWpm.toFixed(1)}<span className="ml-1 text-sm text-neutral-400 underline" title="From up to the last 50 races">?</span></p>
      <p>Average Mistakes: {stats?.avgMistakes.toFixed(1)}<span className="ml-1 text-sm text-neutral-400 underline" title="From up to the last 50 races">?</span></p>
      <p>
        Best WPM: {stats?.bestWpm.toFixed(1)}
        {
          stats?.bestParagraph?.length ?
          <input type="button" className="ml-1 underline text-sm text-blue-300" onClick={()=>{setShowParagraph(!showParagraph)}} value="Show Paragraph"/>
          :
          ""
        }
      </p>
      <p>{showParagraph ? stats?.bestParagraph : ""}</p>
      {stats?.createdAt && (() => {
        const offset = new Date(stats.createdAt).getTimezoneOffset();
        const createdDate = new Date(new Date(stats.createdAt).getTime() - (offset*60*1000));
        return <p className="mt-4">Registered: {String(createdDate.toISOString().split('T')[0])}</p>
      })()}
      {!stats ? "Loading stats..." : ""}
    </div>
  );
}