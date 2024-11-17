"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { Z_STATS } from "@/js/types";
import { useState, useEffect } from "react";
import { z } from "zod";

const Z_RESPONSE = z.object({
  languageScriptStats: z.record(z.string(), Z_STATS),
  siteStats: z.object({
    users: z.number(),
    visitors: z.number(),
    lessonsFinished: z.number(),
    racesFinished: z.number()
  })
});

async function getStats() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/stat`, {
      method: "GET",
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
  const [languageScript, setLanguageScript] = useState<string>("all");
  const [stats, setStats] = useState<z.infer<typeof Z_RESPONSE> | null>(null);
  const [showParagraph, setShowParagraph] = useState(false);

  useEffect(()=>{
    void (async ()=>setStats(await getStats()))();
  }, []);

  return (
    <div className="h-full">
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
      
      {!stats ? "Loading stats..." : 
        <div className="flex flex-col justify-between" style={{height: "96%"}}>
          <div>
            <h1>User Stats</h1>
            <br/>
            <p className="text-lg">Races: {stats?.languageScriptStats[languageScript]?.races}</p>
            <p className="text-lg">Average WPM: {stats?.languageScriptStats[languageScript]?.avgWpm.toFixed(1)}<span className="ml-1 text-neutral-400 underline" title="From up to the last 50 races">?</span></p>
            <p className="text-lg">Average Mistakes: {stats?.languageScriptStats[languageScript]?.avgMistakes.toFixed(1)}<span className="ml-1 text-neutral-400 underline" title="From up to the last 50 races">?</span></p>
            <p className="text-lg">
              Best WPM: {stats?.languageScriptStats[languageScript]?.bestWpm.toFixed(1)}
              {
                stats?.languageScriptStats[languageScript]?.bestParagraph?.length ?
                <input type="button" className="ml-1 underline text-blue-300" onClick={()=>{setShowParagraph(!showParagraph)}} value="Show Paragraph"/>
                :
                ""
              }
            </p>
            <p className="text-lg">{showParagraph ? stats?.languageScriptStats[languageScript]?.bestParagraph : ""}</p>
            {(() => {
              const createdAt = stats?.languageScriptStats[languageScript]?.createdAt;
              if (createdAt === null || createdAt === undefined) {
                return;
              }
              
              const offset = new Date(createdAt).getTimezoneOffset();
              const createdDate = new Date(new Date(createdAt).getTime() - (offset*60*1000));
              return <p className="mt-4 text-lg">Registered: {String(createdDate.toISOString().split('T')[0])}</p>
            })()}
          </div>

          <div>
            <h1>Site Stats</h1>
            <br/>
            <p className="text-lg">Unique Visitors: {stats?.siteStats.visitors}</p>
            <p className="text-lg">Registered Users: {stats?.siteStats.users}</p>
            <p className="text-lg">Lessons Finished: {stats?.siteStats.lessonsFinished}</p>
            <p className="text-lg">Races Finished: {stats?.siteStats.racesFinished}</p>
          </div>
        </div>
      }
    </div>
  );
}