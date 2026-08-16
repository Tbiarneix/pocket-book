/**
 * Border treatment for a reading-status badge. Each status gets a distinct
 * shape in addition to its glyph, so the badge never depends on color alone
 * (solid thin / solid thick+filled / dashed / dotted remain distinguishable
 * in grayscale).
 */
export type StatusBorderVariant = "solid" | "active" | "dashed" | "dotted";

export interface StatusStyle {
  glyph: string;
  border: StatusBorderVariant;
}

const STATUS_STYLES: Record<string, StatusStyle> = {
  "ma pile à lire": { glyph: "▤", border: "solid" },
  "en cours": { glyph: "→", border: "active" },
  "terminé": { glyph: "✓", border: "dashed" },
  "mes envies": { glyph: "★", border: "dotted" },
};

const DEFAULT_STYLE: StatusStyle = { glyph: "▤", border: "solid" };

export function getStatusStyle(name: string | null | undefined): StatusStyle {
  if (!name) return DEFAULT_STYLE;
  return STATUS_STYLES[name.trim().toLowerCase()] ?? DEFAULT_STYLE;
}

/** True for the "in progress" status — used to show the cover bookmark ribbon. */
export function isActiveStatus(name: string | null | undefined): boolean {
  return getStatusStyle(name).border === "active";
}
