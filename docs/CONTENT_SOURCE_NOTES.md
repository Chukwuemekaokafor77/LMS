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
| BC *HCA Program Supplement 2023* | CC BY-SA 4.0 | Commercial OK but ShareAlike is viral → adapting would force us to relicense our lessons. |
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

### 2.2 WHMIS 2015 — build vs. direct to CCOHS

The brief asked which is lower-risk. Having read CCOHS's terms, **copyright is
not the deciding factor** — CCOHS's terms restrict *reproducing* their text,
which we do not do. The deciding factor is regulatory.

What was confirmed:

- WHMIS worker education/training is a **genuine legal duty in every Canadian
  jurisdiction** — unlike everything else in this library, which is
  employer-defined best practice (§B0 Finding 1).
- The duty has **two halves**: *education* (general, transferable — pictograms,
  labels, SDSs; can be delivered online) and *training* (**site- and
  product-specific**, delivered by the employer for the actual products in use).
- A generic online course satisfies the first half only. Employers must also
  review the programme at least annually or when products/processes/hazard
  information change.
- CCOHS sells its own **WHMIS for Workers** e-course: **CAD $19.95/seat, 90
  days' access, printable certificate of completion**
  (<https://www.ccohs.ca/products/courses/whmis_workers>).

**Recommendation (split, not either/or):**

1. **Credential of record → CCOHS's course, tracked externally.** For agencies
   that want a defensible, independently certificated WHMIS record, direct them
   to the CCOHS course and track that certificate with its expiry in
   ElderCare's `StaffCertification` (Seam 3) — exactly like First Aid/CPR under
   §B0 Finding 3. We are not better placed than CCOHS to issue this, and the
   $19.95 price makes rebuilding it poor value.
2. **Keep `whmis-2015-home-care` as awareness + refresher only.** It ships as
   the general-education half, framed for the home-care setting (client-owned
   consumer products, unlabelled bottles under the sink, bleach + ammonia), with
   a whole lesson — *"What this module does not cover"* — stating that it is
   half the legal requirement and that the agency still owes product-specific
   training. That lesson is load-bearing and must not be trimmed.
3. **Neither replaces the agency's own site-specific training.** Nothing we ship
   can, because we cannot know what is under a given client's sink.

**The real risk to manage is mis-ticking**, not copyright: an agency marking
WHMIS "done" off a starter module. That is why this module carries a
`review.blocker` requiring a positioning decision before it is promoted.

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
| **NICE, *Responding to Elder Abuse and Neglect: Factsheet for PSWs*** | `nicenet.ca` 403s so the text could never be read, and the CNPEA hub dates the toolset to **2010-08-31**. Its claimed French edition was never confirmed. | None. `recognizing-reporting-abuse` was drafted from the PHAC elder-abuse pages, which are live, Crown/OGL and published in French. |

> The **BCcampus *HCA Program Supplement to the Provincial Curriculum 2023*** is
> a different resource and is **still cited**. It is **CC BY-SA 4.0** — commercial
> use is permitted. ShareAlike never triggers here because nothing was adapted
> from it; it informed original prose. Drop it too if that margin is unwanted.

### 3.2 Still cited, but not fully verified

| Source | What is unverified |
| --- | --- |
| **BCcampus *HCA Program Supplement 2023*** | `opentextbc.ca` returned **HTTP 403** to automated fetch on 2026-09-09. The CC BY-SA 4.0 licence was read from search metadata, not from the licence page. Confirm before adapting anything from it. |
| **NS CCA framework in French** | Only the **English** PDF was retrieved and read. A French edition of the *Scope of Practice & Competency Framework* was **not** confirmed. |
| **eCampusOntario "communication in healthcare" OER** | No specific matching title was found in the Open Library. `client-communication` cites the NS framework and the HCA Supplement instead. |
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

## 5. Review pipeline — what has to happen next

1. **SME review, every module.** Priority order: `solo-emergency-response`
   (highest risk, original), `medication-support-home` (original, scope-
   sensitive), `whmis-2015-home-care` (legal duty + positioning), then the rest.
2. **fr-CA bilingual QA, every module.** All French in this library is a machine
   draft. This is Phase E's open "bilingual fr-CA QA" item.
3. ~~WHO decision~~ — **closed 2026-09-09: iSupport dropped** (§2.1). The
   dementia module now needs SME-authored depth rather than a source.
4. **WHMIS positioning decision** — confirm the split in §2.2 before promoting
   that module.
5. **NS CCA track review** by someone who knows the certification process, and
   a check that the May 2019 framework has not been superseded.
6. Only then clear the `STARTER CONTENT` tag, module by module. **Nothing here
   is launch-ready today.**
