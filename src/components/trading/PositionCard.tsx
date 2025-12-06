import { TrendingUp, TrendingDown } from 'lucide-react';
import { Position } from '@/types/trading';

interface PositionCardProps {
  position: Position;
  onClick: () => void;
}

export const PositionCard = ({ position, onClick }: PositionCardProps) => {
  const isPositive = position.totalGain >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          isPositive ? 'bg-success/10 text-gain' : 'bg-destructive/10 text-loss'
        }`}>
          {position.symbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold">{position.symbol}</h3>
          <p className="text-sm text-muted-foreground">{position.shares} shares</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">${position.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{position.gainPercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};
