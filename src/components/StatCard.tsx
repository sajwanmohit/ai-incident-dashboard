import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: "cyan" | "red" | "green" | "violet";
}

export default function StatCard({ label, value, detail, icon: Icon, tone }: StatCardProps) {
  return (
    <article className="stat-card panel">
      <div className="stat-top">
        <span className="eyebrow">{label}</span>
        <span className={`stat-icon tone-${tone}`}><Icon size={18} strokeWidth={1.8} /></span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
    </article>
  );
}
