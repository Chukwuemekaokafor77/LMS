/**
 * Structural + positioning guards for the home-care STARTER LIBRARY.
 *
 * Pure data checks — no database, no Nest app. These run in milliseconds and
 * exist because the library is hand-authored content that several people will
 * edit: the failure modes are a half-translated module, a quiz whose correct
 * answer index no longer points at anything, or — the expensive one — a
 * positioning disclaimer quietly edited out.
 *
 * The positioning block at the bottom is the reason this file is worth having.
 * LMS_COMPLETION_PLAN.md §B0 is a set of promises about how this content may be
 * described, and a promise that only lives in a markdown file drifts.
 */
import { describe, it, expect } from "vitest";
import {
  FR_MACHINE_DRAFT,
  HOME_CARE_MODULES,
  STARTER_NOTICE,
  type HomeCareModule,
} from "./home-care-content";
import { HOME_CARE_PHASE_B_MODULES } from "./home-care-content-phase-b";

const ALL: HomeCareModule[] = [
  ...HOME_CARE_MODULES,
  ...HOME_CARE_PHASE_B_MODULES,
];

/** The only module that may be scoped to a province (§B0 Finding 2). */
const NS_CCA_SLUG = "ns-cca-certification-prep";

/** Runs a per-module assertion and names the module in the failure. */
const forEachModule = (fn: (m: HomeCareModule) => void) =>
  it.each(ALL.map((m) => [m.slug, m] as const))("%s", (_slug, m) => fn(m));

const bodies = (m: HomeCareModule) =>
  m.lessons.flatMap((l) => [l.bodyEn, l.bodyFr]);

const allText = (m: HomeCareModule) => [
  m.titleEn,
  m.titleFr,
  m.descriptionEn,
  m.descriptionFr,
  ...bodies(m),
  ...m.questions.flatMap((q) => [
    q.promptEn,
    q.promptFr,
    ...q.choicesEn,
    ...q.choicesFr,
    q.explainEn ?? "",
    q.explainFr ?? "",
  ]),
];

