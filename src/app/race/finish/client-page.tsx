"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Z_RESPONSE = z.object({
  user: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  mistakes: z.number(),
  paragraph: z.object({
    text: z.string(),
    author: z.string().nullable(),
    source: z.string().nullable()
  })
});

type RaceData = z.infer<typeof Z_RESPONSE>;

export default function ClientRaceFinish() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  const [raceData, setRaceData] = useState<RaceData>({user: "", startTime: "", endTime: "", mistakes: 0, paragraph: {text: "", author: "", source: ""}});

  useEffect(()=>{
    void fetch(`/api/race`, {
      method: "POST",
      body: JSON.stringify({
        id: id
      }),
      mode: "cors",
      cache: "default"
    }).then(async (data) => {
      const tryResponse = Z_RESPONSE.safeParse(await data.json());
      if (!tryResponse.success) return router.push("/404"); //TODO: instead of going to 404, make page say "race not found" or something

      setRaceData(tryResponse.data);
    });
  }, [id]);

  const msTime = new Date(raceData.endTime).getTime() - new Date(raceData.startTime).getTime();

  return (
    <div>
      {
        raceData.user ?
        <p>User: {raceData.user}</p>
        :
        <div className="flex">
          <p className="flex items-center">Unregistered User</p>
          <Link href="/register" className="border-solid border-blue-500 border rounded-lg ml-1 p-1 text-sm">Register</Link>
        </div>
      }
      <p>WPM: {((raceData.paragraph.text.length / 5) / (msTime / 1000 / 60)).toFixed(1)}</p>
      <p>Time: {msTime / 1000}s</p>
      <p>Mistakes: {raceData.mistakes}</p>
      <p>Paragraph: {raceData.paragraph.text}</p>
      <p>Author: {raceData.paragraph.author}</p>
      <p>Source: {raceData.paragraph.source}</p>
      <br/>
      <div className="flex">
        <Link href="/race" className="border-solid border-white border-2 rounded-lg p-2">Race again</Link>
        <input type="button" className="border-solid border-green-600 border-2 rounded-lg ml-1 p-2" onClick={()=>{void navigator.clipboard.writeText(window.location.href)}} value="Copy Share Link" />
      </div>
    </div>
  );
}