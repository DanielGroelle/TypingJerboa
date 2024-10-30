import { z } from "zod";

const Z_PARAGRAPH_REPORT_RESPONSE = z.object({
  success: z.boolean()
});
export function reportParagraph(raceId: string, setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void fetch(`/api/paragraph/report`, {
    method: "POST",
    body: JSON.stringify({
      raceId: raceId
    }),
    mode: "cors",
    cache: "default"
  }).then(async (data) => {
    const tryResponse = Z_PARAGRAPH_REPORT_RESPONSE.safeParse(await data.json());
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

const Z_LESSON_REPORT_RESPONSE = z.object({
  success: z.boolean()
});
export function reportLesson(lessonId: string, setError: (error: string | null) => void, setSuccess: (success: string | null) => void) {
  void fetch(`/api/lesson/report`, {
    method: "POST",
    body: JSON.stringify({
      lessonId: lessonId
    }),
    mode: "cors",
    cache: "default"
  }).then(async (data) => {
    const tryResponse = Z_LESSON_REPORT_RESPONSE.safeParse(await data.json());
    if (!tryResponse.success) {
      setError("Error Reporting Lesson!");
      setSuccess(null);
    }
    else {
      setSuccess("Successfully Reported Lesson");
      setError(null);
    }
  });
}