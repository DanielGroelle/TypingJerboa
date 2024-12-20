"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import FilterOptionsComponent from "../FilterOptionsComponent";
import { Lesson, Z_LESSON } from "@/js/types";
import { LanguageScripts } from "@/js/language-scripts";
import ItemCardComponent from "../ItemCardComponent";
import PageSelectComponent from "../PageSelectComponent";
import ConfirmationComponent from "../ConfirmationComponent";

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
    console.error(e);
    throw "getLessons failed";
  }

  return response.lessons;
}

export default function ClientAdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [viewPage, setViewPage] = useState(1);
  const lessonsPerPage = 25;

  const [confirmation, setConfirmation] = useState<(() => void) | null>(null);

  useEffect(()=>{
    void (async ()=>setLessons(await getLessons()))();
  },[]);

  function handleDelete(lessonId: string) {
    setConfirmation(() => () => {
      void (async ()=>{
        try {
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
    });
  }

  function deleteManyLessons(deleteLessons: Lesson[]) {
    setConfirmation(() => () => {
      const lessonIds = deleteLessons.map(lesson => lesson.id);
      
      void (async ()=>{
        try {
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
    });
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
      "startTime": { getter: (lesson: Lesson) => new Date(lesson.startTime) },
      "endTime": { getter: (lesson: Lesson) => new Date(lesson.endTime ?? 0) },
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

      <ConfirmationComponent confirmation={confirmation} setConfirmation={setConfirmation} />

      <div className="flex justify-between">
        <h1>Lessons</h1>
        <PageSelectComponent itemsLength={refFilteredLessons.items.length} viewPage={viewPage} setViewPage={setViewPage} itemsPerPage={lessonsPerPage} />
      </div>

      <div className="flex flex-col overflow-y-auto">
        {refFilteredLessons.items.slice(viewPage * lessonsPerPage - lessonsPerPage, viewPage * lessonsPerPage).map((lesson)=>
          (<ItemCardComponent
            item={lesson}
            itemFields={{
              "id": {getter: (lesson: Lesson) => lesson.id, editType: null, options: null},
              "user": {getter: (lesson: Lesson) => lesson.user ? `${String(lesson.user?.username)} - ${String(lesson.user?.id)}` : null, editType: null, options: null},
              "session": {getter: (lesson: Lesson) => lesson.session?.token ? `${String(lesson.session?.token)}` : null, editType: null, options: null},
              "startTime": {getter: (lesson: Lesson) => String(lesson.startTime), editType: null, options: null},
              "endTime": {getter: (lesson: Lesson) => String(lesson.endTime), editType: null, options: null},
              "languageScript": {getter: (lesson: Lesson) => lesson.languageScript.languageScript, editType: null, options: null},
              "lessonCharacters": {getter: (lesson: Lesson) => lesson.lessonCharacters, editType: null, options: null},
              "lessonText": {getter: (lesson: Lesson) => lesson.lessonText, editType: null, options: null},
              "mode": {getter: (lesson: Lesson) => lesson.mode, editType: null, options: null},
              "mistakes": {getter: (lesson: Lesson) => String(lesson.mistakes), editType: null, options: null}
            }}
            editParams={null}
            deleteItem={handleDelete}
            key={lesson.id}
          />)
        )}
      </div>
      {refFilteredLessons.items.length === 0 ? "No lessons found" : ""}
    </div>
  );
}