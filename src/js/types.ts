import { z } from "zod";

export const Z_USER = z.object({
  id: z.number(),
  username: z.string(),
  admin: z.boolean(),
  createdAt: z.string()
});
export type User = z.infer<typeof Z_USER>;

export const Z_RACE = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  mistakes: z.number().nullable(),
  paragraph: z.object({
    text: z.string(),
    languageScript: z.object({
      languageScript: z.string()
    })
  }),
  user: z.object({
    id: z.number(),
    username: z.string()
  }).nullable(),
  session: z.object({
    token: z.string()
  }).nullable()
});
export type Race = z.infer<typeof Z_RACE>;

export const Z_PARAGRAPH = z.object({
  id: z.number(),
  text: z.string(),
  author: z.string().nullable(),
  source: z.string().nullable(),
  languageScript: z.object({
    languageScript: z.string()
  }),
  selectable: z.boolean()
});
export type Paragraph = z.infer<typeof Z_PARAGRAPH>;

export const Z_WORD = z.object({
  id: z.number(),
  word: z.string(),
  languageScript: z.object({
    languageScript: z.string()
  })
});
export type Word = z.infer<typeof Z_WORD>;

export const Z_LESSON = z.object({
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
    id: z.number(),
    username: z.string()
  }).nullable(),
  session: z.object({
    token: z.string()
  }).nullable()
});
export type Lesson = z.infer<typeof Z_LESSON>;

export const Z_PARAGRAPH_REPORT = z.object({
  id: z.number(),
  paragraph: z.object({
    id: z.number(),
    text: z.string(),
    author: z.string().nullable(),
    source: z.string().nullable()
  }).nullable(),
  paragraphText: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string()
  }).nullable(),
  session: z.object({
    token: z.string()
  }).nullable(),
  resolved: z.boolean(),
  createdAt: z.string()
});
export type ParagraphReport = z.infer<typeof Z_PARAGRAPH_REPORT>;

export const Z_LESSON_REPORT = z.object({
  id: z.number(),
  lesson: z.object({
    id: z.string(),
    lessonText: z.string(),
    lessonCharacters: z.string()
  }).nullable(),
  lessonText: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string()
  }).nullable(),
  session: z.object({
    token: z.string()
  }).nullable(),
  resolved: z.boolean(),
  createdAt: z.string()
});
export type LessonReport = z.infer<typeof Z_LESSON_REPORT>;

export const Z_LANGUAGESCRIPT_STATS = z.object({
  races: z.number(),
  avgWpm: z.number(),
  avgMistakes: z.number(),
  bestWpm: z.number(),
  bestParagraph: z.string().nullable(),
  createdAt: z.string().nullable(),
  lessons: z.number()
});
export type LanguageScriptStats = z.infer<typeof Z_LANGUAGESCRIPT_STATS>;