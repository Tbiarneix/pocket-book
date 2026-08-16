import { getStatusStyle } from "@/lib/statusStyle";
import { SKETCH_RADIUS } from "@/lib/sketch";

/**
 * Reading-status badge. Each status carries its own glyph AND its own
 * border shape (solid thin / solid thick+filled / dashed / dotted) — never
 * color alone — so the four statuses stay distinguishable in grayscale or
 * to anyone with a color-vision deficiency.
 */
export function StatusBadge({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const { glyph, border } = getStatusStyle(name);

  const sizeClasses =
    size === "sm"
      ? "min-h-[26px] gap-1 px-2.5 py-0.5 text-[13px]"
      : "min-h-8 gap-1.5 px-3 py-1 text-[15px]";

  const toneClasses =
    border === "active"
      ? "border-2 border-accent bg-accent-soft font-semibold text-accent"
      : border === "dashed"
        ? "border-2 border-dashed border-border-strong bg-background text-foreground"
        : border === "dotted"
          ? "border-2 border-dotted border-border-strong bg-background text-foreground"
          : "border-2 border-border-strong bg-background text-foreground";

  return (
    <span
      className={`inline-flex items-center font-hand ${SKETCH_RADIUS} ${sizeClasses} ${toneClasses}`}
    >
      <span aria-hidden="true">{glyph}</span>
      {name}
    </span>
  );
}
