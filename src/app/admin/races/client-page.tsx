"use client";

import { LanguageScripts } from "@/js/language-scripts";
import { Race, Z_RACE } from "@/js/types";
import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import ItemCardComponent from "../ItemCardComponent";
import PageSelectComponent from "../PageSelectComponent";

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
      try {
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

  function deleteManyRaces(deleteRaces: Race[]) {
    const raceIds = deleteRaces.map(race => race.id);
    
    void (async ()=>{
      try {
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
      "startTime": { getter: (race: Race) => new Date(race.startTime) },
      "endTime": { getter: (race: Race) => new Date(race.endTime ?? 0) },
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
        <PageSelectComponent itemsLength={refFilteredRaces.items.length} viewPage={viewPage} setViewPage={setViewPage} itemsPerPage={racesPerPage} />
      </div>

      <div className="flex flex-col overflow-y-auto">
        {refFilteredRaces.items.slice(viewPage * racesPerPage - racesPerPage, viewPage * racesPerPage).map((race)=>
          (<ItemCardComponent
            item={race}
            itemFields={{
              "id": {getter: (race: Race) => race.id, editType: null, options: null},
              "user": {getter: (race: Race) => race.user ? `${String(race.user?.username)} - ${String(race.user?.id)}` : null, editType: null, options: null},
              "session": {getter: (race: Race) => race.session?.token ? `${String(race.session?.token)}` : null, editType: null, options: null},
              "startTime": {getter: (race: Race) => String(race.startTime), editType: null, options: null},
              "endTime": {getter: (race: Race) => String(race.endTime), editType: null, options: null},
              "languageScript": {getter: (race: Race) => race.paragraph.languageScript.languageScript, editType: null, options: null},
              "text": {getter: (race: Race) => race.paragraph.text, editType: null, options: null},
              "mistakes": {getter: (race: Race) => String(race.mistakes), editType: null, options: null}
            }}
            editParams={null}
            deleteItem={handleDelete}
            key={race.id}
          />)
        )}
      </div>
      {refFilteredRaces.items.length === 0 ? "No races found" : ""}
    </div>
  );
}