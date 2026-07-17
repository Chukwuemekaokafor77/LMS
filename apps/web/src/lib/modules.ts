import { apiFetch } from "./api";

export type ModuleDetail = {
  id: string;
  slug: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  durationMin: number;
  lessons: {
    id: string;
    titleEn: string;
    titleFr: string;
    isPreview: boolean;
    videoStatus: string;
    durationSec: number | null;
    completedAt: string | null;
  }[];
  quiz: { id: string; passMark: number } | null;
  quizUnlocked: boolean;
};

export async function getModule(slug: string): Promise<ModuleDetail | null> {
  const res = await apiFetch(`/modules/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}
