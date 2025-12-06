import { Wallet, TrendingUp } from 'lucide-react';
import { PositionCard } from './PositionCard';
import { Portfolio, Stock } from '@/types/trading';

interface PortfolioViewProps {
  portfolio: Portfolio;
  stocks: Stock[];
  onStockSelect: (stock: Stock) => void;
}

export const PortfolioView = ({ portfolio, stocks, onStockSelect }: PortfolioViewProps) => {
  const positionsValue = portfolio.positions.reduce((sum, pos) => sum + pos.totalValue, 0);
  const totalGain = portfolio.positions.reduce((sum, pos) => sum + pos.totalGain, 0);
  const isPositive = totalGain >= 0;

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div className="card-gradient rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Cash</span>
          </div>
          <p className="text-xl font-bold">
            ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="card-gradient rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Invested</span>
          </div>
          <p className="text-xl font-bold">
            ${positionsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {portfolio.positions.length > 0 && (
        <div className="card-gradient rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Returns</p>
          <p className={`text-2xl font-bold ${isPositive ? 'text-gain' : 'text-loss'}`}>
            {isPositive ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">Holdings</h2>
        {portfolio.positions.length > 0 ? (
          <div className="space-y-2">
            {portfolio.positions.map(position => {
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
        ) : (
          <div className="text-center py-12 bg-card rounded-xl">
            <p className="text-muted-foreground mb-2">No holdings yet</p>
            <p className="text-sm text-muted-foreground">Buy your first stock to get started</p>
          </div>
        )}
      </section>
    </div>
  );
};
