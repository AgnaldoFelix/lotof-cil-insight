import { NumberBall } from "./NumberBall";

interface NumberSelectorProps {
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  maxSelections?: number;
}

export const NumberSelector = ({
  selectedNumbers,
  onToggleNumber,
  maxSelections = 15,
}: NumberSelectorProps) => {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const canSelectMore = selectedNumbers.length < maxSelections;

  return (
    <div className="space-y-4">
      {/* Contador responsivo */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Selecione {maxSelections} números
        </p>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${(selectedNumbers.length / maxSelections) * 100}%` }}
            />
          </div>
          <span className={cn(
            "text-sm font-bold px-3 py-1 rounded-full",
            selectedNumbers.length === maxSelections 
              ? "bg-green-100 text-green-700" 
              : "bg-gray-100 text-gray-700"
          )}>
            {selectedNumbers.length}/{maxSelections}
          </span>
        </div>
      </div>
      
      {/* Grid responsivo */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 justify-items-center">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          
          return (
            <NumberBall
              key={num}
              number={num}
              selected={isSelected}
              onClick={() => {
                if (isSelected || canSelectMore) {
                  onToggleNumber(num);
                }
              }}
              disabled={!isSelected && !canSelectMore}
              size="md"
              className={cn(
                !isSelected && !canSelectMore && "opacity-40",
                "transition-transform duration-150"
              )}
            />
          );
        })}
      </div>

      {/* Dica mobile */}
      <div className="block sm:hidden pt-2 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Toque nos números para selecionar
        </p>
      </div>
    </div>
  );
};

// Função de utilidade
import { cn } from "@/lib/utils";