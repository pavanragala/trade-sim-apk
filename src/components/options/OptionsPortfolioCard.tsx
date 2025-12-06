import { TrendingUp, TrendingDown, Wallet, BarChart3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OptionsPortfolioCardProps {
  cashBalance: number;
  totalPositionsValue: number;
  totalPnL: number;
  onReset: () => void;
}

export const OptionsPortfolioCard = ({
  cashBalance,
  totalPositionsValue,
  totalPnL,
  onReset,
}: OptionsPortfolioCardProps) => {
  const totalValue = cashBalance + totalPositionsValue;
  const initialValue = 500000;
  const overallPnL = totalValue - initialValue;
  const overallPnLPercent = (overallPnL / initialValue) * 100;
  const isPositive = overallPnL >= 0;

  return (
    <div className="card-gradient rounded-xl p-5 fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground text-sm font-medium">Portfolio Value</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
          isPositive ? 'bg-success/10 text-gain' : 'bg-destructive/10 text-loss'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{overallPnLPercent.toFixed(2)}%
        </div>
      </div>

      <p className={`mt-1 text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
        {isPositive ? '+' : ''}₹{overallPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })} overall
      </p>

      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Cash</p>
            <p className="font-semibold">₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Positions</p>
            <p className="font-semibold">₹{totalPositionsValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {totalPnL !== 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Open P&L</span>
            <span className={`font-semibold ${totalPnL >= 0 ? 'text-gain' : 'text-loss'}`}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
