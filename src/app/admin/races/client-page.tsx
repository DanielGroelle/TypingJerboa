"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

const Z_RACE = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  mistakes: z.number().nullable(),
  paragraph: z.object({
    text: z.string()
  }),
  user: z.object({
    id: z.number(),
    username: z.string()
  }).nullable(),
  session: z.object({
    token: z.string()
  }).nullable()
});
type Race = z.infer<typeof Z_RACE>;

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

  return (
    <div>
      Races <br/>
      {races.map((race)=> 
        <div className="border-solid border-white border flex justify-between" key={race.id}>
          <div>
            id: {race.id}<br/>
            user: {String(race.user?.username)} - {String(race.user?.id)}<br/>
            session: {String(race.session?.token)}<br/>
            startTime: {race.startTime}<br/>
            endTime: {race.endTime}<br/>
            mistakes: {race.mistakes}<br/>
            paragraph: {race.paragraph.text}
          </div>
          <div>
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(race.id)} value="X" />
          </div>
        </div>
      )}
      {races.length === 0 ? "No races found" : ""}
    </div>
  );
}