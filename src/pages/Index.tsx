import { useState } from 'react';
import { useTradingData } from '@/hooks/useTradingData';
import { BottomNav } from '@/components/trading/BottomNav';
import { HomeView } from '@/components/trading/HomeView';
import { MarketsView } from '@/components/trading/MarketsView';
import { PortfolioView } from '@/components/trading/PortfolioView';
import { HistoryView } from '@/components/trading/HistoryView';
import { TradeModal } from '@/components/trading/TradeModal';
import { Stock } from '@/types/trading';

type Tab = 'home' | 'markets' | 'portfolio' | 'history';

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const { stocks, portfolio, executeTrade, resetPortfolio } = useTradingData();

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
  };

  const handleCloseModal = () => {
    setSelectedStock(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="text-xl font-bold">
          {activeTab === 'home' && 'PaperTrade'}
          {activeTab === 'markets' && 'Markets'}
          {activeTab === 'portfolio' && 'Portfolio'}
          {activeTab === 'history' && 'History'}
        </h1>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24 max-w-lg mx-auto">
        {activeTab === 'home' && (
          <HomeView
            portfolio={portfolio}
            stocks={stocks}
            onReset={resetPortfolio}
            onStockSelect={handleStockSelect}
          />
        )}
        {activeTab === 'markets' && (
          <MarketsView
            stocks={stocks}
            onStockSelect={handleStockSelect}
          />
        )}
        {activeTab === 'portfolio' && (
          <PortfolioView
            portfolio={portfolio}
            stocks={stocks}
            onStockSelect={handleStockSelect}
          />
        )}
        {activeTab === 'history' && (
          <HistoryView transactions={portfolio.transactions} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          portfolio={portfolio}
          onClose={handleCloseModal}
          onTrade={executeTrade}
        />
      )}
    </div>
  );
};

export default Index;