describe("starter library — catalogue", () => {
  it("seeds every module exactly once, under a kebab-case slug", () => {
    const slugs = ALL.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("is not silently shrinking", () => {
    // A floor, not a target. Raise it when the library grows; a drop means
    // modules were removed, which should be a deliberate, reviewed act.
    expect(ALL.length).toBeGreaterThanOrEqual(19);
  });
});

describe("starter library — bilingual completeness", () => {
  // NB's official-languages reality is the whole reason this library is
  // bilingual. A module with an empty or copy-pasted FR side ships as English.
  forEachModule((m) => {
    for (const [en, fr, what] of [
      [m.titleEn, m.titleFr, "title"],
      [m.descriptionEn, m.descriptionFr, "description"],
    ] as const) {
      expect(en.trim(), `${what} EN`).not.toBe("");
      expect(fr.trim(), `${what} FR`).not.toBe("");
      expect(fr, `${what} FR is untranslated`).not.toBe(en);
    }

    expect(m.lessons.length, "lessons").toBeGreaterThan(0);
    m.lessons.forEach((l, i) => {
      expect(l.titleEn.trim(), `lesson ${i} titleEn`).not.toBe("");
      expect(l.titleFr.trim(), `lesson ${i} titleFr`).not.toBe("");
      expect(l.titleFr, `lesson ${i} titleFr untranslated`).not.toBe(l.titleEn);
      // A body is what gates the quiz when there is no video yet, so an empty
      // or stub body silently unlocks the quiz with nothing to learn.
      expect(l.bodyEn.length, `lesson ${i} bodyEn too short`).toBeGreaterThan(400);
      expect(l.bodyFr.length, `lesson ${i} bodyFr too short`).toBeGreaterThan(400);
      expect(l.bodyFr, `lesson ${i} bodyFr untranslated`).not.toBe(l.bodyEn);
      // Whole-string inequality misses the likelier failure: a body that was
      // only half translated, or replaced with English during an edit. Any
      // genuine fr-CA paragraph of this length carries accents.
      const accents = (l.bodyFr.match(/[àâäçéèêëîïôöùûüœ]/gi) ?? []).length;
      expect(accents, `lesson ${i} bodyFr does not read as French`)
        .toBeGreaterThan(l.bodyFr.length / 100);
    });
  });
});

describe("starter library — quiz banks", () => {
  forEachModule((m) => {
    expect(m.passMark, "passMark").toBe(80);
    expect(m.questions.length, "questions").toBeGreaterThanOrEqual(3);

    m.questions.forEach((q, i) => {
      const at = `question ${i}`;
      expect(q.promptEn.trim(), `${at} promptEn`).not.toBe("");
      expect(q.promptFr.trim(), `${at} promptFr`).not.toBe("");
      expect(q.promptFr, `${at} promptFr untranslated`).not.toBe(q.promptEn);

      // A mismatch here mis-labels answers in one language only — the learner
      // sees a plausible quiz and is graded against the wrong choice.
      expect(q.choicesFr.length, `${at} FR choice count`).toBe(q.choicesEn.length);
      expect(q.choicesEn.length, `${at} choices`).toBeGreaterThanOrEqual(2);
      expect(new Set(q.choicesEn).size, `${at} duplicate EN choices`).toBe(
        q.choicesEn.length,
      );
      expect(new Set(q.choicesFr).size, `${at} duplicate FR choices`).toBe(
        q.choicesFr.length,
      );

      expect(q.correctIdx.length, `${at} has no correct answer`).toBeGreaterThan(0);
      for (const ix of q.correctIdx) {
        expect(ix, `${at} correctIdx out of range`).toBeGreaterThanOrEqual(0);
        expect(ix, `${at} correctIdx out of range`).toBeLessThan(q.choicesEn.length);
      }
      expect(new Set(q.correctIdx).size, `${at} repeated correctIdx`).toBe(
        q.correctIdx.length,
      );

      const type = q.type ?? "SINGLE";
      if (type === "SINGLE")
        expect(q.correctIdx.length, `${at} SINGLE needs one answer`).toBe(1);
      if (type === "MULTIPLE")
        expect(
          q.correctIdx.length,
          `${at} MULTIPLE needs more than one answer`,
        ).toBeGreaterThan(1);
      if (type === "TRUE_FALSE") {
        expect(q.choicesEn.length, `${at} TRUE_FALSE needs two choices`).toBe(2);
        expect(q.correctIdx.length, `${at} TRUE_FALSE needs one answer`).toBe(1);
      }

      // Explanations are shown in the learner's locale, so one-sided ones
      // render blank for half the audience.
      expect(
        Boolean(q.explainEn),
        `${at} explanation present in only one language`,
      ).toBe(Boolean(q.explainFr));
    });
  });
});

describe("starter library — review state travels with the content", () => {
  forEachModule((m) => {
    expect(m.review, "missing review status").toBeDefined();
    // Seeded into Module.regulatoryCitations, so the disclaimer reaches the row
    // rather than living only in the content file's header comment.
    expect(m.review!.notice).toBe(STARTER_NOTICE);
    expect(m.review!.frStatus).toBe(FR_MACHINE_DRAFT);

    // ORIGINAL = no adequate free Canadian source was found, so the reviewer is
    // checking authored claims rather than fact-checking against a citation.
    // Those modules must say what expertise they still need.
    if (m.review!.enProvenance === "ORIGINAL") {
      expect(m.review!.smeNeeds?.trim(), "ORIGINAL module without smeNeeds")
        .toBeTruthy();
    }

    // SOURCED means there is something to trace back to.
    if (m.review!.enProvenance === "SOURCED") {
      expect(m.citations?.length ?? 0, "SOURCED module with no citations")
        .toBeGreaterThan(0);
    }

    for (const c of m.citations ?? []) {
      expect(c.organization.trim(), "citation organization").not.toBe("");
      expect(c.title.trim(), "citation title").not.toBe("");
      expect(c.url, "citation url").toMatch(/^https?:\/\//);
      // URLs age. An access date is what tells the next reviewer how much to
      // trust this row — several sources in this library were already stale or
      // moved when it was written.
      expect(c.accessed, "citation accessed date").toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("starter library — §B0 positioning guardrails", () => {
  // Finding 1: NB/PE/NL have no province-wide mandated home-support training
  // list. Claiming otherwise is the single most damaging thing this content
  // could say, and it is the kind of phrase that gets added by someone
  // "tightening up" the copy.
  const MANDATE_CLAIMS =
    /provincially mandated|mandated by the province|required by provincial law|government-mandated|province requires/i;

  forEachModule((m) => {
    for (const text of allText(m)) {
      expect(
        MANDATE_CLAIMS.test(text),
        `claims a provincial mandate: ${text.slice(0, 120)}`,
      ).toBe(false);
    }
  });

  it("scopes only the NS CCA track to a province", () => {
    for (const m of ALL) {
      if (m.slug === NS_CCA_SLUG) expect(m.jurisdiction).toBe("NS");
      else
        expect(m.jurisdiction, `${m.slug} is province-scoped`).toBeUndefined();
    }
  });

  // Finding 2: Maple Care is not a licensed CCA education provider, and an
  // Academy completion record is never CCA certification. This disclaimer is
  // load-bearing — the module is otherwise indistinguishable from a course
  // that leads to the credential.
  it("keeps the NS CCA track's 'this is not the credential' disclaimer", () => {
    const ns = ALL.find((m) => m.slug === NS_CCA_SLUG);
    expect(ns, "NS CCA prep track is missing").toBeDefined();

    expect(ns!.descriptionEn).toMatch(/not the CCA credential|prep|preparation/i);
    const first = ns!.lessons[0];
    expect(first.bodyEn).toMatch(/licensed education provider/i);
    expect(first.bodyEn).toMatch(/CCA Certification Exam/i);
    // Each clause is asserted separately so a failure names the one that was
    // edited away, rather than passing because a sibling phrase survived.
    expect(first.bodyEn).toMatch(/This track is not that/i);
    expect(first.bodyEn).toMatch(/never a CCA certificate/i);
    expect(first.bodyEn).toMatch(/shortens or substitutes/i);
    expect(ns!.review?.blocker, "NS CCA positioning blocker").toBeTruthy();
  });

  // Finding 3 + the WHMIS decision: WHMIS is the one genuine legal duty in this
  // library, and it has two halves. Our module covers the transferable
  // education half only — it cannot satisfy the employer's product-specific
  // training duty. Deleting that lesson would turn a careful module into a
  // compliance trap.
  it("keeps the WHMIS module's 'this is only half the requirement' lesson", () => {
    const whmis = ALL.find((m) => m.slug === "whmis-2015-home-care");
    expect(whmis, "WHMIS module is missing").toBeDefined();

    const limits = whmis!.lessons.find((l) =>
      /does not cover/i.test(l.titleEn),
    );
    expect(limits, "WHMIS scope-limit lesson was removed").toBeDefined();
    expect(limits!.bodyEn).toMatch(/site- and job-specific|product-specific/i);
    expect(limits!.bodyEn).toMatch(/does not make anyone WHMIS-trained/i);
    expect(whmis!.review?.blocker, "WHMIS positioning blocker").toBeTruthy();
  });

  // Solo Emergency Response teaches decisions and escalation only. If someone
  // later adds hands-on technique, the module stops being safe to ship without
  // a clinician, and First Aid/CPR remains an externally issued credential.
  it("keeps Solo Emergency Response free of first-aid technique", () => {
    const solo = ALL.find((m) => m.slug === "solo-emergency-response");
    expect(solo, "Solo Emergency Response is missing").toBeDefined();
    expect(solo!.review?.enProvenance).toBe("ORIGINAL");
    expect(solo!.lessons[0].bodyEn).toMatch(/not a first-aid course/i);
    expect(solo!.lessons[0].bodyEn).toMatch(
      /Canadian Red Cross|St John Ambulance/i,
    );
  });

  // Three sources were assessed and DROPPED by owner decision on 2026-09-09.
  // Re-adding any of them is a licence or provenance regression, and each is
  // exactly the kind of "strongest free source for this topic" that a future
  // editor would rediscover and reach for. This guard is the memory.
  it.each([
    [
      "WHO iSupport",
      /isupport|whodementia|who\.int/i,
      "CC BY-NC-SA 3.0 IGO — non-commercial, unusable in a paid product. No permission was sought and none will be.",
    ],
    [
      "both BC HCA OERs",
      /hcalabtheoryandpractice|hcasupplement|BCcampus/i,
      "Personal Care Skills is CC BY-NC-SA (non-commercial); the HCA Program Supplement is CC BY-SA (viral ShareAlike). Both dropped by owner decision.",
    ],
    [
      "the NICE PSW factsheet",
      /nicenet/i,
      "Could not be fetched, and the toolset dates to 2010. The PHAC elder-abuse pages carry this content instead.",
    ],
  ])("keeps %s dropped", (_name, pattern, why) => {
    for (const m of ALL) {
      for (const cite of m.citations ?? []) {
        const hit =
          pattern.test(cite.url) ||
          pattern.test(cite.title) ||
          pattern.test(cite.organization);
        expect(hit, `${m.slug} re-cites a dropped source. ${why}`).toBe(false);
      }
      // A blocker naming a dropped source means the decision was reopened.
      expect(
        pattern.test(m.review?.blocker ?? ""),
        `${m.slug} blocks on a dropped source. ${why}`,
      ).toBe(false);
    }
  });
});
