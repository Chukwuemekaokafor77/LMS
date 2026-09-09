# Starter-library content sources, licences and open approvals

Internal working notes for the home-care starter library
(`apps/api/prisma/home-care-content.ts` + `home-care-content-phase-b.ts`,
seeded by `pnpm --filter @maple-care/api run seed:homecare`).

**Every URL below was checked on 2026-09-09.** Where a source could not be
confirmed, that is stated rather than assumed. Re-verify before relying on any
of it — this is exactly the kind of list that rots.

Nothing in this library is launch-ready. Every module is tagged
`STARTER CONTENT — SME REVIEW REQUIRED BEFORE COMPLIANCE USE`, and every
French body is tagged `MACHINE-DRAFTED — PENDING HUMAN BILINGUAL QA`. Both tags
are written into `Module.regulatoryCitations.review` at seed time.

---

## 1. The sourcing rule we actually followed

**Every EN body is written from scratch. Nothing is reproduced or adapted from
any source.** That was not a stylistic choice — it is what the licences force:

| Source | Reuse terms as read on 2026-09-09 | Consequence |
| --- | --- | --- |
| CCOHS (all OSH Answers) | Prior permission required to reproduce; **"no editorial changes … (deletions, additions, changes in wording)"** | Cannot copy, cannot adapt. Cite only. |
| Public Health Ontario IPAC manual | Reproducible **non-commercially only**, no modifications | Maple Care is a paid product → cite only. |
| NS CCA Scope of Practice | "Copyright © All Rights Reserved", NS DHW 2019 | Cite competency names; paraphrase everything else. |
| CNA Canada fall-prevention bulletin | "© 2019 CNA. All rights reserved." | Cite only. |
| Health Canada / ESDC / PHAC (canada.ca) | **Non-commercial** reproduction free with attribution; **commercial** reproduction needs prior written permission | Not blanket Open Government Licence, as previously stated here in error. Cite only. |
| WCB PEI WHMIS guide | Free provincial guidance, itself adapted from CCOHS + Health Canada fact sheets | Cite only; citing it does not escape CCOHS provenance. |
| PHAC / Health Canada pages | Crown copyright, Government of Canada terms | The most permissive sources we have; still paraphrased with attribution. |

Citations live in `Module.regulatoryCitations.sources` as
`{ organization, title, url, accessed, licence?, unverified? }`. **The citation
is for traceability, not permission to quote.**

---

## 2. Open approvals — human decisions, not things to route around

### 2.1 WHO iSupport for Dementia — DROPPED 2026-09-09

**Owner decision: dropped. No permission will be sought. Do not revisit.**

- *iSupport for Dementia*, WHO, 2019, is **CC BY-NC-SA 3.0 IGO** — non-commercial,
  so it cannot be adapted into a paid product without written permission.
- WHO does invite adaptation requests at `whodementia@who.int`. **That email was
  never sent and will not be.** The owner chose to drop the source rather than
  take on the permission dependency.
- **Nothing was ever drafted from iSupport**, so no content had to be removed.
  `dementia-responsive-behaviours` was authored earlier from other material and
  is not iSupport-derived; its blocker has been cleared.
- The consequence is real and should not be papered over: iSupport was the
  strongest free source for this topic, so the depth this module still needs
  now has to come from an **SME**, not from a document. That is recorded in the
  module's `review.smeNeeds`.
- A guard in `prisma/starter-library.spec.ts` fails if any module re-cites WHO
  or reopens a blocker on it, because this is exactly the source a future
  editor would rediscover and reach for.

### 2.2 WHMIS 2015 — sourcing settled, positioning still open

**Sourcing: settled 2026-09-09. Free, authoritative sources exist, so the
module stays and no paid course is needed to source it.** Verified live:

