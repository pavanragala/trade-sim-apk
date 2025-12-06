import { TrendingUp, TrendingDown } from 'lucide-react';
import { Stock } from '@/types/trading';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
}

export const StockCard = ({ stock, onClick }: StockCardProps) => {
  const isPositive = stock.change >= 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
          {stock.symbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold">{stock.symbol}</h3>
          <p className="text-sm text-muted-foreground truncate max-w-[120px]">{stock.name}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">${stock.price.toFixed(2)}</p>
        <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-gain' : 'text-loss'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};
