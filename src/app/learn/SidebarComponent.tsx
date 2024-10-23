import { ManualKeyboardMapping } from "@/js/language-scripts";

export default function SidebarComponent({lessons, activeLesson, setActiveLesson, finishedLessonsNewCharacters, finishedLessonsWordExercise, resetLesson}: {
  lessons: ManualKeyboardMapping,
  activeLesson: string | null,
  setActiveLesson: (activeLesson: string | null)=>void,
  finishedLessonsNewCharacters: Set<string>,
  finishedLessonsWordExercise: Set<string>,
  resetLesson: ()=>void
}) {
  function displaySidebarCharsByType(lessonType: keyof ManualKeyboardMapping) {
    const lessonsList = [] as string[];
    for (const lessonList of Object.values(lessons[lessonType])) {
      //join together lesson characters into one string
      const joinedLessons = lessonList.map((lesson) => lesson.join(""));
      lessonsList.push(...joinedLessons);
    }
  
    return lessonsList.map((lesson, i)=>{
      const spacedLesson = lesson.split("").join(" ");
      let tailwindClassNames = "text-left p-2 hover:bg-cyan-800 flex justify-between";
      //if not last lesson, add a dotted line underneath
      if (i !== lessonsList.length - 1) {
        tailwindClassNames += " border-dotted border-b-2 border-white";
      }
      if (lesson === activeLesson) {
        tailwindClassNames += " bg-cyan-950";
      }
      return (
        <div className={tailwindClassNames} key={lesson} onClick={()=>{setActiveLesson(lesson); resetLesson()}}>
          <input type="button" value={(i + 1) + ": " + spacedLesson} />
          <div>
            {/*add checkmark if the lesson is complete*/}
            {finishedLessonsNewCharacters.has(lesson) ?
              <span className="checkmark"></span>
              :
              <span className="checkmark invisible"></span>
            }
            {finishedLessonsWordExercise.has(lesson) ?
              <span className="checkmark after:bg-amber-400 before:bg-amber-400"></span>
              :
              <span className="checkmark invisible"></span>
            }
          </div>
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col overflow-y-hidden min-w-fit">
      <h1>Lessons</h1>
      <div className="flex flex-col border-solid border-r-2 rounded border-white p-2 overflow-y-scroll">
        <h4><strong>Letters</strong></h4>
        {displaySidebarCharsByType("letters")}
        <h4><strong>Capitals</strong></h4>
        {displaySidebarCharsByType("capitals")}
        <h4><strong>Numbers</strong></h4>
        {displaySidebarCharsByType("numbers")}
        <h4><strong>Symbols</strong></h4>
        {displaySidebarCharsByType("symbols")}
      </div>
    </div>
  );
}