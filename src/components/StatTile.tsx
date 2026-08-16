export function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border-2 border-border-strong bg-surface p-4">
      <p className="font-hand text-[16px] text-muted">{label}</p>
      <p className="mt-1.5 font-mono text-[30px] font-semibold leading-none text-foreground">
        {value}
      </p>
    </div>
  );
}
