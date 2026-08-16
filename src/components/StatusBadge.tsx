import { getStatusStyle } from "@/lib/statusStyle";

/**
 * Reading-status badge. Each status carries its own icon AND its own
 * border shape (solid thin / solid thick+filled / dashed) — never color
 * alone — so the four statuses stay distinguishable in grayscale or to
 * anyone with a color-vision deficiency.
 */
export function StatusBadge({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  const { icon: Icon, border } = getStatusStyle(name);

  const sizeClasses =
    size === "sm"
      ? "min-h-[22px] gap-1 rounded-full px-2.5 py-0.5 text-[11.5px]"
      : "min-h-7 gap-1.5 rounded-full px-3 py-0.5 text-[13px]";

  const iconSize = size === "sm" ? 12 : 14;

  const toneClasses =
    border === "active"
      ? "border-[1.5px] border-accent bg-accent-soft font-semibold text-accent"
      : border === "dashed"
        ? "border border-dashed border-border-strong font-medium text-foreground"
        : "border border-border-field font-medium text-foreground";

  return (
    <span className={`inline-flex items-center ${sizeClasses} ${toneClasses}`}>
      <Icon aria-hidden="true" width={iconSize} height={iconSize} strokeWidth={2} />
      {name}
    </span>
  );
}
