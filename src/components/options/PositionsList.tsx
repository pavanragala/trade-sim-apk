import { TrendingUp, TrendingDown } from 'lucide-react';
import { OptionPosition } from '@/types/options';

interface PositionsListProps {
  positions: OptionPosition[];
  onSelect: (position: OptionPosition) => void;
}

export const PositionsList = ({ positions, onSelect }: PositionsListProps) => {
  if (positions.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl">
        <p className="text-muted-foreground mb-2">No open positions</p>
        <p className="text-sm text-muted-foreground">Trade options to see your positions here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {positions.map(position => {
        const isPositive = position.pnl >= 0;
        
        return (
          <div
            key={position.id}
            onClick={() => onSelect(position)}
            className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                position.optionType === 'CE' 
                  ? 'bg-success/10 text-gain' 
                  : 'bg-destructive/10 text-loss'
              }`}>
                {position.optionType}
              </div>
              <div>
                <h3 className="font-semibold">
                  {position.symbol} {position.strikePrice} {position.optionType}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {position.quantity} lot{position.quantity > 1 ? 's' : ''} • Avg ₹{position.avgPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold">
                ₹{(position.quantity * position.lotSize * position.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{position.pnlPercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
