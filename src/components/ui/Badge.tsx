import type { StatusMeta } from "../../data/constants";

interface BadgeProps {
  meta: StatusMeta;
  className?: string;
}

export function StatusBadge({ meta, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bgClass} ${meta.textClass} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClass}`} />
      {meta.label}
    </span>
  );
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "neutral" | "brand";
  className?: string;
}) {
  const styles =
    variant === "brand"
      ? "bg-brand-100 text-brand-700"
      : "bg-ink-100 text-ink-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
