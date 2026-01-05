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