| Source | Notes |
| --- | --- |
| Health Canada, *Workplace Hazardous Materials Information System (WHMIS)* | mod. 2025-12-15, French version published |
| ESDC, *WHMIS 2015 — Applies to workplaces under federal and provincial or territorial regulation* | mod. 2022-09-09, French published. States the two-part duty plainly. |
| WCB PEI, *WHMIS 2015: Guide for Employers and Workers* | Free guidance from a **launch province**; names worksite-specific training as a distinct employer duty. Self-declares as adapted from CCOHS + Health Canada fact sheets, with WorkSafeNB permission — so citing it does not escape CCOHS provenance. |

The module was re-sourced onto these and the CCOHS citations were removed. The
lesson text no longer routes agencies to a paid vendor course; it points at the
free federal and provincial guidance and at the agency's own duty.

**Positioning: still open, but no longer urgent.** WHMIS education/training is
the one **genuine legal duty** in this library — everything else is
employer-defined best practice (§B0 Finding 1). The duty has two halves:

- **Education** — general and transferable (pictograms, labels, SDSs). This is
  what the module delivers, and it can be delivered online.
- **Training** — **workplace- and product-specific**, delivered by the employer
  for the products actually in use, reviewed at least annually or whenever
  products, processes or hazard information change. Nothing we ship can satisfy
  this, because we cannot know what is under a given client's sink.

The risk to manage is **mis-ticking**: an agency marking WHMIS "done" off a
starter module. The mitigation is the lesson *"What this module does not
cover"*, which is load-bearing and guarded by a test. If an agency wants an
independently certificated record, that certificate is tracked externally via
`StaffCertification` (Seam 3) like First Aid/CPR — not replaced by this module.

Since **nothing in this library is ready to promote**, this decision can wait —
but it must be settled before this module ever is.

### 2.3 Solo Emergency Response — possible partnership ask

No Canadian home-care-specific open source was found. The module is original
and deliberately teaches **no clinical or first-aid technique** — only scene
safety, when to call 911, staying in scope while waiting, and reporting
afterwards. First Aid/CPR remains an external credential (§B0 Finding 3).

Worth exploring: a short ask to the **Canadian Red Cross** or **St John
Ambulance** for a citable, permitted emergency-response checklist for
home-support workers. Not started.

---

## 3. Dropped sources, and what remains unverified

### 3.1 Dropped by owner decision, 2026-09-09

Removed from the citation lists entirely. The guard in
`prisma/starter-library.spec.ts` keeps them out.

