import { cn } from "@/lib/utils";

interface NumberBallProps {
  number: number;
  selected?: boolean;
  matched?: boolean;
  matchType?: 15 | 14 | 13;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export const NumberBall = ({
  number,
  selected = false,
  matched = false,
  matchType,
  onClick,
  disabled = false,
  size = "md",
}: NumberBallProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-14 h-14 text-lg",
  };

  const getMatchColor = () => {
    if (!matched) return "";
    switch (matchType) {
      case 15:
        return "bg-ball-match15 text-primary-foreground shadow-glow";
      case 14:
        return "bg-ball-match14 text-primary-foreground";
      case 13:
        return "bg-ball-match13 text-primary-foreground";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-full font-medium flex items-center justify-center transition-all duration-300 ease-out",
        sizeClasses[size],
        !selected && !matched && "bg-ball-default text-foreground hover:bg-accent hover:scale-105",
        selected && !matched && "bg-ball-selected text-primary-foreground shadow-soft scale-105",
        matched && getMatchColor(),
        disabled && "cursor-default",
        !disabled && "cursor-pointer active:scale-95"
      )}
    >
      {number.toString().padStart(2, "0")}
    </button>
  );
};
