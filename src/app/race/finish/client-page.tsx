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
  mistakes: z.number().nullable(),
  paragraph: z.object({
    text: z.string(),
    author: z.string().nullable(),
    source: z.string().nullable()
  })
});

type RaceData = z.infer<typeof Z_RESPONSE>;

const Z_REPORT_RESPONSE = z.object({
  success: z.boolean()
});

function reportParagraph(raceId: string, setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void fetch(`/api/paragraph/report`, {
    method: "POST",
    body: JSON.stringify({
      raceId: raceId
    }),
    mode: "cors",
    cache: "default"
  }).then(async (data) => {
    const tryResponse = Z_REPORT_RESPONSE.safeParse(await data.json());
    if (!tryResponse.success) {
      setError("Error Reporting Paragraph!");
      setSuccess(null);
    }
    else {
      setSuccess("Successfully Reported Paragraph");
      setError(null);
    }
  });
}

export default function ClientRaceFinish() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  if (id === null) {
    router.push("/404");
    throw "404";
  }

  const [raceData, setRaceData] = useState<RaceData>({user: "", startTime: "", endTime: "", mistakes: null, paragraph: {text: "", author: "", source: ""}});
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const wpm = (raceData.paragraph.text.length / 5) / (msTime / 1000 / 60);

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
      {
        raceData?.endTime ?
        (() => {
          const offset = new Date(raceData.endTime).getTimezoneOffset();
          const createdDate = new Date(new Date(raceData.endTime).getTime() - (offset*60*1000));
          return <p>Date Achieved: {String(createdDate.toISOString().split('T')[0])}</p>
        })()
        :
        <p>Date Achieved:</p>
      }
      <p>WPM: {!isNaN(wpm) && wpm.toFixed(1)}</p>
      <p>Time: {!isNaN(msTime) && `${msTime / 1000}s`}</p>
      <p>Mistakes: {raceData.mistakes}</p>
      <p>Paragraph: {raceData.paragraph.text}</p>
      <p>Author: {raceData.paragraph.author}</p>
      <p>Source: {raceData.paragraph.source}</p>
      <br/>

      <div className="border-solid border-red-500 border rounded-lg p-2" hidden={typeof error !== "string"}>
        {error}
      </div>
      <div className="border-solid border-green-500 border rounded-lg p-2" hidden={typeof success !== "string"}>
        {success}
      </div>
      <div className="flex">
        <Link href="/race" className="border-solid border-white border-2 rounded-lg p-2">Race again</Link>
        <input type="button" className="border-solid border-green-600 border-2 rounded-lg ml-1 p-2" onClick={()=>{void navigator.clipboard.writeText(window.location.href)}} value="Copy Share Link" />
        <input type="button" className="border-solid border-red-700 border-2 rounded-lg ml-1 p-2" onClick={()=>reportParagraph(id, setError, setSuccess)} value="Report Paragraph" />
      </div>
    </div>
  );
}