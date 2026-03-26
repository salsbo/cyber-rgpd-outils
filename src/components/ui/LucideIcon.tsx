import { icons, type LucideIcon as LucideIconType } from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
}

export default function LucideIcon({ name, className = "w-5 h-5" }: LucideIconProps) {
  const Icon = icons[name as keyof typeof icons] as LucideIconType | undefined;
  if (!Icon) return null;
  return <Icon className={className} />;
}
