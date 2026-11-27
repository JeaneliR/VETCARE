const colorMap: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-brand-100 text-brand-700",
  yellow: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-ocean-100 text-ocean-700",
  purple: "bg-ocean-100 text-ocean-700",
};

interface BadgeProps {
  color?: keyof typeof colorMap;
  children: React.ReactNode;
}

export default function Badge({ color = "slate", children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}
