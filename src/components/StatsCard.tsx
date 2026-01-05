import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  variant?: "success" | "info" | "warning" | "default";
  trend?: "up" | "down" | "neutral";
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  variant = "default",
  trend 
}: StatsCardProps) => {
  const variantStyles = {
    success: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    info: "bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200",
    warning: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200",
    default: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200",
  };

  const textStyles = {
    success: "text-green-700",
    info: "text-blue-700",
    warning: "text-amber-700",
    default: "text-gray-700",
  };

  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus
  }[trend || "neutral"];

  return (
    <div
      className={cn(
        "rounded-xl border p-3 sm:p-4 text-center transition-all duration-300",
        "hover:shadow-sm active:scale-[0.98] touch-manipulation",
        variantStyles[variant]
      )}
    >
      <p className="text-xs sm:text-sm text-gray-600 mb-1 font-medium">{title}</p>
      <div className="flex items-center justify-center gap-2">
        <p className={cn("text-2xl sm:text-3xl font-bold", textStyles[variant])}>
          {value}
        </p>
        {trend && (
          <div className={cn(
            "p-1 rounded-full",
            trend === 'up' ? 'bg-green-100' :
            trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
          )}>
            <TrendIcon className={cn(
              "h-3 w-3",
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' : 'text-gray-600'
            )} />
          </div>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1 truncate">{subtitle}</p>
      )}
    </div>
  );
};