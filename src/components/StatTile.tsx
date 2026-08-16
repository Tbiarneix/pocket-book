export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-border bg-surface p-4">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1.5 font-mono text-[32px] font-semibold leading-none text-foreground">
        {value}
      </p>
    </div>
  );
}
