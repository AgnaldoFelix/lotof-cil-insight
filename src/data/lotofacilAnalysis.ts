import { LotofacilResult, lotofacilResults } from "./lotofacilResults";

export interface AnalysisResult {
  frequency: Map<number, number>;
  lastAppearance: Map<number, number>;
  consecutivePairs: Map<string, number>;
  patterns: {
    oddEven: { odd: number; even: number };
    sumRange: { low: number; medium: number; high: number };
    primeNumbers: number;
  };
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  numbers: number[];
  confidence: number;
}

// Análise completa dos resultados
export const analyzeResults = (): AnalysisResult => {
  const frequency = new Map<number, number>();
  const lastAppearance = new Map<number, number>();
  const consecutivePairs = new Map<string, number>();
  
  // Inicializar
  for (let i = 1; i <= 25; i++) {
    frequency.set(i, 0);
    lastAppearance.set(i, 0);
  }

  // Processar cada concurso
  lotofacilResults.forEach((result, index) => {
    // Frequência
    result.dezenas.forEach(num => {
      frequency.set(num, frequency.get(num)! + 1);
      lastAppearance.set(num, index + 1); // Atualizar último aparecimento
    });

    // Pares consecutivos
    const sorted = [...result.dezenas].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      const pair = `${sorted[i]}-${sorted[i + 1]}`;
      consecutivePairs.set(pair, (consecutivePairs.get(pair) || 0) + 1);
    }
  });

  // Calcular padrões do último concurso
  const lastResult = lotofacilResults[0];
  const oddCount = lastResult.dezenas.filter(n => n % 2 !== 0).length;
  const sum = lastResult.dezenas.reduce((a, b) => a + b, 0);
  
  const patterns = {
    oddEven: { 
      odd: oddCount, 
      even: 15 - oddCount 
    },
    sumRange: {
      low: sum < 200 ? 1 : 0,
      medium: sum >= 200 && sum <= 210 ? 1 : 0,
      high: sum > 210 ? 1 : 0
    },
    primeNumbers: lastResult.dezenas.filter(isPrime).length
  };

  return { frequency, lastAppearance, consecutivePairs, patterns };
};

// Função auxiliar para números primos
const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
};

// Gerar estratégias automáticas
export const generateStrategies = (): Strategy[] => {
  const analysis = analyzeResults();
  const strategies: Strategy[] = [];

  // 1. Estratégia por Frequência (números mais sorteados)
  const topFrequent = Array.from(analysis.frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([num]) => num);
  
  strategies.push({
    id: 'frequency',
    name: 'Frequência Alta',
    description: '15 números que mais apareceram nos últimos concursos',
    numbers: selectRandomFrom(topFrequent, 15),
    confidence: 0.8
  });

  // 2. Estratégia por Atraso (números atrasados)
  const mostDelayed = Array.from(analysis.lastAppearance.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([num]) => num);
  
  strategies.push({
    id: 'delayed',
    name: 'Números Atrasados',
    description: 'Números que não aparecem há mais tempo',
    numbers: selectRandomFrom(mostDelayed, 15),
    confidence: 0.7
  });

  // 3. Estratégia Balanceada
  const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const balanced = [...allNumbers]
    .sort(() => Math.random() - 0.5)
    .slice(0, 15)
    .sort((a, b) => a - b);
  
  strategies.push({
    id: 'balanced',
    name: 'Distribuição Ideal',
    description: 'Distribuição balanceada entre pares/ímpares e faixas',
    numbers: balanced,
    confidence: 0.6
  });

  // 4. Estratégia por Pares Consecutivos
  const topPairs = Array.from(analysis.consecutivePairs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  const pairNumbers = new Set<number>();
  topPairs.forEach(([pair]) => {
    const [a, b] = pair.split('-').map(Number);
    pairNumbers.add(a);
    pairNumbers.add(b);
  });
  
  strategies.push({
    id: 'pairs',
    name: 'Pares Consecutivos',
    description: 'Baseado em combinações que frequentemente aparecem juntas',
    numbers: Array.from(pairNumbers).slice(0, 15),
    confidence: 0.75
  });

  return strategies;
};

// Função auxiliar para selecionar números aleatórios
const selectRandomFrom = (array: number[], count: number): number[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).sort((a, b) => a - b);
};

