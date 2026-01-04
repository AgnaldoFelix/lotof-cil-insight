import { LotofacilResult, getMatchedNumbers } from "@/data/lotofacilResults";
import { NumberBall } from "./NumberBall";
import { cn } from "@/lib/utils";

interface ResultCardProps {
  result: LotofacilResult;
  selectedNumbers: number[];
  matchCount: number;
}

export const ResultCard = ({ result, selectedNumbers, matchCount }: ResultCardProps) => {
  const matchedNumbers = getMatchedNumbers(selectedNumbers, result.dezenas);
  
  const getBadgeStyle = () => {
    switch (matchCount) {
      case 15:
        return "bg-success text-primary-foreground";
      case 14:
        return "bg-ball-match14 text-primary-foreground";
      case 13:
        return "bg-ball-match13 text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getCardStyle = () => {
    switch (matchCount) {
      case 15:
        return "border-success/30 bg-success-light/30";
      case 14:
        return "border-ball-match14/30 bg-info-light/30";
      case 13:
        return "border-ball-match13/30 bg-accent/50";
      default:
        return "border-border bg-card";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all duration-300 animate-scale-in",
        getCardStyle()
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground">
            Concurso {result.concurso}
          </h3>
          <p className="text-sm text-muted-foreground">{result.data}</p>
        </div>
        <span
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium",
            getBadgeStyle()
          )}
        >
          {matchCount} acertos
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {result.dezenas.map((num) => (
          <NumberBall
            key={num}
            number={num}
            size="sm"
            matched={matchedNumbers.includes(num)}
            matchType={matchCount as 15 | 14 | 13}
            disabled
          />
        ))}
      </div>
    </div>
  );
};
