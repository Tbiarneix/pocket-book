import { BookOpen, CheckCheck, Layers, Sparkles, type LucideIcon } from "lucide-react";

/**
 * Border treatment for a reading-status badge. Each status gets a distinct
 * shape in addition to its icon, so the badge never depends on color alone
 * (solid thin / solid thick+filled / dashed remain distinguishable in
 * grayscale).
 */
export type StatusBorderVariant = "solid" | "active" | "dashed";

export interface StatusStyle {
  icon: LucideIcon;
  border: StatusBorderVariant;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  "ma pile à lire": { icon: Layers, border: "solid" },
  "en cours": { icon: BookOpen, border: "active" },
  "terminé": { icon: CheckCheck, border: "dashed" },
  "mes envies": { icon: Sparkles, border: "solid" },
};

const DEFAULT_STYLE: StatusStyle = { icon: Layers, border: "solid" };

export function getStatusStyle(name: string | null | undefined): StatusStyle {
  if (!name) return DEFAULT_STYLE;
  return STATUS_STYLES[name.trim().toLowerCase()] ?? DEFAULT_STYLE;
}

/** True for the "in progress" status — used to show the cover bookmark ribbon. */
export function isActiveStatus(name: string | null | undefined): boolean {
  return getStatusStyle(name).border === "active";
}
