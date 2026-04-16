import type { LessonData } from "@/components/lesson-page";
import { lesson1Data } from "@/data/lesson1-data";
import { lesson2Data } from "@/data/lesson2-data";
import { lesson3Data } from "@/data/lesson3-data";
import { lesson4Data } from "@/data/lesson4-data";
import { lesson5Data } from "@/data/lesson5-data";
import { lesson6Data } from "@/data/lesson6-data";
import { lesson7Data } from "@/data/lesson7-data";
import { lesson8Data } from "@/data/lesson8-data";
import { lesson9Data } from "@/data/lesson9-data";
import { lesson10Data } from "@/data/lesson10-data";

const LESSON_MAP: Record<number, LessonData> = {
  1: lesson1Data,
  2: lesson2Data,
  3: lesson3Data,
  4: lesson4Data,
  5: lesson5Data,
  6: lesson6Data,
  7: lesson7Data,
  8: lesson8Data,
  9: lesson9Data,
  10: lesson10Data,
};

/** Returns playable LessonData objects for the given lesson IDs. Missing lessons are skipped. */
export function getRegionLessonData(lessonIds: number[]): LessonData[] {
  return lessonIds.map((id) => LESSON_MAP[id]).filter((l): l is LessonData => !!l);
}

/** Whether a given lesson has data available (i.e. is playable). */
export function isLessonPlayable(lessonId: number): boolean {
  return !!LESSON_MAP[lessonId];
}
