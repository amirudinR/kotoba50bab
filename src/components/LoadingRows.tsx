import AppIcon from "./Icon";

/** Placeholder saat data bab dimuat. */
export default function LoadingRows({
  rows = 6,
  label = "Memuat kosakata…",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div className="px-4 py-6">
      <p className="k-eyebrow mb-3 flex items-center gap-1.5">
        <AppIcon icon="ph:circle-notch" className="animate-spin text-sm" />
        {label}
      </p>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-8 animate-pulse rounded-md bg-sunken/70"
            style={{ animationDelay: `${i * 70}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
