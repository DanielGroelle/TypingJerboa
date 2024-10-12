"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import { Lesson, Z_LESSON } from "@/js/types";
import { LanguageScripts } from "@/js/language-scripts";

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
  const [viewPage, setViewPage] = useState(1);
  const lessonsPerPage = 25;

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

  function deleteManyLessons() {
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

  const refFilteredLessons: {items: Lesson[]} = {items: []};
  const filterOptionsComponent = FilterOptionsComponent<Lesson>({
    items: lessons,
    refFilteredItems: refFilteredLessons,
    selectFilters: {
      "languageScript": {
        getter: lesson => lesson.languageScript.languageScript,
        options: Object.values(LanguageScripts).map(languageScript => languageScript.internal)
      },
      "state": {
        getter: lesson => lesson.endTime ? "finished": "unfinished",
        options: ["finished", "unfinished"]
      },
      "mode": {
        getter: lesson => lesson.mode,
        options: ["new-characters", "word-exercise"]
      }
    },
    filters: {
      "id": { getter: (lesson: Lesson) => lesson.id },
      "startTime": { getter: (lesson: Lesson) => lesson.startTime },
      "endTime": { getter: (lesson: Lesson) => String(lesson.endTime) },
      "mistakes": { getter: (lesson: Lesson) => String(lesson.mistakes) },
      "lessonCharacters": { getter: (lesson: Lesson) => lesson.lessonCharacters },
      "lessonText": { getter: (lesson: Lesson) => lesson.lessonText },
      "mode": { getter: (lesson: Lesson) => lesson.mode },
      "user": { getter: (lesson: Lesson) => String(lesson.user?.username) },
      "userId": { getter: (lesson: Lesson) => String(lesson.user?.id) },
      "session": { getter: (lesson: Lesson) => String(lesson.session?.token) }
    },
    setViewPage: setViewPage,
    deleteManyItems: deleteManyLessons
  });

  return (
    <div className="flex flex-col overflow-y-hidden" style={{height: "85vh"}}>
      {filterOptionsComponent}

      <div className="flex justify-between">
        <h1>Lessons</h1>
        <div className="flex mr-10">
          <p className="leading-10">Page:</p>
          <select onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setViewPage(Number(e.target.value))}} value={viewPage} id="page-select">
            {Array.from(Array(Math.ceil(refFilteredLessons.items.length / lessonsPerPage))).map((_, i)=>{
              return <option key={i + 1}>{i + 1}</option>
            })}
          </select>
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {refFilteredLessons.items.slice(viewPage * lessonsPerPage - lessonsPerPage, viewPage * lessonsPerPage).map((lesson)=>
          <div className="border-solid border-white border flex justify-between" key={lesson.id}>
            <div>
              id: {lesson.id}<br/>
              user: {lesson.user ? `${String(lesson.user?.username)} - ${String(lesson.user?.id)}` : "null"}<br/>
              session: {lesson.session?.token ? `${String(lesson.session?.token)}` : "null"}<br/>
              startTime: {String(lesson.startTime)}<br/>
              endTime: {String(lesson.endTime)}<br/>
              languageScript: {lesson.languageScript.languageScript}<br/>
              lessonCharacters: {lesson.lessonCharacters}<br/>
              lessonText: {lesson.lessonText}<br/>
              mode: {lesson.mode}<br/>
              mistakes: {String(lesson.mistakes)}<br/>
            </div>
            <div>
              <input type="button" className="border-solid border-red-700 border-2 rounded-lg p-2" onClick={()=>handleDelete(lesson.id)} value="X" />
            </div>
          </div>
        )}
      </div>
      {lessons.length === 0 ? "No lessons found" : ""}
    </div>
  );
}