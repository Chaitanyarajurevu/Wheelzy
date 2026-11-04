import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  bg?: string;
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "#059669",
  bg = "#ECFDF5",
  highlight = false,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3.5 flex items-center justify-between hover:border-emerald-200 transition-all group">
      <div className="min-w-0 pr-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 truncate">
          {label}
        </p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-xl font-black text-gray-900 tracking-tight">{value}</p>
          {highlight && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mb-0.5 shrink-0" />
          )}
        </div>
        {trend && (
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{trend}</p>
        )}
      </div>
      <span
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={16} />
      </span>
    </div>
  );
}

interface EmptyPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color?: string;
  bg?: string;
  actionButton?: React.ReactNode;
}

export function EmptyPage({
  title,
  description,
  icon: Icon,
  color = "#059669",
  bg = "#ECFDF5",
  actionButton,
}: EmptyPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center px-4 max-w-md mx-auto">
      <span
        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-inner"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={36} />
      </span>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
      {actionButton && <div className="mt-2">{actionButton}</div>}
    </div>
  );
}
