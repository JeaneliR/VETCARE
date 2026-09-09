interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  accent?: string;
}

export default function StatCard({ label, value, icon, accent = "bg-brand-50 text-brand-700" }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl ${accent}`}>{icon}</div>
      <div>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
