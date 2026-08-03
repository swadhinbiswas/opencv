# OpenCV — Database Schema (Drizzle / libSQL)

Migrations live in `src/lib/db/migrations/`, generated with `drizzle-kit`. Every
schema change ships a migration — never edited by hand.

## Core / auth

| table | columns |
|---|---|
| `users` | id (text pk), firebaseUid (text unique, nullable), email (text), name (text), avatarUrl (text), plan (text 'free'), createdAt, updatedAt |
| `master_profiles` | id, userId (fk), headline (text), personalInfo (json), createdAt, updatedAt |

## Master profile blocks

| table | columns |
|---|---|
| `experience_blocks` | id, masterProfileId, company, role, location, startDate, endDate, isCurrent, employmentType, orderIndex, tags(json) |
| `experience_bullets` | id, experienceBlockId, text, tags(json), orderIndex |
| `education_blocks` | id, masterProfileId, institution, degree, field, startDate, endDate, gpa, details (text), orderIndex |
| `skills` | id, masterProfileId, name, category, level (int), years (int), tags(json), orderIndex |
| `languages` | id, masterProfileId, name, cefrLevel, orderIndex |
| `certifications` | id, masterProfileId, name, issuer, date, credentialUrl, orderIndex |
| `projects` | id, masterProfileId, name, description, tech(json), link, startDate, endDate, orderIndex |
| `publications` | id, masterProfileId, citation, date, link, orderIndex |
| `awards` | id, masterProfileId, title, issuer, date, orderIndex |
| `volunteer_blocks` | id, masterProfileId, organization, role, startDate, endDate, details, orderIndex |
| `references` | id, masterProfileId, name, relation, contact, visible (bool), orderIndex |
| `custom_sections` | id, masterProfileId, title, content(json), orderIndex |
| `summaries` | id, masterProfileId, label, text, orderIndex |

## CV / templates / cover letters / jobs

```text
templates (id, name, formatType, layoutSchema json, themeTokens json, isPremium)
cvs (id, userId, masterProfileId, templateId, name, settings json, status, createdAt, updatedAt)
cv_sections (id, cvId, sectionType, sourceBlockId, overrideContent json, isVisible, orderIndex)
cover_letters (id, userId, cvId, templateId, jobId, name, content json, createdAt, updatedAt)
jobs (id, userId, company, role, jobUrl, status, salaryRange, contactName, notes, followUpDate, cvId, coverLetterId, createdAt, updatedAt)
job_events (id, jobId, type, note, createdAt)
```

Phase 0–2 implements the **core + master profile** tables. The tail tables are
included in the same migration so no data-model churn later.