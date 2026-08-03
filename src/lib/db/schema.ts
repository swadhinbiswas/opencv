import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
};

// ---------------------------------------------------------------------------
// Users & Master Profile
// ---------------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  firebaseUid: text("firebase_uid").unique(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  avatarUrl: text("avatar_url"),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  ...timestamps,
});

export const masterProfiles = sqliteTable("master_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: text("headline").notNull().default(""),
  personalInfo: text("personal_info", { mode: "json" })
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'`),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Master Profile blocks (each is discrete and taggable)
// ---------------------------------------------------------------------------
export const summaries = sqliteTable("summaries", {
  id: text("id").primaryKey(),
  masterProfileId: text("master_profile_id")
    .notNull()
    .references(() => masterProfiles.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  text: text("text").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  ...timestamps,
});

export const experienceBlocks = sqliteTable(
  "experience_blocks",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    role: text("role").notNull().default(""),
    location: text("location").default(""),
    startDate: text("start_date").default(""),
    endDate: text("end_date").default(""),
    isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
    employmentType: text("employment_type").notNull().default("Full-time"),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_exp_master").on(t.masterProfileId)],
);

export const experienceBullets = sqliteTable(
  "experience_bullets",
  {
    id: text("id").primaryKey(),
    experienceBlockId: text("experience_block_id")
      .notNull()
      .references(() => experienceBlocks.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    tags: text("tags", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (t) => [index("idx_bullet_exp").on(t.experienceBlockId)],
);

export const educationBlocks = sqliteTable(
  "education_blocks",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    degree: text("degree").default(""),
    field: text("field").default(""),
    startDate: text("start_date").default(""),
    endDate: text("end_date").default(""),
    gpa: text("gpa").default(""),
    details: text("details").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_edu_master").on(t.masterProfileId)],
);

export const skills = sqliteTable(
  "skills",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull().default("Tools"),
    level: integer("level").notNull().default(3),
    years: integer("years"),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_skill_master").on(t.masterProfileId)],
);

export const languages = sqliteTable(
  "languages",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cefrLevel: text("cefr_level", {
      enum: ["A1", "A2", "B1", "B2", "C1", "C2", "Native"],
    })
      .notNull()
      .default("B1"),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_lang_master").on(t.masterProfileId)],
);

export const certifications = sqliteTable(
  "certifications",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    issuer: text("issuer").default(""),
    date: text("date").default(""),
    credentialUrl: text("credential_url").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_cert_master").on(t.masterProfileId)],
);

export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default(""),
    tech: text("tech", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
    link: text("link").default(""),
    startDate: text("start_date").default(""),
    endDate: text("end_date").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_proj_master").on(t.masterProfileId)],
);

export const publications = sqliteTable(
  "publications",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    citation: text("citation").notNull(),
    date: text("date").default(""),
    link: text("link").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_pub_master").on(t.masterProfileId)],
);

export const awards = sqliteTable(
  "awards",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    issuer: text("issuer").default(""),
    date: text("date").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_award_master").on(t.masterProfileId)],
);

export const volunteerBlocks = sqliteTable(
  "volunteer_blocks",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    organization: text("organization").notNull(),
    role: text("role").default(""),
    startDate: text("start_date").default(""),
    endDate: text("end_date").default(""),
    details: text("details").default(""),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_vol_master").on(t.masterProfileId)],
);

export const references = sqliteTable(
  "references",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    relation: text("relation").default(""),
    contact: text("contact").default(""),
    visible: integer("visible", { mode: "boolean" }).notNull().default(true),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_ref_master").on(t.masterProfileId)],
);

export const customSections = sqliteTable(
  "custom_sections",
  {
    id: text("id").primaryKey(),
    masterProfileId: text("master_profile_id")
      .notNull()
      .references(() => masterProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content", { mode: "json" })
      .$type<{ title?: string; text: string }[]>()
      .notNull()
      .default(sql`'[]'`),
    orderIndex: integer("order_index").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("idx_custom_master").on(t.masterProfileId)],
);

// ---------------------------------------------------------------------------
// CV / Templates / Cover Letters / Jobs  (modelled now; built in later phases)
// ---------------------------------------------------------------------------
export const templates = sqliteTable("templates", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  formatType: text("format_type").notNull(),
  layoutSchema: text("layout_schema", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  themeTokens: text("theme_tokens", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
  isPremium: integer("is_premium", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const cvs = sqliteTable("cvs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  masterProfileId: text("master_profile_id").references(() => masterProfiles.id, {
    onDelete: "set null",
  }),
  templateId: text("template_id").references(() => templates.id),
  name: text("name").notNull(),
  settings: text("settings", { mode: "json" }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  status: text("status", { enum: ["draft", "ready", "archived"] })
    .notNull()
    .default("draft"),
  ...timestamps,
});

export const cvSections = sqliteTable("cv_sections", {
  id: text("id").primaryKey(),
  cvId: text("cv_id")
    .notNull()
    .references(() => cvs.id, { onDelete: "cascade" }),
  sectionType: text("section_type").notNull(),
  sourceBlockId: text("source_block_id"),
  overrideContent: text("override_content", { mode: "json" }).$type<Record<string, unknown> | null>(),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
});

export const coverLetters = sqliteTable("cover_letters", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cvId: text("cv_id").references(() => cvs.id, { onDelete: "set null" }),
  templateId: text("template_id").references(() => templates.id),
  jobId: text("job_id"),
  name: text("name").notNull().default(""),
  content: text("content", { mode: "json" }).$type<Record<string, unknown>>().notNull().default(sql`'{}'`),
  createdAt: text("created_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text("updated_at").default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  role: text("role").notNull(),
  jobUrl: text("job_url"),
  status: text("status", {
    enum: [
      "wishlist",
      "applied",
      "screening",
      "interview",
      "offer",
      "rejected",
      "withdrawn",
    ],
  })
    .notNull()
    .default("wishlist"),
  salaryRange: text("salary_range"),
  contactName: text("contact_name"),
  notes: text("notes"),
  followUpDate: text("follow_up_date"),
  cvId: text("cv_id").references(() => cvs.id, { onDelete: "set null" }),
  coverLetterId: text("cover_letter_id").references(() => coverLetters.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
});

export const jobEvents = sqliteTable("job_events", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  note: text("note").default(""),
  createdAt: text("created_at").notNull().default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`),
});

export type User = typeof users.$inferSelect;
export type MasterProfile = typeof masterProfiles.$inferSelect;