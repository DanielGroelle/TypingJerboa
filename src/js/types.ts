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
  author: z.string(),
  source: z.string(),
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
    author: z.string(),
    source: z.string()
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