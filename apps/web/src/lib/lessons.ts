import { apiFetch } from "./api";
import type { ModuleDetail } from "./modules";

export type Lesson = ModuleDetail["lessons"][number];

/** A lesson is consumable once it has a READY video or a readable body. */
export function lessonHasContent(l: Lesson): boolean {
  return l.videoStatus === "READY" || l.bodyEn !== null;
}

/** Openable by this learner: has content AND is a preview or is assigned. */
export function lessonOpenable(l: Lesson, hasAssignment: boolean): boolean {
  return lessonHasContent(l) && (l.isPreview || hasAssignment);
}

/**
 * Where "Resume" should land: the first openable, content-bearing lesson the
 * learner hasn't completed yet. Null when every consumable lesson is done.
 */
export function nextLesson(
  mod: ModuleDetail,
  hasAssignment: boolean,
): Lesson | null {
  return (
    mod.lessons.find(
      (l) => lessonOpenable(l, hasAssignment) && l.completedAt === null,
    ) ?? null
  );
}

export type MyAssignment = {
  id: string;
  status: "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED" | "REVOKED";
  module: { slug: string };
};

/** The caller's assignment for a given module slug, or null. */
export async function findAssignment(
  slug: string,
): Promise<MyAssignment | null> {
  const res = await apiFetch("/me/assignments");
  if (!res.ok) return null;
  const list = (await res.json()) as MyAssignment[];
  return list.find((a) => a.module.slug === slug) ?? null;
}
