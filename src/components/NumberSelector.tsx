import { NumberBall } from "./NumberBall";
import { cn } from "@/lib/utils";

interface NumberSelectorProps {
  selectedNumbers: number[];
  onToggleNumber: (num: number) => void;
  maxSelections?: number;
  highlightExcess?: boolean;
  excessStartIndex?: number;
}

export const NumberSelector = ({
  selectedNumbers,
  onToggleNumber,
  maxSelections = 15,
  highlightExcess = false,
  excessStartIndex = 15,
}: NumberSelectorProps) => {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const hasExcess = selectedNumbers.length > maxSelections;
  const excessCount = Math.max(0, selectedNumbers.length - maxSelections);

  return (
    <div className="space-y-4">
      {/* Contador responsivo */}
      <div className="flex items-center justify-between px-1">
        <div className="text-left">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {hasExcess
              ? `Selecionados: ${selectedNumbers.length} números`
              : `Selecione até 25 números`}
          </p>
          {hasExcess && (
            <p className="text-xs text-red-600 mt-1">
              {excessCount} número(s) excedente(s) em vermelho
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                hasExcess
                  ? "bg-gradient-to-r from-red-500 to-red-400"
                  : selectedNumbers.length === maxSelections
                  ? "bg-gradient-to-r from-green-500 to-green-400"
                  : "bg-gradient-to-r from-primary to-primary/80"
              )}
              style={{
                width: hasExcess
                  ? `${Math.min(
                      100,
                      (maxSelections / selectedNumbers.length) * 100
                    )}%`
                  : `${(selectedNumbers.length / 25) * 100}%`,
              }}
            />
          </div>
          <span
            className={cn(
              "text-sm font-bold px-3 py-1 rounded-full",
              hasExcess
                ? "bg-red-100 text-red-700"
                : selectedNumbers.length === maxSelections
                ? "bg-green-100 text-green-700"
                : selectedNumbers.length > maxSelections
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            )}
          >
            {hasExcess
              ? `${excessCount} extra`
              : `${selectedNumbers.length}/25`}
          </span>
        </div>
      </div>

      {/* Grid responsivo */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 justify-items-center">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const selectedIndex = selectedNumbers.indexOf(num);
          const isExcess =
            highlightExcess && isSelected && selectedIndex >= excessStartIndex;
          const isWithinLimit = isSelected && selectedIndex < maxSelections;

          return (
            <NumberBall
              key={num}
              number={num}
              selected={isSelected}
              onClick={() => onToggleNumber(num)}
              disabled={false}
              size="md"
              className={cn(
                "transition-transform duration-150",
                isExcess && "ring-2 ring-red-500 ring-offset-1"
              )}
              showIndex={
                isExcess || (isSelected && selectedIndex < maxSelections)
              }
              indexNumber={selectedIndex + 1}
              isExcess={isExcess}
            />
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 justify-center items-center pt-4 border-t border-border">
        {hasExcess && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/80"></div>
              <span className="text-xs text-muted-foreground">
                15 primeiros
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600"></div>
              <span className="text-xs text-muted-foreground">
                Números excedentes
              </span>
            </div>
          </>
        )}
      </div>

      {/* Dica mobile */}
      <div className="block sm:hidden pt-2 border-t border-border">
        <p className="text-xs text-center text-muted-foreground">
          Toque nos números para selecionar (máx. 25)
        </p>
      </div>
    </div>
  );
};
