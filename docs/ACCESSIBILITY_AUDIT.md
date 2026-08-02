# Accessibility Audit — ElderCare Academy (LMS web)

**Target:** WCAG 2.2 Level AA. **Date:** 2026-08-02.
**Method:** manual code review of the shell + full learner flow (landing,
dashboard, module, lesson, quiz, certificate) plus a sampled admin form.

**Still needed to fully close** (tooling/AT not available in the review env):
1. Automated scan (axe-core / Lighthouse) for exact contrast ratios + DOM issues — ideally wired into CI so it can't regress.
2. Screen-reader pass (NVDA / VoiceOver) through the learner flow in EN **and** FR.
3. Full sweep of the remaining admin/authoring forms (one was sampled; findings likely repeat).

Status legend: `[x]` fixed · `[ ]` open · `[~]` needs tooling to confirm/close.

---

## High

- [x] **1. Page `lang` hard-coded to English.** `<html lang="en">` but FR users get French content → screen reader uses the wrong voice. **WCAG 3.1.1 (A).** Fix: derive `lang` from `me.user.preferredLocale`. — `apps/web/src/app/layout.tsx`
- [x] **2. No "skip to content" link.** Keyboard/SR users tab through the sticky header on every page. **WCAG 2.4.1 (A).** Fix: visually-hidden skip link → page main. — `apps/web/src/app/layout.tsx`
- [x] **3. Admin/authoring forms lack labels.** Selects/inputs had `name` but no `<label>`; the number field used a `placeholder` as a pseudo-label. **WCAG 1.3.1 / 3.3.2 / 4.1.2 (A).** Fixed: accessible names (`aria-label` / linked `<label>`) on every control across create-required-training, invite-staff, report-filters, roster-uploader, onboarding (jurisdiction select), quiz-builder (type / correct / choice inputs), and lesson-manager (video input).
- [x] **4. Form errors not announced.** Errors rendered as plain `<p>` with no live region. **WCAG 3.3.1 / 4.1.3 (AA).** Fixed: `role="alert"` on error messages and `role="status"` on success/progress messages across the above forms + the quiz runner. — form components + `quiz-runner.tsx`

## Medium

- [x] **5. Completion status conveyed by icon/colour only.** Done lessons show a green ✓ with no text. **WCAG 1.1.1 / 1.4.1 (A).** Fix: `sr-only` "Completed / Not started". — `training/[slug]/page.tsx`, `components/lesson-nav.tsx`
- [x] **6. Quiz answer groups not programmatically grouped.** Radios/checkboxes worked by keyboard but weren't tied to the question prompt. **WCAG 1.3.1 (A).** Fixed: each question's options are wrapped in `<fieldset>` with the prompt as `<legend>`. — `components/quiz-runner.tsx`
- [x] **7. Low-contrast text (identified items).** Fixed the flagged fails: the cyan `text-secondary` preview / in-progress badges now use `text-cyan-700 dark:text-cyan-300`; the certificate attestation hash dropped the size/opacity reduction (`text-[11px] text-muted-foreground`). **WCAG 1.4.3 (AA).** _Residual:_ a full axe/Lighthouse scan should still run to confirm exact ratios app-wide (see below).
- [x] **8. Missing landmark/widget ARIA.** Header `<nav>` had no `aria-label`; progress bars were plain `<div>`s. **WCAG 1.3.1 (A).** Fix: label the nav; `role="progressbar"` + `aria-valuenow/min/max` on progress bars. — `layout.tsx`, `dashboard/page.tsx`, `training/[slug]/page.tsx`, `components/quiz-runner.tsx`

## Low / future

- [ ] **Language of parts:** admin option text is English-only in the FR UI (no `lang` on the span). **WCAG 3.1.2 (AA)** — really an i18n gap.
- [ ] **Video captions/transcripts:** when real lesson video lands it needs captions + transcript. **WCAG 1.2.2 / 1.2.1.**
- [~] **Target size (2.5.8, new in 2.2 AA):** re-check smallest icon/text controls after the contrast fix.

---

## Remediation order

1. **Quick wins (this PR):** #1, #2, #5, #8 — shell + status text + ARIA.
2. **Forms pass:** #3, #4 — labels + live error regions across admin/authoring forms.
3. **Contrast:** #7 — after an axe/Lighthouse run gives exact ratios.
4. **Wire axe/Lighthouse into CI** so conformance is measured and non-regressing.
5. **Screen-reader QA** in EN + FR, then a **third-party a11y audit** for the sign-off buyers/procurement expect.
