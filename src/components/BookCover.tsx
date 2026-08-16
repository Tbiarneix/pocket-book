/**
 * Book cover thumbnail: real image when available, otherwise a woven
 * placeholder pattern. Always gets the decorative dog-ear corner; the
 * bookmark ribbon only appears when `active` (status "En cours") — it is
 * purely decorative, the status itself is always carried by the
 * icon+label StatusBadge next to it, never by the ribbon alone.
 */
export function BookCover({
  coverUrl,
  title,
  active = false,
  size = "sm",
  alt = "",
}: {
  coverUrl?: string | null;
  title: string;
  active?: boolean;
  size?: "sm" | "lg";
  alt?: string;
}) {
  const dimensions = size === "lg" ? "h-56 w-40" : "h-[98px] w-[68px]";

  return (
    <div
      className={`relative ${dimensions} shrink-0 overflow-hidden rounded-[8px] bg-surface-muted`}
    >
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={alt || `Couverture de ${title}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            background:
              "repeating-linear-gradient(135deg, var(--color-surface-muted), var(--color-surface-muted) 6px, var(--cover-stripe) 6px, var(--cover-stripe) 12px)",
          }}
        >
          <span className="font-mono text-[9px] text-muted" aria-hidden="true">
            couv.
          </span>
        </div>
      )}

      <span
        aria-hidden="true"
        className="absolute right-0 top-0 h-[15px] w-[15px]"
        style={{
          background: "linear-gradient(135deg, transparent 50%, var(--dogear-shade) 50%)",
          borderRadius: "0 8px 0 9px",
        }}
      />

      {active && (
        <span
          aria-hidden="true"
          className="absolute -top-1 left-[18px] h-[26px] w-[14px] bg-accent"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)" }}
        />
      )}
    </div>
  );
}
