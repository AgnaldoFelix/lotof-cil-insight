import { useState, useMemo } from "react";
import { NumberSelector } from "@/components/NumberSelector";
import { ResultCard } from "@/components/ResultCard";
import { StatsCard } from "@/components/StatsCard";
import { lotofacilResults, calculateMatches } from "@/data/lotofacilResults";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, TrendingUp } from "lucide-react";

const Index = () => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [hasSimulated, setHasSimulated] = useState(false);

  const handleToggleNumber = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num)
        ? prev.filter((n) => n !== num)
        : prev.length < 15
        ? [...prev, num].sort((a, b) => a - b)
        : prev
    );
    setHasSimulated(false);
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setHasSimulated(false);
  };

  const handleSimulate = () => {
    if (selectedNumbers.length === 15) {
      setHasSimulated(true);
    }
  };

  const results = useMemo(() => {
    if (!hasSimulated || selectedNumbers.length !== 15) {
      return { match15: [], match14: [], match13: [] };
    }

    const analyzed = lotofacilResults.map((result) => ({
      ...result,
      matchCount: calculateMatches(selectedNumbers, result.dezenas),
    }));

    return {
      match15: analyzed.filter((r) => r.matchCount === 15),
      match14: analyzed.filter((r) => r.matchCount === 14),
      match13: analyzed.filter((r) => r.matchCount === 13),
    };
  }, [selectedNumbers, hasSimulated]);

  const totalWins = results.match15.length + results.match14.length + results.match13.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Simulador Lotofácil
              </h1>
              <p className="text-sm text-muted-foreground">
                Teste seus números em {lotofacilResults.length} concursos anteriores
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-8 space-y-8">
        {/* Number Selector Card */}
        <section className="bg-card rounded-2xl border border-border p-6 shadow-soft animate-fade-in">
          <NumberSelector
            selectedNumbers={selectedNumbers}
            onToggleNumber={handleToggleNumber}
          />

          {/* Selected Numbers Display */}
          {selectedNumbers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border animate-fade-in">
              <p className="text-sm text-muted-foreground mb-3">Seus números:</p>
              <div className="flex flex-wrap gap-2">
                {selectedNumbers.map((num) => (
                  <span
                    key={num}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium"
                  >
                    {num.toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSimulate}
              disabled={selectedNumbers.length !== 15}
              className="flex-1 h-12 text-base font-medium"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Simular Apostas
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={selectedNumbers.length === 0}
              className="h-12 px-4"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Results Section */}
        {hasSimulated && (
          <section className="space-y-6 animate-slide-up">
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              <StatsCard
                title="15 Acertos"
                value={results.match15.length}
                subtitle="Prêmio máximo"
                variant="success"
              />
              <StatsCard
                title="14 Acertos"
                value={results.match14.length}
                subtitle="Quadra"
                variant="info"
              />
              <StatsCard
                title="13 Acertos"
                value={results.match13.length}
                subtitle="Terno"
                variant="warning"
              />
            </div>

            {/* Summary */}
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <p className="text-muted-foreground">
                Em {lotofacilResults.length} concursos analisados, você teria
              </p>
              <p className="text-2xl font-serif font-bold text-primary mt-1">
                {totalWins} {totalWins === 1 ? "premiação" : "premiações"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ({((totalWins / lotofacilResults.length) * 100).toFixed(1)}% de aproveitamento)
              </p>
            </div>

            {/* 15 Matches */}
            {results.match15.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  15 Acertos - Prêmio Máximo
                </h2>
                <div className="space-y-3">
                  {results.match15.map((result) => (
                    <ResultCard
                      key={result.concurso}
                      result={result}
                      selectedNumbers={selectedNumbers}
                      matchCount={15}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 14 Matches */}
            {results.match14.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-ball-match14" />
                  14 Acertos - Quadra
                </h2>
                <div className="space-y-3">
                  {results.match14.map((result) => (
                    <ResultCard
                      key={result.concurso}
                      result={result}
                      selectedNumbers={selectedNumbers}
                      matchCount={14}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 13 Matches */}
            {results.match13.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif text-xl font-semibold text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-ball-match13" />
                  13 Acertos - Terno
                </h2>
                <div className="space-y-3">
                  {results.match13.map((result) => (
                    <ResultCard
                      key={result.concurso}
                      result={result}
                      selectedNumbers={selectedNumbers}
                      matchCount={13}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No wins message */}
            {totalWins === 0 && (
              <div className="bg-muted rounded-xl p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhuma premiação encontrada com esses números nos últimos {lotofacilResults.length} concursos.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente outra combinação!
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container max-w-4xl py-6">
          <p className="text-sm text-muted-foreground text-center">
            Simulador para fins educacionais. Os resultados passados não garantem resultados futuros.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
