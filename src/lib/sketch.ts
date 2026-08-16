/**
 * Shared "hand-drawn notebook" styling primitives for the Carnet à ligne
 * design direction: organic border-radius, double-trace pseudo-element
 * outlines/underlines. Centralized here so every component uses the exact
 * same shapes instead of re-deriving slightly different values.
 */

export const SKETCH_RADIUS =
  "rounded-[15px_225px_15px_225px/225px_15px_225px_15px]";
export const SKETCH_RADIUS_ALT =
  "rounded-[225px_15px_225px_15px/15px_225px_15px_225px]";

/** Second, fainter, slightly-rotated outline behind a sketch-radius element. */
export const SKETCH_OUTLINE =
  "relative before:content-[''] before:pointer-events-none before:absolute before:-inset-1 before:rounded-[225px_15px_225px_15px/15px_225px_15px_225px] before:border-[1.5px] before:border-border-field before:opacity-30 before:rotate-[0.5deg]";
export const SKETCH_OUTLINE_ALT =
  "relative before:content-[''] before:pointer-events-none before:absolute before:-inset-1 before:rounded-[15px_225px_15px_225px/225px_15px_225px_15px] before:border-[1.5px] before:border-border-field before:opacity-30 before:rotate-[-0.5deg]";

/** Double-trace underline drawn under inline text via ::before/::after. */
export const SKETCH_UNDERLINE =
  "relative inline-block after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-[2px] after:rounded-full after:bg-accent after:rotate-[-0.6deg] before:content-[''] before:absolute before:left-1 before:right-2 before:-bottom-0.5 before:h-[2px] before:rounded-full before:bg-accent before:opacity-50 before:rotate-[0.8deg]";
