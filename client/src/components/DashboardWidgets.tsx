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
    <div className="bg-white rounded-2xl border border-gray-100/90 p-5 flex items-start justify-between shadow-xs hover:shadow-md hover:border-emerald-200/80 transition-all group">
      <div className="space-y-1 min-w-0 pr-2">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        {trend && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            {highlight && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            <span>{trend}</span>
          </p>
        )}
      </div>
      <span
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
        style={{ backgroundColor: bg, color }}
      >
        <Icon size={22} />
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
