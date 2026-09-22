import { useMemo } from "react";
import { getAvatarUri } from "../../lib/avatar";

interface AvatarProps {
  name: string;
  seed?: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

export function Avatar({ name, seed, color = "#2563eb", size = "md", className = "" }: AvatarProps) {
  const uri = useMemo(() => getAvatarUri(seed ?? name, color), [seed, name, color]);

  return (
    <img
      src={uri}
      alt=""
      aria-hidden="true"
      className={`shrink-0 rounded-full ring-2 ring-white shadow-sm transition-transform duration-200 ease-out hover:scale-105 ${SIZE_CLASSES[size]} ${className}`}
      style={{ backgroundColor: color }}
    />
  );
}