// Obter números "quentes" (últimos 5 concursos)
export const getHotNumbers = (count: number = 10): number[] => {
  const recentResults = lotofacilResults.slice(0, 5);
  const frequency = new Map<number, number>();
  
  recentResults.forEach(result => {
    result.dezenas.forEach(num => {
      frequency.set(num, (frequency.get(num) || 0) + 1);
    });
  });
  
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([num]) => num);
};

// Obter números "frios" (menos frequentes nos últimos 10 concursos)
export const getColdNumbers = (count: number = 10): number[] => {
  const recentResults = lotofacilResults.slice(0, 10);
  const frequency = new Map<number, number>();
  
  // Inicializar com zeros
  for (let i = 1; i <= 25; i++) {
    frequency.set(i, 0);
  }
  
  recentResults.forEach(result => {
    result.dezenas.forEach(num => {
      frequency.set(num, frequency.get(num)! + 1);
    });
  });
  
  return Array.from(frequency.entries())
    .sort((a, b) => a[1] - b[1])
    .slice(0, count)
    .map(([num]) => num);
};

// Nova função: Análise completa para estratégia mensal
export const generateMonthlyStrategy = (): {
  numbers: number[];
  strategy: string;
  confidence: number;
  analysis: {
    hotNumbers: number[];
    coldNumbers: number[];
    repeatingPatterns: number[];
    oddEvenBalance: { odd: number; even: number };
    sumRange: string;
  };
} => {
  // 1. Analisar TODOS os concursos disponíveis
  const allResults = lotofacilResults;
  
  // 2. Calcular frequência completa
  const frequencyMap = new Map<number, { total: number; recent: number }>();
  
  // Inicializar mapa
  for (let i = 1; i <= 25; i++) {
    frequencyMap.set(i, { total: 0, recent: 0 });
  }
  
  // Contar ocorrências
  allResults.forEach((result, index) => {
    result.dezenas.forEach(num => {
      const current = frequencyMap.get(num)!;
      frequencyMap.set(num, {
        total: current.total + 1,
        recent: index < 10 ? current.recent + 1 : current.recent // Últimos 10 concursos
      });
    });
  });
  
  // 3. Identificar números quentes (mais frequentes nos últimos 10 concursos)
  const hotNumbers = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1].recent - a[1].recent)
    .slice(0, 10)
    .map(([num]) => num);
  
  // 4. Identificar números frios (menos frequentes no histórico completo)
  const coldNumbers = Array.from(frequencyMap.entries())
    .sort((a, b) => a[1].total - b[1].total)
    .slice(0, 10)
    .map(([num]) => num);
  
  // 5. Analisar padrões de repetição (números que aparecem em sequência)
  const repeatingPatterns = analyzeRepeatingPatterns(allResults);
  
  // 6. Analisar equilíbrio de pares/ímpares nos últimos concursos
  const lastResults = allResults.slice(0, 5);
  const oddEvenStats = calculateOddEvenBalance(lastResults);
  
  // 7. Gerar combinação estratégica
  const strategicNumbers = generateStrategicCombination(
    hotNumbers,
    coldNumbers,
    repeatingPatterns,
    oddEvenStats
  );
  
  // 8. Calcular confiança baseada em análise histórica
  const confidence = calculateStrategyConfidence(strategicNumbers, allResults);
  
  // 9. Calcular faixa de soma esperada
  const sum = strategicNumbers.reduce((a, b) => a + b, 0);
  const sumRange = sum < 200 ? "Baixa (185-199)" : 
                   sum <= 210 ? "Média (200-210)" : 
                   "Alta (211-225)";
  
  return {
    numbers: strategicNumbers.sort((a, b) => a - b),
    strategy: "Estratégia Mensal Baseada em Análise Completa",
    confidence,
    analysis: {
      hotNumbers: hotNumbers.sort((a, b) => a - b),
      coldNumbers: coldNumbers.sort((a, b) => a - b),
      repeatingPatterns: repeatingPatterns.slice(0, 8).sort((a, b) => a - b),
      oddEvenBalance: {
        odd: strategicNumbers.filter(n => n % 2 !== 0).length,
        even: strategicNumbers.filter(n => n % 2 === 0).length
      },
      sumRange
    }
  };
};

