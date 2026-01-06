import { cn } from "@/lib/utils";

interface NumberBallProps {
  number: number;
  selected?: boolean;
  matched?: boolean;
  matchType?: 15 | 14 | 13;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIndex?: boolean;
  indexNumber?: number;
  isExcess?: boolean;
}

export const NumberBall = ({
  number,
  selected = false,
  matched = false,
  matchType,
  onClick,
  disabled = false,
  size = "md",
  className,
  showIndex = false,
  indexNumber,
  isExcess = false,
}: NumberBallProps) => {
  // Tamanhos responsivos
  const sizeClasses = {
    sm: "w-7 h-7 text-xs sm:w-8 sm:h-8 sm:text-sm",
    md: "w-9 h-9 text-sm sm:w-11 sm:h-11 sm:text-base",
    lg: "w-11 h-11 text-base sm:w-14 sm:h-14 sm:text-lg",
  };

  const getMatchColor = () => {
    if (!matched) return "";
    switch (matchType) {
      case 15:
        return "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30";
      case 14:
        return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30";
      case 13:
        return "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30";
      default:
        return "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground";
    }
  };

  // Determinar a cor base baseada no estado
  const getBaseColor = () => {
    if (isExcess) {
      return "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700";
    }
    if (selected && !matched) {
      return "bg-gradient-to-br from-primary to-primary/90 text-white shadow-md scale-105 border-2 border-primary/20";
    }
    if (!selected && !matched) {
      return "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300 border border-gray-300";
    }
    return "";
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-full font-bold flex items-center justify-center transition-all duration-200",
        "touch-manipulation", // Otimiza para touch
        "active:scale-95",
        sizeClasses[size],
        matched && getMatchColor(),
        !matched && getBaseColor(),
        disabled && "cursor-default opacity-80",
        !disabled && "cursor-pointer hover:scale-110 hover:shadow-md",
        "select-none", // Evita seleção de texto
        className
      )}
      aria-label={`Número ${number}${showIndex && indexNumber ? `, posição ${indexNumber}` : ''}`}
    >
      {/* Marcador de índice para números excedentes */}
      {showIndex && indexNumber && (
        <div className={cn(
          "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-10 text-xs font-bold",
          isExcess
            ? "bg-red-700 text-white"
            : "bg-primary text-white"
        )}>
          {indexNumber}
        </div>
      )}
      
      {/* Número */}
      {number.toString().padStart(2, "0")}
    </button>
  );
};