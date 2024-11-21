"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { reportParagraph } from "@/utility/utility";
import NavigationComponent from "@/app/components/NavigationComponent";
import { LanguageScripts, Z_LANGUAGE_SCRIPT } from "@/js/language-scripts";

const Z_RESPONSE = z.object({
  user: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string(),
  mistakes: z.number().nullable(),
  paragraph: z.object({
    text: z.string(),
    author: z.string().nullable(),
    source: z.string().nullable(),
    languageScript: Z_LANGUAGE_SCRIPT.nullable()
  }),
  newBest: z.boolean()
});

type RaceData = z.infer<typeof Z_RESPONSE>;

export default function ClientRaceFinish() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  if (id === null) {
    router.push("/404");
    throw "404";
  }

  const [raceData, setRaceData] = useState<RaceData>({
    user: "",
    startTime: "",
    endTime: "",
    mistakes: null,
    paragraph: {
      text: "",
      author: "",
      source: "",
      languageScript: null
    },
    newBest: false
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [raceReported, setRaceReported] = useState(false);

  useEffect(()=>{
    setRaceReported(false);
  }, [error]);

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
        <p className="text-lg">User: {raceData.user}</p>
        :
        <div className="flex items-center">
          <p className="text-lg">Unregistered User</p>
          <Link href="/register" className="underline decoration-blue-500 h-fit ml-2">Register</Link>
        </div>
      }
      {
        raceData?.endTime ?
        (() => {
          const offset = new Date(raceData.endTime).getTimezoneOffset();
          const createdDate = new Date(new Date(raceData.endTime).getTime() - (offset*60*1000));
          return <p className="text-lg">Date Achieved: {String(createdDate.toISOString().split('T')[0])}</p>
        })()
        :
        <p className="text-lg">Date Achieved:</p>
      }
      <p className="text-lg">WPM: {!isNaN(wpm) ? wpm.toFixed(1) : ""} {raceData.newBest ?
        <span className="new-best">New Best!</span>
        : ""}
      </p>
      <p className="text-lg">Time: {!isNaN(msTime) ? `${msTime / 1000}s` : ""}</p>
      <p className="text-lg">Mistakes: {raceData.mistakes}</p>
      <br/>
      <p className="text-lg">Paragraph: {raceData.paragraph.text}</p>
      {raceData.paragraph.author !== null ? <p className="text-lg">Author: {raceData.paragraph.author}</p> : ""}
      {raceData.paragraph.source !== null ? <p className="text-lg">Source: {raceData.paragraph.source}</p> : ""}
      <p className="text-lg">Language Script: {raceData.paragraph.languageScript !== null ? LanguageScripts[raceData.paragraph.languageScript].display : ""}</p>
      <br/>

      <div className="flex flex-col sm:flex-row">
        <NavigationComponent className="border-solid border-2 border-white rounded-lg p-2" name="Race again" route="/race" />
        <input type="button" className="border-solid border-green-600 border-2 rounded-lg mt-1 sm:mt-0 sm:ml-1 p-2" onClick={()=>{
          void navigator.clipboard.writeText(window.location.href); setSuccess("Copied share link"); setError(null)
        }} value="Copy Share Link" />
        <input type="button" className="border-solid border-red-700 border-2 rounded-lg mt-1 sm:mt-0 sm:ml-1 p-2" disabled={raceReported} onClick={()=>{
          setRaceReported(true);
          reportParagraph(id, setError, setSuccess);
        }} value="Report Paragraph" />
      </div>

      <div className="border-solid border-red-500 border rounded-lg w-fit mt-2 p-2" hidden={typeof error !== "string"}>
        {error}
      </div>
      <div className="border-solid border-green-500 border rounded-lg w-fit mt-2 p-2" hidden={typeof success !== "string"}>
        {success}
      </div>
    </div>
  );
}