| Source | Why it was dropped | Content impact |
| --- | --- | --- |
| **WHO iSupport for Dementia** | CC BY-NC-SA 3.0 IGO (non-commercial); permission dependency declined — see §2.1 | None. Nothing was drafted from it. The dementia module needs SME depth instead. |
| **BC OER, *Personal Care Skills for Health Care Assistants* (`opentextbc.ca/hcalabtheoryandpractice`)** | CC BY-**NC**-SA — non-commercial, so unusable in a paid product. (The brief's "CC BY 4.0" was wrong.) Licence could only be read from catalogue metadata; the site 403s. | Was background reading only, never adapted. Affected modules keep the NS CCA framework, the CC BY-SA HCA Supplement and PHO as their citations. |
| **BCcampus, *HCA Program Supplement to the Provincial Curriculum 2023*** | CC BY-SA 4.0 — commercial use permitted, but ShareAlike is viral. Dropped by owner decision to keep the library free of copyleft exposure. | Was background reading only, never adapted. **`convalescent-care-basics` lost its last substantive source and was reclassified SOURCED → ORIGINAL** rather than left with a citation that does not carry the body. |
| **NICE, *Responding to Elder Abuse and Neglect: Factsheet for PSWs*** | `nicenet.ca` 403s so the text could never be read, and the CNPEA hub dates the toolset to **2010-08-31**. Its claimed French edition was never confirmed. | None. `recognizing-reporting-abuse` was drafted from the PHAC elder-abuse pages, which are live, Crown/OGL and published in French. |


### 3.2 Still cited, but not fully verified

| Source | What is unverified |
| --- | --- |
| **NS CCA framework in French** | Only the **English** PDF was retrieved and read. A French edition of the *Scope of Practice & Competency Framework* was **not** confirmed. |
| **eCampusOntario "communication in healthcare" OER** | No specific matching title was found in the Open Library. `client-communication` now cites the NS CCA framework alone. |
| **`cnacanada.ca` (bare domain)** | Does **not resolve** (DNS failure). The working host is **`www.cnacanada.ca`** — the citation records this. |

Sources confirmed live on 2026-09-09: NS CCA framework (May 2019); PHO IPAC for
Home & Community Care (1st revision, Nov 2025); PHAC Routine Practices (2017);
CNA Canada fall-prevention bulletin (2019, PSW-focused); PHAC *You CAN Prevent
Falls!* (mod. 2016-04-28); PHAC *How you can identify abuse…* (mod. 2017-05-19,
FR published); CCOHS Working Alone – With Patients (upd. 2026-07-07); CCOHS
Working Alone – General; CCOHS Driving – Winter; CCOHS Safe Patient Handling;
CCOHS Back Injury Prevention; CCOHS WHMIS Education & Training; CCOHS WHMIS for
Workers course; OPC.

> ⚠️ The CCOHS **winter-driving** URL in the original brief was wrong.
> The working page is `/oshanswers/safety_haz/drive/icesnow.html`.

## 4. Provincial privacy statutes — correction

The brief flagged this and it is confirmed. **Ontario's PHIPA does not apply in
any launch province.** The applicable statutes are:

| Province | Statute |
| --- | --- |
| NB | Personal Health Information Privacy and Access Act (**PHIPAA**) |
| NS | Personal Health Information Act (**PHIA**) |
| PE | **Health Information Act** |
| NL | Personal Health Information Act (**PHIA**), SNL 2008, c P-7.01 |

`privacy-confidentiality-home` is written **statute-neutral** so it is not wrong
in any of the four. Whether to add per-province specifics is a reviewer call,
recorded in that module's `review.smeNeeds`.

---

## 4b. ⚠️ Seeded modules are PUBLISHED, which means visible to learners

Worth knowing before anyone treats "not ready to promote" as already handled.

`seed-home-care.ts` creates every module with `status: ModuleStatus.PUBLISHED`
and `orgId: null`. In `ModulesService`, `PUBLISHED` is exactly what gates
learner visibility — `listForOrg` filters on it, and `getBySlug` 404s without
it. So running `seed:homecare` puts all 19 unreviewed starter modules into
every agency's visible library, assignable through `RequiredTraining`.

This predates the Phase B expansion — the original 11 shipped the same way —
but the expansion multiplies it. **Owner decision needed:** seed as `DRAFT` so
nothing is learner-visible until reviewed, or keep `PUBLISHED` because the
starter library is part of the demo and the disclaimer covers it. It was left
as `PUBLISHED` pending that call, because flipping it silently would empty the
library in the demo and prospect environments.

---

## 5. Review pipeline — what has to happen next

1. **SME review, every module.** Priority order: `solo-emergency-response`
   (highest risk, original), `medication-support-home` (original, scope-
   sensitive), `whmis-2015-home-care` (legal duty + positioning), then the rest.
2. **fr-CA bilingual QA, every module.** All French in this library is a machine
   draft. This is Phase E's open "bilingual fr-CA QA" item.
3. ~~WHO decision~~ — **closed 2026-09-09: iSupport dropped** (§2.1). The
   dementia module now needs SME-authored depth rather than a source.
4. **WHMIS positioning decision** — sourcing is closed (free government
   sources, §2.2); the education-vs-training positioning must be settled before
   that module is ever promoted.
4b. **Seeding status** — decide `DRAFT` vs `PUBLISHED` (§4b).
5. **NS CCA track review** by someone who knows the certification process, and
   a check that the May 2019 framework has not been superseded.
6. Only then clear the `STARTER CONTENT` tag, module by module. **Nothing here
   is launch-ready today.**