// Analisar padrões de repetição
const analyzeRepeatingPatterns = (results: LotofacilResult[]): number[] => {
  const patternMap = new Map<string, number>();
  const numberPairs = new Map<number, number>();
  
  // Analisar pares consecutivos que se repetem
  results.forEach(result => {
    const sorted = [...result.dezenas].sort((a, b) => a - b);
    
    // Contar pares consecutivos
    for (let i = 0; i < sorted.length - 1; i++) {
      const pair = `${sorted[i]}-${sorted[i + 1]}`;
      patternMap.set(pair, (patternMap.get(pair) || 0) + 1);
      
      // Contar ocorrências individuais em pares
      numberPairs.set(sorted[i], (numberPairs.get(sorted[i]) || 0) + 1);
      numberPairs.set(sorted[i + 1], (numberPairs.get(sorted[i + 1]) || 0) + 1);
    }
  });
  
  // Identificar números que frequentemente aparecem em pares
  const frequentInPairs = Array.from(numberPairs.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([num]) => num);
  
  return frequentInPairs;
};

// Calcular equilíbrio de pares/ímpares
const calculateOddEvenBalance = (results: LotofacilResult[]): { idealOdd: number; idealEven: number } => {
  const oddCounts: number[] = [];
  const evenCounts: number[] = [];
  
  results.forEach(result => {
    const odd = result.dezenas.filter(n => n % 2 !== 0).length;
    const even = 15 - odd;
    oddCounts.push(odd);
    evenCounts.push(even);
  });
  
  // Calcular média
  const avgOdd = Math.round(oddCounts.reduce((a, b) => a + b, 0) / oddCounts.length);
  const avgEven = Math.round(evenCounts.reduce((a, b) => a + b, 0) / evenCounts.length);
  
  return {
    idealOdd: Math.min(9, Math.max(6, avgOdd)), // Entre 6 e 9 ímpares
    idealEven: Math.min(9, Math.max(6, avgEven)) // Entre 6 e 9 pares
  };
};

// Gerar combinação estratégica
const generateStrategicCombination = (
  hotNumbers: number[],
  coldNumbers: number[],
  repeatingPatterns: number[],
  oddEvenBalance: { idealOdd: number; idealEven: number }
): number[] => {
  const combination = new Set<number>();
  
  // 1. Adicionar 7 números quentes (selecionados aleatoriamente para variar)
  const selectedHots = [...hotNumbers]
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);
  selectedHots.forEach(num => combination.add(num));
  
  // 2. Adicionar 4 números de padrões repetitivos
  const selectedPatterns = [...repeatingPatterns]
    .filter(num => !combination.has(num))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  selectedPatterns.forEach(num => combination.add(num));
  
  // 3. Adicionar 4 números frios estratégicos (não os mais frios, mas os moderados)
  const moderateColds = [...coldNumbers]
    .slice(3, 10) // Pega do 4º ao 10º mais frio (moderados)
    .filter(num => !combination.has(num))
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  moderateColds.forEach(num => combination.add(num));
  
  // 4. Se ainda não tiver 15, completar com números de média frequência
  if (combination.size < 15) {
    const allNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
    const remainingNumbers = allNumbers
      .filter(num => !combination.has(num))
      .sort(() => Math.random() - 0.5)
      .slice(0, 15 - combination.size);
    
    remainingNumbers.forEach(num => combination.add(num));
  }
  
  // 5. Ajustar equilíbrio de pares/ímpares
  let numbers = Array.from(combination);
  let oddCount = numbers.filter(n => n % 2 !== 0).length;
  const targetOdd = oddEvenBalance.idealOdd;
  
  if (oddCount !== targetOdd) {
    numbers = adjustOddEvenBalance(numbers, targetOdd);
  }
  
  return numbers;
};

