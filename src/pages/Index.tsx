import { useState } from 'react';
import { useOptionsData } from '@/hooks/useOptionsData';
import { BottomNav } from '@/components/trading/BottomNav';
import { IndexSelector } from '@/components/options/IndexSelector';
import { SpotPriceCard } from '@/components/options/SpotPriceCard';
import { OptionChainTable } from '@/components/options/OptionChainTable';
import { OptionTradeModal } from '@/components/options/OptionTradeModal';
import { OptionsPortfolioCard } from '@/components/options/OptionsPortfolioCard';
import { PositionsList } from '@/components/options/PositionsList';
import { OptionsTradeHistory } from '@/components/options/OptionsTradeHistory';
import { OptionStrike, OptionPosition } from '@/types/options';

type Tab = 'home' | 'markets' | 'portfolio' | 'history';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedOption, setSelectedOption] = useState<{ strike: OptionStrike; type: 'CE' | 'PE' } | null>(null);
  
  const {
    selectedIndex,
    setSelectedIndex,
    optionChain,
    loading,
    error,
    portfolio,
    executeTrade,
    resetPortfolio,
    lastUpdate,
    refreshData,
    totalPositionsValue,
    totalPnL,
  } = useOptionsData();

  const handleSelectOption = (strike: OptionStrike, type: 'CE' | 'PE') => {
    setSelectedOption({ strike, type });
  };

  const handlePositionSelect = (position: OptionPosition) => {
    if (!optionChain) return;
    const strike = optionChain.options.find(o => o.strikePrice === position.strikePrice);
    if (strike) {
      setSelectedOption({ strike, type: position.optionType });
    }
  };

  const currentPosition = selectedOption
    ? portfolio.positions.find(
        p => p.symbol === selectedIndex &&
             p.strikePrice === selectedOption.strike.strikePrice &&
             p.optionType === selectedOption.type
      )
    : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">
            {activeTab === 'home' && 'Options Trading'}
            {activeTab === 'markets' && 'Option Chain'}
            {activeTab === 'portfolio' && 'Portfolio'}
            {activeTab === 'history' && 'History'}
          </h1>
          {error && (
            <span className="text-xs text-warning bg-warning/10 px-2 py-1 rounded">Demo Mode</span>
          )}
        </div>
        {(activeTab === 'home' || activeTab === 'markets') && (
          <IndexSelector selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        )}
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24 max-w-4xl mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-6 fade-in">
            <OptionsPortfolioCard
              cashBalance={portfolio.cashBalance}
              totalPositionsValue={totalPositionsValue}
              totalPnL={totalPnL}
              onReset={resetPortfolio}
            />
            
            <SpotPriceCard
              data={optionChain}
              loading={loading}
              lastUpdate={lastUpdate}
              onRefresh={refreshData}
            />

            {portfolio.positions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Open Positions</h2>
                <PositionsList
                  positions={portfolio.positions}
                  onSelect={handlePositionSelect}
                />
              </section>
            )}

            {optionChain && (
              <section>
                <h2 className="text-lg font-semibold mb-3">Option Chain</h2>
                <OptionChainTable
                  data={optionChain}
                  onSelectOption={handleSelectOption}
                />
              </section>
            )}
          </div>
        )}

        {activeTab === 'markets' && (
          <div className="space-y-4 fade-in">
            <SpotPriceCard
              data={optionChain}
              loading={loading}
              lastUpdate={lastUpdate}
              onRefresh={refreshData}
            />
            
            {optionChain && (
              <OptionChainTable
                data={optionChain}
                onSelectOption={handleSelectOption}
              />
            )}

            {loading && !optionChain && (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading option chain...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6 fade-in">
            <OptionsPortfolioCard
              cashBalance={portfolio.cashBalance}
              totalPositionsValue={totalPositionsValue}
              totalPnL={totalPnL}
              onReset={resetPortfolio}
            />

            <section>
              <h2 className="text-lg font-semibold mb-3">Open Positions</h2>
              <PositionsList
                positions={portfolio.positions}
                onSelect={handlePositionSelect}
              />
            </section>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 fade-in">
            <h1 className="text-2xl font-bold">Trade History</h1>
            <OptionsTradeHistory trades={portfolio.trades} />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Trade Modal */}
      {selectedOption && optionChain && (
        <OptionTradeModal
          strike={selectedOption.strike}
          optionType={selectedOption.type}
          symbol={selectedIndex}
          cashBalance={portfolio.cashBalance}
          currentPosition={currentPosition}
          onClose={() => setSelectedOption(null)}
          onTrade={executeTrade}
        />
      )}
    </div>
  );
};

export default Index;
