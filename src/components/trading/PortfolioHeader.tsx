import { TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Portfolio } from '@/types/trading';

interface PortfolioHeaderProps {
  portfolio: Portfolio;
  onReset: () => void;
}

export const PortfolioHeader = ({ portfolio, onReset }: PortfolioHeaderProps) => {
  const initialValue = 100000;
  const totalGain = portfolio.totalValue - initialValue;
  const gainPercent = ((totalGain / initialValue) * 100);
  const isPositive = totalGain >= 0;

  return (
    <div className="card-gradient rounded-xl p-5 fade-in">
      <div className="flex items-center justify-between mb-1">
        <span className="text-muted-foreground text-sm font-medium">Total Portfolio</span>
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
          ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${
          isPositive ? 'bg-success/10 text-gain' : 'bg-destructive/10 text-loss'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
        </div>
      </div>

      <p className={`mt-1 text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
        {isPositive ? '+' : ''}${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} all time
      </p>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Buying Power</span>
          <span className="font-semibold">${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
};
