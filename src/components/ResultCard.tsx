import { LotofacilResult, getMatchedNumbers } from "@/data/lotofacilResults";
import { NumberBall } from "./NumberBall";
import { cn } from "@/lib/utils";
import { Trophy, Award, Star } from "lucide-react";

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
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case 14:
        return "bg-gradient-to-r from-blue-500 to-cyan-600 text-white";
      case 13:
        return "bg-gradient-to-r from-purple-500 to-pink-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getIcon = () => {
    switch (matchCount) {
      case 15: return <Trophy className="h-4 w-4" />;
      case 14: return <Award className="h-4 w-4" />;
      case 13: return <Star className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-3 sm:p-4 transition-all duration-300",
        "hover:shadow-md active:scale-[0.99]",
        matchCount >= 13 && "border-l-4",
        matchCount === 15 && "border-l-green-500",
        matchCount === 14 && "border-l-blue-500",
        matchCount === 13 && "border-l-purple-500"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <span className="font-bold text-foreground">#{result.concurso}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">
              Concurso {result.concurso}
            </h3>
            <p className="text-xs text-muted-foreground">{result.data}</p>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold",
          "justify-center sm:justify-start",
          getBadgeStyle()
        )}>
          {getIcon()}
          <span>{matchCount} ACERTOS</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
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