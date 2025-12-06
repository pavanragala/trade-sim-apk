import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StockCard } from './StockCard';
import { Stock } from '@/types/trading';

interface MarketsViewProps {
  stocks: Stock[];
  onStockSelect: (stock: Stock) => void;
}

export const MarketsView = ({ stocks, onStockSelect }: MarketsViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 fade-in">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border h-12 rounded-xl"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-success pulse-dot" />
        <span className="text-sm text-muted-foreground">Markets Open • Live Prices</span>
      </div>

      <div className="space-y-2">
        {filteredStocks.map(stock => (
          <StockCard
            key={stock.symbol}
            stock={stock}
            onClick={() => onStockSelect(stock)}
          />
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No stocks found</p>
        </div>
      )}
    </div>
  );
};
