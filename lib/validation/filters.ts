import { FEEDBACK_STATUSES, FEEDBACK_TYPES, type FeedbackStatus, type FeedbackType } from "@/lib/constants";

export type FeedbackFilters = {
  q: string;
  status: FeedbackStatus | "all";
  type: FeedbackType | "all";
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Parses dashboard filters from URL search params, falling back to safe defaults. */
export function parseFeedbackFilters(params: RawParams): FeedbackFilters {
  const status = first(params.status);
  const type = first(params.type);
  return {
    q: first(params.q).trim().slice(0, 100),
    status: (FEEDBACK_STATUSES as readonly string[]).includes(status) ? (status as FeedbackStatus) : "all",
    type: (FEEDBACK_TYPES as readonly string[]).includes(type) ? (type as FeedbackType) : "all",
  };
}

/** Escapes characters that have special meaning in ILIKE patterns and PostgREST filters. */
export function toSearchPattern(q: string): string | null {
  const cleaned = q
    .replace(/[\\%_]/g, (c) => `\\${c}`)
    .replace(/[,()*"]/g, " ")
    .trim();
  return cleaned ? `%${cleaned}%` : null;
}

export function filtersToSearchParams(filters: Partial<FeedbackFilters>): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.status && filters.status !== "all") sp.set("status", filters.status);
  if (filters.type && filters.type !== "all") sp.set("type", filters.type);
  const s = sp.toString();
  return s ? `?${s}` : "";
}
