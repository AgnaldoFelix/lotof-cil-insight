import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: "success" | "info" | "warning" | "default";
}

export const StatsCard = ({ title, value, subtitle, variant = "default" }: StatsCardProps) => {
  const variantStyles = {
    success: "bg-success-light border-success/20",
    info: "bg-info-light border-info/20",
    warning: "bg-warning-light border-warning/20",
    default: "bg-card border-border",
  };

  const textStyles = {
    success: "text-success",
    info: "text-info",
    warning: "text-warning",
    default: "text-primary",
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 text-center transition-all duration-300 hover:shadow-soft",
        variantStyles[variant]
      )}
    >
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={cn("text-3xl font-serif font-bold", textStyles[variant])}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};
