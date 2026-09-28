export const FEEDBACK_TYPES = ["bug", "feature", "improvement", "question", "other"] as const;
export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: "Bug",
  feature: "Feature request",
  improvement: "Improvement",
  question: "Question",
  other: "Other",
};

export const FEEDBACK_STATUSES = ["open", "in_progress", "resolved", "archived"] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  archived: "Archived",
};

/** The natural next step for the one-click status button. */
export const NEXT_STATUS: Partial<Record<FeedbackStatus, FeedbackStatus>> = {
  open: "in_progress",
  in_progress: "resolved",
};

export const WIDGET_POSITIONS = ["bottom-right", "bottom-left"] as const;
export type WidgetPosition = (typeof WIDGET_POSITIONS)[number];

export const DEFAULT_WIDGET_CONFIG = {
  buttonLabel: "Feedback",
  accentColor: "#ff5a1f",
  position: "bottom-right" as WidgetPosition,
};

export const MESSAGE_MIN_LENGTH = 3;
export const MESSAGE_MAX_LENGTH = 5000;
export const FEEDBACK_PAGE_SIZE = 50;
