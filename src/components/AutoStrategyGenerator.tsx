import React, { useState } from 'react';
import { generateStrategies, getHotNumbers, getColdNumbers } from '@/data/lotofacilAnalysis';
import { Button } from '@/components/ui/button';
import { NumberBall } from '@/components/NumberBall';
import { 
  TrendingUp, 
  Clock, 
  Zap, 
  Snowflake, 
  Target,
  Copy,
  Check,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { lotofacilResults } from '@/data/lotofacilResults';

interface StrategyCardProps {
  name: string;
  description: string;
  numbers: number[];
  confidence: number;
  icon: React.ReactNode;
  onSelect: () => void;
  isSelected?: boolean;
}

const StrategyCard: React.FC<StrategyCardProps> = ({
  name,
  description,
  numbers,
  confidence,
  icon,
  onSelect,
  isSelected
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(numbers.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const confidenceColor = confidence >= 0.8 ? 'bg-green-500' :
                         confidence >= 0.7 ? 'bg-blue-500' :
                         'bg-yellow-500';

  return (
    <div className={cn(
      "bg-card rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
      isSelected && "ring-2 ring-primary ring-offset-2"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", confidenceColor)}
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(confidence * 100)}% confiança
              </span>
            </div>
          </div>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-8 w-8 p-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{description}</p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {numbers.map(num => (
          <NumberBall
            key={num}
            number={num}
            size="sm"
            disabled
            className="scale-90"
          />
        ))}
      </div>

      <Button
        onClick={onSelect}
        variant={isSelected ? "default" : "outline"}
        className="w-full"
      >
        {isSelected ? "✓ Selecionada" : "Usar Esta Estratégia"}
      </Button>
    </div>
  );
};

interface AutoStrategyGeneratorProps {
  onSelectNumbers: (numbers: number[]) => void;
  selectedNumbers: number[];
}

export const AutoStrategyGenerator: React.FC<AutoStrategyGeneratorProps> = ({
  onSelectNumbers,
  selectedNumbers
}) => {
  const [strategies] = useState(() => generateStrategies());
  const [hotNumbers] = useState(() => getHotNumbers());
  const [coldNumbers] = useState(() => getColdNumbers());
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [showHotCold, setShowHotCold] = useState(true);

  const handleStrategySelect = (strategyId: string, numbers: number[]) => {
    setSelectedStrategy(strategyId);
    onSelectNumbers(numbers);
  };

  const generateRandom = () => {
    const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const randomNumbers = [...allNumbers]
      .sort(() => Math.random() - 0.5)
      .slice(0, 15)
      .sort((a, b) => a - b);
    
    setSelectedStrategy('custom');
    onSelectNumbers(randomNumbers);
  };

  const strategyIcons = {
    frequency: <BarChart3 className="h-4 w-4 text-primary" />,
    delayed: <Clock className="h-4 w-4 text-amber-500" />,
    balanced: <Target className="h-4 w-4 text-green-500" />,
    pairs: <TrendingUp className="h-4 w-4 text-blue-500" />,
    custom: <RefreshCw className="h-4 w-4 text-purple-500" />
  };

  return (
    <div className="space-y-6">
      {/* Números Quentes/Frios */}
      <div className="bg-gradient-to-r from-card to-card/80 rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHotCold(!showHotCold)}
              className="h-8"
            >
              {showHotCold ? 'Ocultar' : 'Mostrar'} Análise
            </Button>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-red-500" />
              <span className="text-xs">Quentes</span>
            </div>
            <div className="flex items-center gap-1">
              <Snowflake className="h-3 w-3 text-blue-500" />
              <span className="text-xs">Frias</span>
            </div>
          </div>
        </div>

        {showHotCold && (
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3 text-red-500" />
                Números Quentes
              </p>
              <div className="flex flex-wrap gap-1">
                {hotNumbers.map(num => (
                  <NumberBall
                    key={`hot-${num}`}
                    number={num}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-br from-red-100 to-red-200 text-red-700 border border-red-300",
                      selectedNumbers.includes(num) && "ring-2 ring-red-400"
                    )}
                    disabled
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                <Snowflake className="h-3 w-3 text-blue-500" />
                Números Frios
              </p>
              <div className="flex flex-wrap gap-1">
                {coldNumbers.map(num => (
                  <NumberBall
                    key={`cold-${num}`}
                    number={num}
                    size="sm"
                    className={cn(
                      "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300",
                      selectedNumbers.includes(num) && "ring-2 ring-blue-400"
                    )}
                    disabled
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estratégias Automáticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map(strategy => (
          <StrategyCard
            key={strategy.id}
            name={strategy.name}
            description={strategy.description}
            numbers={strategy.numbers}
            confidence={strategy.confidence}
            icon={strategyIcons[strategy.id as keyof typeof strategyIcons] || <Target className="h-4 w-4" />}
            onSelect={() => handleStrategySelect(strategy.id, strategy.numbers)}
            isSelected={selectedStrategy === strategy.id}
          />
        ))}
      </div>

      {/* Botão para geração aleatória */}
      <div className="text-center">
        <Button
          onClick={generateRandom}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Gerar Combinação Aleatória
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Baseado em análise estatística de {lotofacilResults.length} concursos
        </p>
      </div>
    </div>
  );
};