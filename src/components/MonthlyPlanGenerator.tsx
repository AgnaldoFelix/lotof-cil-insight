import React, { useState, useEffect } from 'react';
import { generateMonthlyStrategies } from '@/data/lotofacilAnalysis';
import { Button } from '@/components/ui/button';
import { NumberBall } from '@/components/NumberBall';
import { 
  Calendar,
  TrendingUp,
  Target,
  Zap,
  Snowflake,
  BarChart3,
  Crown,
  Copy,
  Check,
  RefreshCw,
  Download,
  Printer,
  Share2,
  Star,
  Award,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { lotofacilResults } from '@/data/lotofacilResults';

export interface MonthlyStrategy {
  id: string;
  name: string;
  description: string;
  numbers: number[];
  confidence: number;
  analysis: {
    hotNumbers: number[];
    coldNumbers: number[];
    repeatingPatterns: number[];
    oddEvenBalance: { odd: number; even: number };
    sumRange: string;
  };
}

interface MonthlyPlanProps {
  budget: number;
  onSelectStrategy: (strategy: MonthlyStrategy) => void;
  selectedStrategy?: MonthlyStrategy | null;
}

export const MonthlyPlanGenerator: React.FC<MonthlyPlanProps> = ({ 
  budget, 
  onSelectStrategy,
  selectedStrategy
}) => {
  const [strategies, setStrategies] = useState<MonthlyStrategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [copiedStrategy, setCopiedStrategy] = useState<string | null>(null);
  
  const gamesCount = Math.floor(budget / 3.5);
  const weeks = [
    { number: 1, games: Math.floor(gamesCount * 0.35), label: "Semana 1", color: "blue" },
    { number: 2, games: Math.floor(gamesCount * 0.35), label: "Semana 2", color: "purple" },
    { number: 3, games: Math.floor(gamesCount * 0.30), label: "Semana 3-4", color: "green" }
  ];

  useEffect(() => {
    generateNewStrategies();
  }, []);

  const generateNewStrategies = () => {
    setLoading(true);
    setTimeout(() => {
      const newStrategies = generateMonthlyStrategies(3);
      setStrategies(newStrategies);
      setLoading(false);
    }, 800);
  };

  const handleCopyStrategy = (strategy: MonthlyStrategy) => {
    navigator.clipboard.writeText(strategy.numbers.join(', '));
    setCopiedStrategy(strategy.id);
    setTimeout(() => setCopiedStrategy(null), 2000);
  };

  const handleSelectStrategy = (strategy: MonthlyStrategy) => {
    onSelectStrategy(strategy);
  };

  const handleExportPlan = () => {
    if (!selectedStrategy) return;
    
    const planData = {
      mes: new Date().toLocaleDateString('pt-BR', { month: 'long' }),
      orcamento: budget,
      jogos: gamesCount,
      estrategia: selectedStrategy,
      dataGeracao: new Date().toISOString(),
      concursosAnalisados: lotofacilResults.length
    };
    
    const blob = new Blob([JSON.stringify(planData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-mensal-lotofacil-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handlePrintPlan = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">Analisando {lotofacilResults.length} concursos históricos...</p>
        <p className="text-sm text-gray-600 mt-2">Gerando estratégias otimizadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Plano */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Plano Mensal Estratégico</h2>
              <p className="text-blue-100">R$ {budget.toFixed(2)} • {gamesCount} jogos no mês</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Concursos analisados</p>
            <p className="text-2xl font-bold">{lotofacilResults.length}</p>
          </div>
        </div>
        
        {/* Distribuição Semanal */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {weeks.map((week) => (
            <div key={week.number} className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-blue-100">{week.label}</p>
              <p className="text-2xl font-bold">{week.games} jogos</p>
              <div className={`w-full h-1 mt-2 rounded-full bg-${week.color}-400`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise Estatística */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Análise dos Últimos Concursos
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="text-gray-600"
          >
            {showAnalysis ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        {showAnalysis && strategies.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {/* Números Quentes e Frios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Zap className="h-4 w-4 text-red-500" />
                  Top 5 Números Quentes
                </p>
                <div className="flex flex-wrap gap-1">
                  {strategies[0].analysis.hotNumbers.slice(0, 5).map(num => (
                    <NumberBall
                      key={`hot-${num}`}
                      number={num}
                      size="sm"
                      className="bg-gradient-to-br from-red-100 to-red-200 text-red-700 border border-red-300"
                      disabled
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                  <Snowflake className="h-4 w-4 text-blue-500" />
                  Top 5 Números Frios
                </p>
                <div className="flex flex-wrap gap-1">
                  {strategies[0].analysis.coldNumbers.slice(0, 5).map(num => (
                    <NumberBall
                      key={`cold-${num}`}
                      number={num}
                      size="sm"
                      className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300"
                      disabled
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Média Ímpares</p>
                <p className="text-lg font-bold text-gray-900">
                  {strategies[0].analysis.oddEvenBalance.odd}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Média Pares</p>
                <p className="text-lg font-bold text-gray-900">
                  {strategies[0].analysis.oddEvenBalance.even}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Faixa de Soma</p>
                <p className="text-lg font-bold text-gray-900">
                  {strategies[0].analysis.sumRange}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estratégias Mensais */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Estratégias Mensais Geradas
        </h3>
        
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={cn(
              "bg-white rounded-xl border p-4 transition-all duration-300 hover:shadow-md",
              selectedStrategy?.id === strategy.id && "ring-2 ring-green-500 ring-offset-2"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  strategy.id === 'monthly-1' && "bg-gradient-to-br from-blue-500/10 to-blue-500/5",
                  strategy.id === 'monthly-2' && "bg-gradient-to-br from-purple-500/10 to-purple-500/5",
                  strategy.id === 'monthly-3' && "bg-gradient-to-br from-green-500/10 to-green-500/5"
                )}>
                  {strategy.id === 'monthly-1' && <TrendingUp className="h-5 w-5 text-blue-600" />}
                  {strategy.id === 'monthly-2' && <Target className="h-5 w-5 text-purple-600" />}
                  {strategy.id === 'monthly-3' && <Crown className="h-5 w-5 text-green-600" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{strategy.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all",
                          strategy.confidence >= 0.8 ? "bg-green-500" :
                          strategy.confidence >= 0.7 ? "bg-blue-500" : "bg-yellow-500"
                        )}
                        style={{ width: `${strategy.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700">
                      {Math.round(strategy.confidence * 100)}% confiança
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyStrategy(strategy)}
                  className="h-8 w-8 p-0"
                >
                  {copiedStrategy === strategy.id ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{strategy.description}</p>

            {/* Números da Estratégia */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {strategy.numbers.map(num => (
                <NumberBall
                  key={num}
                  number={num}
                  size="sm"
                  className={cn(
                    selectedStrategy?.id === strategy.id && "ring-2 ring-green-400",
                    strategy.id === 'monthly-1' && "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border border-blue-300",
                    strategy.id === 'monthly-2' && "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border border-purple-300",
                    strategy.id === 'monthly-3' && "bg-gradient-to-br from-green-100 to-green-200 text-green-700 border border-green-300"
                  )}
                  disabled
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSelectStrategy(strategy)}
                variant={selectedStrategy?.id === strategy.id ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  strategy.id === 'monthly-1' && selectedStrategy?.id !== strategy.id && "border-blue-300 text-blue-700",
                  strategy.id === 'monthly-2' && selectedStrategy?.id !== strategy.id && "border-purple-300 text-purple-700",
                  strategy.id === 'monthly-3' && selectedStrategy?.id !== strategy.id && "border-green-300 text-green-700"
                )}
              >
                {selectedStrategy?.id === strategy.id ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Estratégia Selecionada
                  </>
                ) : (
                  'Usar Esta Estratégia'
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Ações */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={generateNewStrategies}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Gerar Novas
        </Button>
        
        <Button
          onClick={handleExportPlan}
          disabled={!selectedStrategy}
          variant="outline"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar Plano
        </Button>
        
        <Button
          onClick={handlePrintPlan}
          disabled={!selectedStrategy}
          variant="outline"
          className="gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Dica Final */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-green-900 text-sm mb-1">Dica para Teimosinha Mensal</h4>
            <p className="text-sm text-green-700">
              Use uma estratégia diferente a cada semana. Comece com a estratégia 1, depois 2 e finalize com a 3.
              Isso aumenta suas chances ao explorar diferentes padrões estatísticos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};