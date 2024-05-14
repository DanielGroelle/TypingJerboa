"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const Z_RESPONSE = z.object({
  startTime: z.string(),
  endTime: z.string(),
  mistakes: z.number(),
  paragraph: z.string()
});
export default function ClientRaceFinish() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [raceData, setRaceData] = useState({startTime: "", endTime: "", mistakes: 0, paragraph: ""});

  useEffect(()=>{
    void fetch(`/api/race`, {
      method: "POST",
      body: JSON.stringify({
        id: id
      }),
      mode: "cors",
      cache: "default"
    }).then(async (data) => {
      setRaceData(Z_RESPONSE.parse(await data.json()));
    });
  }, [id]);

  const time = new Date(raceData.endTime).getTime() - new Date(raceData.startTime).getTime();

  return (
    <div>
      WPM: {((raceData.paragraph.length / 5) / (time / 1000 / 60)).toFixed(1)}<br/>
      Time: {time / 1000}s<br/>
      Mistakes: {raceData.mistakes}<br/>
      Paragraph: {raceData.paragraph}<br/>
      <Link href="/race">Race again</Link>
    </div>
  );
}