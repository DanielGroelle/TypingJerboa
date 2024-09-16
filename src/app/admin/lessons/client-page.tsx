"use client";

import { useState, useEffect } from "react";
import { z } from "zod";

const Z_LESSON = z.object({
  id: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  }),
  lessonCharacters: z.string(),
  lessonText: z.string(),
  mode: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  mistakes: z.number().nullable(),
  user: z.object({
    username: z.string()
  }).nullable(),
  sessionToken: z.string().nullable()
});
type Lesson = z.infer<typeof Z_LESSON>;

const Z_RESPONSE = z.object({
  lessons: z.array(Z_LESSON)
});

async function getLessons() {
  let response;
  try {
    response = Z_RESPONSE.parse(await (await fetch(`/api/admin/lesson`, {
      method: "GET",
      mode: "cors",
      cache: "default"
    })).json());
  }
  catch(e: unknown) {
    console.log(e);
    throw "getLessons failed";
  }

  return response.lessons;
}

export default function ClientAdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(()=>{
    void (async ()=>setLessons(await getLessons()))();
  },[]);

  function handleDelete(lessonId: string) {
    void (async ()=>{
      try{
        await fetch(`/api/admin/lesson`, {
          method: "DELETE",
          body: JSON.stringify({
            id: lessonId
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const i = lessons.findIndex((lesson)=>lesson.id === lessonId);
    const newLessons = lessons.toSpliced(i, 1);

    setLessons([...newLessons]);
  }

  function handleDeleteAllFiltered() {
    const lessonIds = lessons.map((lesson)=>lesson.id);
    
    void (async ()=>{
      try{
        await fetch(`/api/admin/lesson/bulk`, {
          method: "DELETE",
          body: JSON.stringify({
            ids: lessonIds
          }),
          mode: "cors",
          cache: "default"
        });
      }
      catch(e: unknown) {
        throw "Delete failed";
      }
    })();
  
    const newLessons = lessons.filter((lesson)=>{
      return !lessonIds.includes(lesson.id)
    });

    setLessons([...newLessons]);
  }

  return (
    <div>
      <input type="button" className="border-solid border-red-700 border rounded-lg p-2 ml-2" onClick={handleDeleteAllFiltered} value="Delete all visible" />
      <br/>
      Lessons
      <br/>
      {lessons.map((lesson)=> 
        <div className="border-solid border-white border flex justify-between" key={lesson.id}>
          <div>
            id: {lesson.id}<br/>
            languageScript: {lesson.languageScript.languageScript}<br/>
            lessonCharacters: {lesson.lessonCharacters}<br/>
            lessonText: {lesson.lessonText}<br/>
            mode: {lesson.mode}<br/>
            startTime: {String(lesson.startTime)}<br/>
            endTime: {String(lesson.endTime)}<br/>
            mistakes: {lesson.mistakes}<br/>
            sessionToken: {lesson.sessionToken}<br/>
            user: {lesson.user?.username}<br/>
          </div>
          <div>
            <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(lesson.id)} value="X" />
          </div>
        </div>
      )}
      {lessons.length === 0 ? "No lessons found" : ""}
    </div>
  );
}