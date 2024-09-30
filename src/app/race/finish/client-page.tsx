"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const Z_RESPONSE = z.object({
  user: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  mistakes: z.number(),
  paragraph: z.string()
});
export default function ClientRaceFinish() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [raceData, setRaceData] = useState({user: "", startTime: "", endTime: "", mistakes: 0, paragraph: ""});

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

  //TODO: display the paragraphs source and author
  return (
    <div>
      <p>User: {raceData.user.length > 0 ? `${raceData.user}` : "Unregistered User"}</p> {/*TODO: add a prompt here to login/register*/}
      <p>WPM: {((raceData.paragraph.length / 5) / (time / 1000 / 60)).toFixed(1)}</p>
      <p>Time: {time / 1000}s</p>
      <p>Mistakes: {raceData.mistakes}</p>
      <p>Paragraph: {raceData.paragraph}</p>
      <br/>
      <Link href="/race" className="border-solid border-white border rounded-lg p-2">Race again</Link>
    </div>
    //TODO: add share link here
  );
}

//TODO: fix issue with going back a page, and causing race finish to be null
//the text box is shown and is filled from the previous race. and upon doing anything to the text, causes a redirect to /race/finish?id=null
//TODO: also probably make invalid race finish id's show 404 or something