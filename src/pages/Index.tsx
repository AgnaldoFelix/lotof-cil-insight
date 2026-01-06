import { useState, useMemo } from "react";
import { NumberSelector } from "@/components/NumberSelector";
import { ResultCard } from "@/components/ResultCard";
import { StatsCard } from "@/components/StatsCard";
import { AutoStrategyGenerator } from "@/components/AutoStrategyGenerator";
import { lotofacilResults, calculateMatches, getMatchedNumbers } from "@/data/lotofacilResults";
import { Button } from "@/components/ui/button";
import { MonthlyPlanGenerator, MonthlyStrategy } from '@/components/MonthlyPlanGenerator';

import { 
  Sparkles, 
  RotateCcw, 
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Snowflake,
  Calendar,
  AlertCircle,
  Calculator
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [hasSimulated, setHasSimulated] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);
  const [showMonthlyPlan, setShowMonthlyPlan] = useState(false);
  const [monthlyStrategy, setMonthlyStrategy] = useState<MonthlyStrategy | null>(null);

  const handleToggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : [...prev, num].sort((a, b) => a - b)
    );
    setHasSimulated(false);
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setHasSimulated(false);
  };

  const handleSelectMonthlyStrategy = (strategy: MonthlyStrategy) => {
    setMonthlyStrategy(strategy);
    setSelectedNumbers(strategy.numbers);
    setHasSimulated(false);
  };

  const handleSimulate = () => {
    if (selectedNumbers.length >= 15) {
      setHasSimulated(true);
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleSelectNumbers = (numbers: number[]) => {
    setSelectedNumbers(numbers);
    setHasSimulated(false);
  };

  // Calcular todas as combinações de 15 números possíveis dentro dos selecionados
  const calculateAllCombinations = useMemo(() => {
    if (selectedNumbers.length < 15) return [];
    
    // Se exatamente 15 números, retorna apenas esta combinação
    if (selectedNumbers.length === 15) return [selectedNumbers];
    
    // Função para gerar combinações (combinações de n tomados 15 a 15)
    const combinations = (arr: number[], k: number): number[][] => {
      const result: number[][] = [];
      
      const combine = (start: number, current: number[]) => {
        if (current.length === k) {
          result.push([...current]);
          return;
        }
        
        for (let i = start; i < arr.length; i++) {
          current.push(arr[i]);
          combine(i + 1, current);
          current.pop();
        }
      };
      
      combine(0, []);
      return result;
    };
    
    return combinations(selectedNumbers, 15);
  }, [selectedNumbers]);

  // Calcular número de combinações possíveis
  const combinationCount = useMemo(() => {
    if (selectedNumbers.length < 15) return 0;
    if (selectedNumbers.length === 15) return 1;
    
    // Fórmula: C(n, 15) = n! / (15! * (n-15)!)
    const n = selectedNumbers.length;
    const k = 15;
    
    let numerator = 1;
    let denominator = 1;
    
    for (let i = 0; i < k; i++) {
      numerator *= (n - i);
      denominator *= (i + 1);
    }
    
    return numerator / denominator;
  }, [selectedNumbers]);

  // Simular com todas as combinações possíveis
  const results = useMemo(() => {
    if (!hasSimulated || selectedNumbers.length < 15) {
      return { 
        match15: [], 
        match14: [], 
        match13: [],
        bestMatch: 0,
        allCombinationResults: []
      };
    }

    // Se exatamente 15 números, usar a lógica original
    if (selectedNumbers.length === 15) {
      const analyzed = lotofacilResults.map((result) => ({
        ...result,
        matchCount: calculateMatches(selectedNumbers, result.dezenas),
      }));

      return {
        match15: analyzed.filter((r) => r.matchCount === 15),
        match14: analyzed.filter((r) => r.matchCount === 14),
        match13: analyzed.filter((r) => r.matchCount === 13),
        bestMatch: Math.max(...analyzed.map(r => r.matchCount)),
        allCombinationResults: [{
          numbers: selectedNumbers,
          results: analyzed
        }]
      };
    }

    // Para mais de 15 números, simular todas as combinações
    const allCombinationResults = calculateAllCombinations.map(combination => {
      const analyzed = lotofacilResults.map((result) => ({
        ...result,
        matchCount: calculateMatches(combination, result.dezenas),
      }));
      
      return {
        numbers: combination,
        results: analyzed,
        bestMatch: Math.max(...analyzed.map(r => r.matchCount)),
        match15Count: analyzed.filter(r => r.matchCount === 15).length,
        match14Count: analyzed.filter(r => r.matchCount === 14).length,
        match13Count: analyzed.filter(r => r.matchCount === 13).length,
      };
    });

    // Encontrar o melhor resultado de cada concurso entre todas as combinações
    const bestResultsByConcurso = lotofacilResults.map(result => {
      let bestMatchInConcurso = 0;
      
      allCombinationResults.forEach(combo => {
        const comboResult = combo.results.find(r => r.concurso === result.concurso);
        if (comboResult && comboResult.matchCount > bestMatchInConcurso) {
          bestMatchInConcurso = comboResult.matchCount;
        }
      });
      
      return {
        ...result,
        matchCount: bestMatchInConcurso,
      };
    });

    // Encontrar a melhor combinação geral (que mais vezes acertou 15)
    const bestCombination = allCombinationResults.reduce((best, current) => {
      if (current.match15Count > best.match15Count) return current;
      if (current.match15Count === best.match15Count) {
        if (current.match14Count > best.match14Count) return current;
      }
      return best;
    }, allCombinationResults[0]);

    return {
      match15: bestResultsByConcurso.filter((r) => r.matchCount === 15),
      match14: bestResultsByConcurso.filter((r) => r.matchCount === 14),
      match13: bestResultsByConcurso.filter((r) => r.matchCount === 13),
      bestMatch: Math.max(...bestResultsByConcurso.map(r => r.matchCount)),
      allCombinationResults,
      bestCombination,
      combinationCount: allCombinationResults.length
    };
  }, [selectedNumbers, hasSimulated, calculateAllCombinations]);

  const totalWins = results.match15.length + results.match14.length + results.match13.length;

  // Análise rápida dos números selecionados
  const selectionStats = useMemo(() => {
    if (selectedNumbers.length === 0) return null;
    
    const oddCount = selectedNumbers.filter(n => n % 2 !== 0).length;
    const evenCount = selectedNumbers.length - oddCount;
    const sum = selectedNumbers.reduce((a, b) => a + b, 0);
    const average = sum / selectedNumbers.length;
    
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
    const primeCount = selectedNumbers.filter(n => primes.includes(n)).length;
    
    const quadrant1 = selectedNumbers.filter(n => n <= 6).length;
    const quadrant2 = selectedNumbers.filter(n => n > 6 && n <= 12).length;
    const quadrant3 = selectedNumbers.filter(n => n > 12 && n <= 18).length;
    const quadrant4 = selectedNumbers.filter(n => n > 18).length;

    return {
      oddCount,
      evenCount,
      sum,
      average,
      primeCount,
      quadrants: [quadrant1, quadrant2, quadrant3, quadrant4],
      totalSelected: selectedNumbers.length,
      selectionRatio: (selectedNumbers.length / 25) * 100
    };
  }, [selectedNumbers]);

  // Verifica se tem mais de 15 números selecionados
  const hasExcessNumbers = selectedNumbers.length > 15;
  const excessCount = Math.max(0, selectedNumbers.length - 15);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Mobile Otimizado */}
      <header className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg sm:text-xl text-gray-900">
                  Simulador Lotofácil Pro
                </h1>
                <p className="text-xs text-gray-600">
                  {lotofacilResults.length} concursos analisados
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium bg-primary/10 px-2 py-1 rounded-full text-primary">
                IA + Stats
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Seção de Estratégias Inteligentes */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowStrategies(!showStrategies)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white hover:from-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                  Estratégias Inteligentes
                </h2>
                <p className="text-xs text-gray-600">Análise estatística automática</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showStrategies ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </button>
          
          {showStrategies && (
            <div className="p-4 border-t border-gray-100 animate-slide-down">
              <AutoStrategyGenerator
                onSelectNumbers={handleSelectNumbers}
                selectedNumbers={selectedNumbers}
              />
            </div>
          )}
        </section>

        {/* Plano Mensal Estratégico */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowMonthlyPlan(!showMonthlyPlan)}
            className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white hover:from-gray-100/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base">
                  Plano Mensal Estratégico
                </h2>
                <p className="text-xs text-gray-600">Estratégias otimizadas para o mês</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showMonthlyPlan ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </button>

          {showMonthlyPlan && (
            <div className="p-6 border-t border-gray-100 animate-slide-down space-y-6">
              <MonthlyPlanGenerator 
                budget={74}
                onSelectStrategy={handleSelectMonthlyStrategy}
                selectedStrategy={monthlyStrategy}
              />
              
              {monthlyStrategy && (
                <div className="pt-6 border-t border-gray-100 animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-gray-900">Estratégia Mensal Selecionada</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNumbers(monthlyStrategy.numbers)}
                      className="text-primary"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Usar nos Números
                    </Button>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Ímpares/Pares</p>
                        <p className="text-lg font-bold text-gray-900">
                          {monthlyStrategy.analysis.oddEvenBalance.odd}/{monthlyStrategy.analysis.oddEvenBalance.even}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Faixa de Soma</p>
                        <p className="text-lg font-bold text-gray-900">
                          {monthlyStrategy.analysis.sumRange}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {monthlyStrategy.numbers.map(num => (
                        <span
                          key={num}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-bold",
                            selectedNumbers.includes(num) 
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-100 text-gray-700 border border-gray-300"
                          )}
                        >
                          {num.toString().padStart(2, '0')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Seletor de Números */}
        <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-gray-900 text-lg">
                {hasExcessNumbers 
                  ? `Selecionados: ${selectedNumbers.length} números` 
                  : 'Selecione seus números'}
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      hasExcessNumbers
                        ? "bg-gradient-to-r from-blue-500 to-blue-400"
                        : selectedNumbers.length >= 15
                        ? "bg-gradient-to-r from-green-500 to-green-400"
                        : "bg-gradient-to-r from-primary to-primary/80"
                    )}
                    style={{ 
                      width: `${Math.min(100, (selectedNumbers.length / 25) * 100)}%`
                    }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  hasExcessNumbers
                    ? "bg-blue-100 text-blue-700"
                    : selectedNumbers.length >= 15
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                )}>
                  {selectedNumbers.length}/25
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {hasExcessNumbers 
                ? `Simulação avançada com ${selectedNumbers.length} números`
                : 'Selecione de 15 a 25 números para simular'}
            </p>

            {/* Informações de combinações */}
            {hasExcessNumbers && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Calculator className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-800">
                      Modo de Simulação Avançada
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Com {selectedNumbers.length} números selecionados, há {combinationCount.toLocaleString()} combinações possíveis de 15 números.
                      O simulador analisará a melhor combinação em cada concurso.
                    </p>
                    {combinationCount > 1000 && (
                      <p className="text-xs text-yellow-600 mt-1">
                        ⚠️ A simulação pode levar alguns segundos devido ao grande número de combinações.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <NumberSelector
            selectedNumbers={selectedNumbers}
            onToggleNumber={handleToggleNumber}
            highlightExcess={hasExcessNumbers}
            excessStartIndex={15}
            maxSelections={25}
          />

          {/* Estatísticas Rápidas da Seleção */}
          {selectedNumbers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-900">
                  Análise da sua seleção:
                </p>
                <div className="flex items-center gap-2">
                  <Zap className={`h-3 w-3 ${selectionStats?.oddCount >= 8 ? 'text-green-500' : 'text-gray-400'}`} />
                  <Snowflake className={`h-3 w-3 ${selectionStats?.evenCount >= 7 ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Pares/Ímpares</p>
                  <p className="text-sm font-bold text-gray-900">
                    {selectionStats?.evenCount}/{selectionStats?.oddCount}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Soma Total</p>
                  <p className="text-sm font-bold text-gray-900">{selectionStats?.sum}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Média</p>
                  <p className="text-sm font-bold text-gray-900">{selectionStats?.average?.toFixed(1)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Primos</p>
                  <p className="text-sm font-bold text-gray-900">{selectionStats?.primeCount}</p>
                </div>
              </div>

              {/* Números Selecionados */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Seus números ({selectedNumbers.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNumbers.map((num, index) => (
                    <span
                      key={num}
                      className={cn(
                        "px-2.5 py-1 text-xs font-bold rounded-full shadow-sm",
                        index >= 15
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-700"
                          : "bg-gradient-to-r from-primary to-primary/90 text-white border border-primary/80"
                      )}
                    >
                      {num.toString().padStart(2, "0")}
                      {index >= 15 && (
                        <span className="ml-1 text-xs opacity-90">({index + 1})</span>
                      )}
                    </span>
                  ))}
                </div>
                {hasExcessNumbers && (
                  <p className="text-xs text-gray-500 mt-2">
                    * Números em azul são além do mínimo de 15, aumentando suas chances
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={handleSimulate}
              disabled={selectedNumbers.length < 15}
              className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {selectedNumbers.length >= 15 
                ? hasExcessNumbers 
                  ? `Simular ${combinationCount.toLocaleString()} combinações` 
                  : 'Simular Agora!'
                : `Selecione mais ${15 - selectedNumbers.length} números`}
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={selectedNumbers.length === 0}
              className="h-12 px-6 border-gray-300 hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          </div>
        </section>

        {/* Seção de Resultados */}
        {hasSimulated && (
          <section id="results-section" className="space-y-6 animate-slide-up">
            {/* Resumo de Combinações */}
            {hasExcessNumbers && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Calculator className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-blue-900">Simulação Avançada</h3>
                    <p className="text-sm text-blue-700">
                      Analisadas {combinationCount.toLocaleString()} combinações possíveis de 15 números
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">Números Selecionados</p>
                    <p className="text-lg font-bold text-blue-900">{selectedNumbers.length}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">Combinações Possíveis</p>
                    <p className="text-lg font-bold text-blue-900">{combinationCount.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg">
                    <p className="text-xs text-blue-600">Melhor Acerto</p>
                    <p className="text-lg font-bold text-blue-900">{results.bestMatch} números</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <StatsCard
                title="15 Acertos"
                value={results.match15.length}
                subtitle={hasExcessNumbers ? "Melhor combinação" : "Prêmio máximo"}
                variant="success"
                trend={results.match15.length > 0 ? "up" : "neutral"}
              />
              <StatsCard
                title="14 Acertos"
                value={results.match14.length}
                subtitle={hasExcessNumbers ? "Melhor combinação" : "Quadra"}
                variant="info"
                trend={results.match14.length > 2 ? "up" : results.match14.length > 0 ? "neutral" : "down"}
              />
              <StatsCard
                title="13 Acertos"
                value={results.match13.length}
                subtitle={hasExcessNumbers ? "Melhor combinação" : "Terno"}
                variant="warning"
                trend={results.match13.length > 5 ? "up" : results.match13.length > 2 ? "neutral" : "down"}
              />
            </div>

            {/* Resumo Geral */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 p-4 sm:p-5 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Em {lotofacilResults.length} concursos analisados
              </p>
              <div className="flex items-center justify-center gap-3 mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {totalWins} {totalWins === 1 ? "premiação" : "premiações"}
                </p>
                <Award className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${totalWins > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {((totalWins / lotofacilResults.length) * 100).toFixed(1)}% de aproveitamento
                </span>
                <span className="text-xs text-gray-500">
                  • Média: {(totalWins / lotofacilResults.length).toFixed(2)} por concurso
                </span>
              </div>
            </div>

            {/* Resultados Detalhados */}
            {totalWins > 0 ? (
              <div className="space-y-6">
                {/* 15 Acertos */}
                {results.match15.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
                        <Trophy className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">15 Acertos - Prêmio Máximo</h2>
                        <p className="text-xs text-gray-600">
                          {hasExcessNumbers 
                            ? "Pelo menos uma combinação acertaria 15 números!" 
                            : "Você acertaria o prêmio principal!"}
                        </p>
                      </div>
                      <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {results.match15.length} vez{results.match15.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {results.match15.map((result) => (
                        <ResultCard
                          key={result.concurso}
                          result={result}
                          selectedNumbers={selectedNumbers}
                          matchCount={15}
                          showAllCombinations={hasExcessNumbers}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 14 Acertos */}
                {results.match14.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                        <Award className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">14 Acertos - Quadra</h2>
                        <p className="text-xs text-gray-600">
                          {hasExcessNumbers ? "Excelente resultado em pelo menos uma combinação!" : "Excelente resultado!"}
                        </p>
                      </div>
                      <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {results.match14.length} vez{results.match14.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {results.match14.map((result) => (
                        <ResultCard
                          key={result.concurso}
                          result={result}
                          selectedNumbers={selectedNumbers}
                          matchCount={14}
                          showAllCombinations={hasExcessNumbers}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 13 Acertos */}
                {results.match13.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">13 Acertos - Terno</h2>
                        <p className="text-xs text-gray-600">
                          {hasExcessNumbers ? "Boa pontuação em pelo menos uma combinação!" : "Boa pontuação!"}
                        </p>
                      </div>
                      <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                        {results.match13.length} vez{results.match13.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {results.match13.map((result) => (
                        <ResultCard
                          key={result.concurso}
                          result={result}
                          selectedNumbers={selectedNumbers}
                          matchCount={13}
                          showAllCombinations={hasExcessNumbers}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Dica Baseada nos Resultados */}
                <div className="bg-gradient-to-r from-blue-50/50 to-blue-50/30 rounded-xl border border-blue-200 p-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-blue-900 text-sm mb-1">
                        {hasExcessNumbers ? "Análise de Combinações" : "Recomendação Baseada na Análise"}
                      </h3>
                      <p className="text-sm text-blue-700">
                        {hasExcessNumbers 
                          ? `Com ${selectedNumbers.length} números selecionados, você tem ${combinationCount.toLocaleString()} combinações possíveis. ${totalWins > 5 ? "Excelente cobertura!" : totalWins > 2 ? "Boa diversificação de números." : "Considere ajustar sua seleção para melhorar as chances."}`
                          : totalWins > 5 
                          ? "Excelente escolha! Esta combinação tem um histórico forte. Considere mantê-la para próximos concursos."
                          : totalWins > 2
                          ? "Boa combinação! Ajustes pequenos podem melhorar seu desempenho."
                          : "Experimente uma das estratégias inteligentes acima para melhorar suas chances."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Mensagem quando não há acertos */
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-300 p-6 sm:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Nenhuma premiação encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  {hasExcessNumbers 
                    ? `Nenhuma das ${combinationCount.toLocaleString()} combinações possíveis teve acertos nos últimos ${lotofacilResults.length} concursos.`
                    : `Esta combinação não teve acertos nos últimos ${lotofacilResults.length} concursos.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => {
                      setShowStrategies(true);
                      setTimeout(() => {
                        document.querySelector('.bg-gradient-to-r')?.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start' 
                        });
                      }, 100);
                    }}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Usar Estratégia IA
                  </Button>
                  <Button
                    onClick={handleClear}
                    className="bg-gradient-to-r from-primary to-primary/90"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Nova Combinação
                  </Button>
                </div>
              </div>
            )}

            {/* Análise Comparativa */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3">Análise Comparativa</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Média de Acertos</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(totalWins / lotofacilResults.length).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">por concurso</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Melhor Desempenho</p>
                  <p className="text-lg font-bold text-gray-900">
                    {results.bestMatch} acertos
                  </p>
                  <p className="text-xs text-gray-500">máximo alcançado</p>
                </div>
              </div>
              {hasExcessNumbers && results.bestCombination && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Melhor combinação encontrada:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {results.bestCombination.numbers.map(num => (
                      <span
                        key={num}
                        className="px-2 py-1 bg-gradient-to-r from-primary to-primary/90 text-white text-xs font-bold rounded-full"
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Esta combinação teve {results.bestCombination.match15Count} acertos de 15, 
                    {results.bestCombination.match14Count} de 14 e {results.bestCombination.match13Count} de 13.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Dica Final */}
        {!hasSimulated && selectedNumbers.length === 0 && (
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20 p-4 text-center">
            <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
            <h3 className="font-bold text-gray-900 mb-1">Como começar</h3>
            <p className="text-sm text-gray-600">
              Selecione de 15 a 25 números. Quanto mais números, mais combinações serão analisadas!
            </p>
          </div>
        )}
      </main>

      {/* Footer Mobile */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-gray-900">Simulador Lotofácil Pro</p>
            </div>
            <p className="text-xs text-gray-600">
              Análise estatística avançada com IA • {lotofacilResults.length} concursos analisados
            </p>
            <p className="text-xs text-gray-500">
              Para fins educacionais. Resultados passados não garantem resultados futuros.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante para Mobile */}
      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <Button
            onClick={() => {
              const selector = document.querySelector('.bg-white.rounded-2xl');
              selector?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={cn(
              "rounded-full w-14 h-14 shadow-lg",
              hasExcessNumbers
                ? "bg-gradient-to-br from-blue-500 to-blue-600"
                : selectedNumbers.length >= 15
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-primary to-primary/90"
            )}
          >
            <span className="text-lg font-bold">
              {selectedNumbers.length}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Index;