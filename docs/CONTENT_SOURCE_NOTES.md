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
| BC OER *Personal Care Skills for HCAs* | CC BY-**NC**-SA (non-commercial) | **Not** CC BY 4.0 as the brief assumed → cannot adapt into a paid product. |
| BC *HCA Program Supplement 2023* | CC BY-SA 4.0 | Commercial OK but ShareAlike is viral → adapting would force us to relicense our lessons. |
| PHAC / Health Canada pages | Crown copyright, Government of Canada terms | The most permissive sources we have; still paraphrased with attribution. |

Citations live in `Module.regulatoryCitations.sources` as
`{ organization, title, url, accessed, licence?, unverified? }`. **The citation
is for traceability, not permission to quote.**

---

## 2. Open approvals — human decisions, not things to route around

### 2.1 WHO iSupport for Dementia — permission needed before ANY use

- **Document:** *iSupport for Dementia: Training and support manual for carers
  of people with dementia*, WHO, 2019.
  <https://www.who.int/publications/i/item/9789241515863>
- **Licence (confirmed 2026-09-09):** **CC BY-NC-SA 3.0 IGO** — non-commercial.
- **Why this blocks us:** Maple Care is a paid product delivered to agencies on
  an ElderCare entitlement. A non-commercial licence does not cover that, so
  iSupport cannot be adapted, excerpted, or closely paraphrased without
  permission — regardless of how well it fits the audience.
- **What is needed:** written adaptation/implementation permission from WHO.
  WHO explicitly invites this: the publication page says iSupport "can be
  adapted to national or local contexts and needs" and directs adaptation
  requests to **whodementia@who.int**.
- **The ask should state:** who we are; that Maple Care Academy is a commercial
  multi-tenant LMS for home-care agencies in Atlantic Canada; which of the five
  iSupport modules we would draw on; that delivery is bilingual EN/fr-CA; the
  expected audience size; and that we will attribute per WHO's requirements.
- **Status: NOT SENT.** No content has been drafted from iSupport.
- **Current state of the module:** `dementia-responsive-behaviours` was
  authored earlier (`feat/academy-lesson-content`) from other material and is
  **not** iSupport-derived. It was left in place rather than gutted — deleting
  shipped, non-infringing lesson bodies would have been a destructive change
  outside a content-expansion task. Its `review.blocker` records that iSupport
  is off-limits until this email is answered, so nobody later assumes the
  module was sourced from it.

**Decision needed from a human:** send the email, or drop iSupport permanently
and commission the dementia depth from an SME instead.

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

## 3. Sources that could NOT be verified

State these as unverified in any review; do not treat them as backing.

| Source | Problem |
| --- | --- |
| **NICE, "Responding to Elder Abuse and Neglect: Factsheet for Personal Support Workers"** (`nicenet.ca`) | `nicenet.ca` returned **HTTP 403** to automated fetch, so the current text could not be read. The CNPEA hub page describing the toolset says the materials were **current as of 2010-08-31** — 16 years old. The brief's claim that it is published in French was **not confirmed**. **No content was drafted from it**; the PHAC elder-abuse pages (live, French version published, Crown/OGL) were used instead. |
| **BCcampus OER licences** (`opentextbc.ca`) | Site returned **HTTP 403** to automated fetch. Licences were read from the BCcampus catalogue listing and search metadata, not from the books' own licence pages. Notably the brief's "CC BY 4.0" was **wrong** — the HCA textbook is a **non-commercial** CC variant. Confirm before adapting anything. |
| **NS CCA framework in French** | The brief marked the NS "Becoming a CCA" material as bilingual. Only the **English** PDF was retrieved and read. A French edition of the *Scope of Practice & Competency Framework* itself was **not** confirmed. |
| **eCampusOntario "communication in healthcare" OER** | No specific matching title was found in the Open Library. `client-communication` cites the BC OER and the NS framework instead. |
| **`cnacanada.ca` (bare domain)** | Does **not resolve** (DNS failure). The working host is **`www.cnacanada.ca`** — the citation records this. |

Sources that *were* confirmed live on 2026-09-09: NS CCA framework (May 2019);
PHO IPAC for Home & Community Care (1st revision, Nov 2025); PHAC Routine
Practices (2017); CNA Canada fall-prevention bulletin (2019, PSW-focused);
PHAC *You CAN Prevent Falls!* (mod. 2016-04-28); PHAC *How you can identify
abuse…* (mod. 2017-05-19, FR published); CCOHS Working Alone – With Patients
(upd. 2026-07-07); CCOHS Working Alone – General; CCOHS Driving – Winter;
CCOHS Safe Patient Handling; CCOHS Back Injury Prevention; CCOHS WHMIS
Education & Training; CCOHS WHMIS for Workers course; WHO iSupport; OPC.

> ⚠️ The CCOHS **winter-driving** URL in the original brief was wrong.
> The working page is `/oshanswers/safety_haz/drive/icesnow.html`.

---

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
3. **WHO decision** — send the email or drop iSupport (§2.1).
4. **WHMIS positioning decision** — confirm the split in §2.2 before promoting
   that module.
5. **NS CCA track review** by someone who knows the certification process, and
   a check that the May 2019 framework has not been superseded.
6. Only then clear the `STARTER CONTENT` tag, module by module. **Nothing here
   is launch-ready today.**
