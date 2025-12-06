import { useState } from 'react';
import { X, Minus, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Stock, Portfolio } from '@/types/trading';

interface TradeModalProps {
  stock: Stock;
  portfolio: Portfolio;
  onClose: () => void;
  onTrade: (type: 'buy' | 'sell', symbol: string, shares: number, price: number) => boolean;
}

export const TradeModal = ({ stock, portfolio, onClose, onTrade }: TradeModalProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState(1);

  const position = portfolio.positions.find(p => p.symbol === stock.symbol);
  const maxBuyShares = Math.floor(portfolio.cashBalance / stock.price);
  const maxSellShares = position?.shares || 0;
  const total = shares * stock.price;
  const isPositive = stock.change >= 0;

  const canExecute = tradeType === 'buy' 
    ? shares > 0 && total <= portfolio.cashBalance
    : shares > 0 && shares <= maxSellShares;

  const handleTrade = () => {
    if (canExecute) {
      const success = onTrade(tradeType, stock.symbol, shares, stock.price);
      if (success) {
        onClose();
      }
    }
  };

  const adjustShares = (delta: number) => {
    const newShares = Math.max(0, shares + delta);
    const max = tradeType === 'buy' ? maxBuyShares : maxSellShares;
    setShares(Math.min(newShares, max));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-card rounded-t-3xl p-6 slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold">
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold">{stock.symbol}</h2>
              <p className="text-sm text-muted-foreground">{stock.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-bold">${stock.price.toFixed(2)}</p>
          <div className={`flex items-center justify-center gap-1 mt-1 ${isPositive ? 'text-gain' : 'text-loss'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-medium">
              {isPositive ? '+' : ''}${stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Trade Type Toggle */}
        <div className="flex rounded-xl bg-secondary p-1 mb-6">
          <button
            onClick={() => { setTradeType('buy'); setShares(1); }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tradeType === 'buy' 
                ? 'bg-success text-success-foreground glow-success' 
                : 'text-muted-foreground'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => { setTradeType('sell'); setShares(Math.min(1, maxSellShares)); }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tradeType === 'sell' 
                ? 'bg-destructive text-destructive-foreground glow-destructive' 
                : 'text-muted-foreground'
            }`}
            disabled={maxSellShares === 0}
          >
            Sell
          </button>
        </div>

        {/* Shares Selector */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={() => adjustShares(-1)}
            disabled={shares <= 0}
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-bold">{shares}</p>
            <p className="text-muted-foreground text-sm">Shares</p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={() => adjustShares(1)}
            disabled={shares >= (tradeType === 'buy' ? maxBuyShares : maxSellShares)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Order Summary */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Market Price</span>
            <span>${stock.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span>{shares} shares</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Estimated Total</span>
            <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center mb-4">
          {tradeType === 'buy' 
            ? `Buying power: $${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            : `You own: ${maxSellShares} shares`
          }
        </p>

        {/* Execute Button */}
        <Button
          onClick={handleTrade}
          disabled={!canExecute}
          className={`w-full py-6 text-lg font-semibold rounded-xl ${
            tradeType === 'buy'
              ? 'bg-success hover:bg-success/90 text-success-foreground'
              : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
          }`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {stock.symbol}
        </Button>
      </div>
    </div>
  );
};
