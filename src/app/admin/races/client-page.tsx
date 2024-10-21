"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { Race, Z_RACE } from "@/js/types";
import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";

const Z_RESPONSE = z.object({
  races: z.array(Z_RACE)
});

async function getRaces() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/race`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    throw "getRaces failed";
  }

  return response.races;
}

export default function ClientAdminRaces() {
  const [races, setRaces] = useState<Race[]>([]);
  const [viewPage, setViewPage] = useState(1);
  const racesPerPage = 25;

  useEffect(()=>{
    void (async ()=>setRaces(await getRaces()))();
  },[]);

  function handleDelete(raceId: string) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/race`, {
          method: "DELETE",
          body: JSON.stringify({
            id: raceId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = races.findIndex((race)=>race.id === raceId);
    const newRaces = races.toSpliced(i, 1);

    setRaces([...newRaces]);
  }

  function deleteManyRaces(races: Race[]) {
    const raceIds = races.map((race)=>race.id);
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/race/bulk`, {
          method: "DELETE",
          body: JSON.stringify({
            ids: raceIds
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const newRaces = races.filter((race)=>{
      return !raceIds.includes(race.id)
    });

    setRaces([...newRaces]);
  }

  const refFilteredRaces: {items: Race[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Race>({
    items: races,
    refFilteredItems: refFilteredRaces,
    selectFilters: {
      "languageScript": {
        getter: race => race.paragraph.languageScript.languageScript,
        options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
      },
      "state": {
        getter: race => race.endTime ? "finished": "unfinished",
        options: ["finished", "unfinished"]
      }
    },
    filters: {
      "id": { getter: (race: Race) => race.id },
      "startTime": { getter: (race: Race) => race.startTime },
      "endTime": { getter: (race: Race) => String(race.endTime) },
      "mistakes": { getter: (race: Race) => String(race.mistakes) },
      "paragraph": { getter: (race: Race) => race.paragraph.text },
      "user": { getter: (race: Race) => String(race.user?.username) },
      "userId": { getter: (race: Race) => String(race.user?.id) },
      "session": { getter: (race: Race) => String(race.session?.token) }
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyRaces
  });

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <div className="flex justify-between">
        <h1>Races</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredRaces.items.length / racesPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {refFilteredRaces.items.slice(viewPage * racesPerPage - racesPerPage, viewPage * racesPerPage).map((race)=>
          <div className="border-solid border-white border flex justify-between" key={race.id}>
            <div>
              id: {race.id}<br/>
              user: {race.user ? `${String(race.user?.username)} - ${String(race.user?.id)}` : "null"}<br/>
              session: {race.session?.token ? `${String(race.session?.token)}` : "null"}<br/>
              startTime: {race.startTime}<br/>
              endTime: {String(race.endTime)}<br/>
              wpm: {
                race.endTime ?
                  ((race.paragraph.text.length / 5) / ((new Date(race.endTime).getTime() - new Date(race.startTime).getTime()) / 1000 / 60)).toFixed(1)
                :
                "N/A"
              }<br/>
              mistakes: {String(race.mistakes)}<br/>
              paragraph: {race.paragraph.text}
            </div>
            <div>
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(race.id)} value="X" />
            </div>
          </div>
        )}
      </div>
      {races.length === 0 ? "No races found" : ""}
    </div>
  );
}