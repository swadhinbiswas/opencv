/** Client-safe job tracker constants. */

export const JOB_STATUSES = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

/** Pipeline order; used to compute left/right moves on the board. */
export const PIPELINE: JobStatus[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
];

export const TERMINAL_STATUSES: JobStatus[] = ["rejected", "withdrawn"];

/** Tailwind classes for column accents. */
export const STATUS_TINTS: Record<JobStatus, string> = {
  wishlist: "text-slate-600",
  applied: "text-blue-600",
  screening: "text-indigo-600",
  interview: "text-purple-600",
  offer: "text-emerald-600",
  rejected: "text-rose-600",
  withdrawn: "text-zinc-500",
};
