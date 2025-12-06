import { PortfolioHeader } from './PortfolioHeader';
import { PositionCard } from './PositionCard';
import { StockCard } from './StockCard';
import { Portfolio, Stock } from '@/types/trading';

interface HomeViewProps {
  portfolio: Portfolio;
  stocks: Stock[];
  onReset: () => void;
  onStockSelect: (stock: Stock) => void;
}

export const HomeView = ({ portfolio, stocks, onReset, onStockSelect }: HomeViewProps) => {
  const topMovers = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 4);

  return (
    <div className="space-y-6 fade-in">
      <PortfolioHeader portfolio={portfolio} onReset={onReset} />

      {portfolio.positions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Your Holdings</h2>
            <span className="text-sm text-muted-foreground">{portfolio.positions.length} stocks</span>
          </div>
          <div className="space-y-2">
            {portfolio.positions.slice(0, 3).map(position => {
              const stock = stocks.find(s => s.symbol === position.symbol);
              if (!stock) return null;
              return (
                <PositionCard
                  key={position.symbol}
                  position={position}
                  onClick={() => onStockSelect(stock)}
                />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Top Movers</h2>
        <div className="space-y-2">
          {topMovers.map(stock => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onClick={() => onStockSelect(stock)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
