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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selecione {maxSelections} números
        </p>
        <span className="text-sm font-medium text-primary">
          {selectedNumbers.length}/{maxSelections}
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-3 justify-items-center">
        {numbers.map((num) => (
          <NumberBall
            key={num}
            number={num}
            selected={selectedNumbers.includes(num)}
            onClick={() => {
              if (selectedNumbers.includes(num) || canSelectMore) {
                onToggleNumber(num);
              }
            }}
            disabled={!selectedNumbers.includes(num) && !canSelectMore}
          />
        ))}
      </div>
    </div>
  );
};