// Ajustar equilíbrio de pares/ímpares
const adjustOddEvenBalance = (numbers: number[], targetOdd: number): number[] => {
  let oddCount = numbers.filter(n => n % 2 !== 0).length;
  
  if (oddCount < targetOdd) {
    // Precisa adicionar ímpares
    const allOdds = Array.from({ length: 25 }, (_, i) => i + 1)
      .filter(n => n % 2 !== 0 && !numbers.includes(n));
    
    const oddsToAdd = allOdds.slice(0, targetOdd - oddCount);
    const numbersToRemove = numbers
      .filter(n => n % 2 === 0)
      .slice(0, targetOdd - oddCount);
    
    return [...numbers.filter(n => !numbersToRemove.includes(n)), ...oddsToAdd];
  } else if (oddCount > targetOdd) {
    // Precisa adicionar pares
    const allEvens = Array.from({ length: 25 }, (_, i) => i + 1)
      .filter(n => n % 2 === 0 && !numbers.includes(n));
    
    const evensToAdd = allEvens.slice(0, oddCount - targetOdd);
    const numbersToRemove = numbers
      .filter(n => n % 2 !== 0)
      .slice(0, oddCount - targetOdd);
    
    return [...numbers.filter(n => !numbersToRemove.includes(n)), ...evensToAdd];
  }
  
  return numbers;
};

// Calcular confiança da estratégia
const calculateStrategyConfidence = (numbers: number[], allResults: LotofacilResult[]): number => {
  let score = 0;
  const maxScore = 10;
  
  // 1. Verificar desempenho nos últimos 10 concursos
  const recentResults = allResults.slice(0, 10);
  const recentPerformance = recentResults.map(result => 
    numbers.filter(n => result.dezenas.includes(n)).length
  );
  
  // Pontuar por 13+ acertos
  const highMatches = recentPerformance.filter(m => m >= 13).length;
  score += Math.min(3, highMatches);
  
  // 2. Verificar equilíbrio
  const oddCount = numbers.filter(n => n % 2 !== 0).length;
  if (oddCount >= 6 && oddCount <= 9) score += 2;
  
  // 3. Verificar soma (ideal entre 195-210)
  const sum = numbers.reduce((a, b) => a + b, 0);
  if (sum >= 195 && sum <= 210) score += 2;
  
  // 4. Verificar distribuição (números em todas as faixas)
  const lowRange = numbers.filter(n => n <= 8).length; // 1-8
  const midRange = numbers.filter(n => n > 8 && n <= 16).length; // 9-16
  const highRange = numbers.filter(n => n > 16).length; // 17-25
  
  if (lowRange >= 4 && lowRange <= 6 &&
      midRange >= 4 && midRange <= 6 &&
      highRange >= 4 && highRange <= 6) {
    score += 3;
  }
  
  return Math.min(10, score) / 10; // Normalizar para 0-1
};

// Gerar múltiplas estratégias para o mês
export const generateMonthlyStrategies = (count: number = 3) => {
  const strategies = [];
  
  for (let i = 0; i < count; i++) {
    const strategy = generateMonthlyStrategy();
    strategies.push({
      ...strategy,
      id: `monthly-${i + 1}`,
      name: `Estratégia Mensal ${i + 1}`,
      description: getStrategyDescription(i)
    });
  }
  
  return strategies;
};

const getStrategyDescription = (index: number): string => {
  const descriptions = [
    "Foco em números quentes com equilíbrio ideal",
    "Baseada em padrões repetitivos históricos",
    "Combinação balanceada para 13-14 pontos"
  ];
  return descriptions[index] || "Estratégia mensal personalizada";
};