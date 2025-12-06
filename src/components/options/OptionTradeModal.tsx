import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptionStrike, IndexSymbol, LOT_SIZES } from '@/types/options';

interface OptionTradeModalProps {
  strike: OptionStrike;
  optionType: 'CE' | 'PE';
  symbol: IndexSymbol;
  cashBalance: number;
  currentPosition?: { quantity: number };
  onClose: () => void;
  onTrade: (
    type: 'buy' | 'sell',
    symbol: IndexSymbol,
    strikePrice: number,
    optionType: 'CE' | 'PE',
    expiryDate: string,
    quantity: number,
    price: number
  ) => boolean;
}

export const OptionTradeModal = ({
  strike,
  optionType,
  symbol,
  cashBalance,
  currentPosition,
  onClose,
  onTrade,
}: OptionTradeModalProps) => {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [lots, setLots] = useState(1);

  const optionData = optionType === 'CE' ? strike.CE : strike.PE;
  if (!optionData) return null;

  const lotSize = LOT_SIZES[symbol];
  const price = optionData.lastPrice;
  const totalValue = lots * lotSize * price;
  const maxBuyLots = Math.floor(cashBalance / (lotSize * price));
  const maxSellLots = currentPosition?.quantity || 0;

  const canExecute = tradeType === 'buy'
    ? lots > 0 && totalValue <= cashBalance
    : lots > 0 && lots <= maxSellLots;

  const handleTrade = () => {
    if (canExecute) {
      const success = onTrade(
        tradeType,
        symbol,
        strike.strikePrice,
        optionType,
        strike.expiryDate,
        lots,
        price
      );
      if (success) onClose();
    }
  };

  const adjustLots = (delta: number) => {
    const newLots = Math.max(0, lots + delta);
    const max = tradeType === 'buy' ? maxBuyLots : maxSellLots;
    setLots(Math.min(newLots, max));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card rounded-t-3xl p-6 slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              {symbol} {strike.strikePrice} {optionType}
            </h2>
            <p className="text-sm text-muted-foreground">{strike.expiryDate}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-bold">₹{price.toFixed(2)}</p>
          <div className={`mt-1 text-sm ${optionData.change >= 0 ? 'text-gain' : 'text-loss'}`}>
            {optionData.change >= 0 ? '+' : ''}₹{optionData.change.toFixed(2)}
          </div>
        </div>

        {/* Trade Type Toggle */}
        <div className="flex rounded-xl bg-secondary p-1 mb-6">
          <button
            onClick={() => { setTradeType('buy'); setLots(1); }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tradeType === 'buy'
                ? 'bg-success text-success-foreground glow-success'
                : 'text-muted-foreground'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => { setTradeType('sell'); setLots(Math.min(1, maxSellLots)); }}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              tradeType === 'sell'
                ? 'bg-destructive text-destructive-foreground glow-destructive'
                : 'text-muted-foreground'
            }`}
            disabled={maxSellLots === 0}
          >
            Sell
          </button>
        </div>

        {/* Lots Selector */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={() => adjustLots(-1)}
            disabled={lots <= 0}
          >
            <Minus className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-4xl font-bold">{lots}</p>
            <p className="text-muted-foreground text-sm">Lots ({lots * lotSize} qty)</p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="w-12 h-12 rounded-full"
            onClick={() => adjustLots(1)}
            disabled={lots >= (tradeType === 'buy' ? maxBuyLots : maxSellLots)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Order Summary */}
        <div className="bg-secondary/50 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Option Price</span>
            <span>₹{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lot Size</span>
            <span>{lotSize}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Quantity</span>
            <span>{lots} lots × {lotSize} = {lots * lotSize}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t border-border">
            <span>Total Value</span>
            <span>₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-4">
          {tradeType === 'buy'
            ? `Available: ₹${cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Max ${maxBuyLots} lots)`
            : `You hold: ${maxSellLots} lots`
          }
        </p>

        <Button
          onClick={handleTrade}
          disabled={!canExecute}
          className={`w-full py-6 text-lg font-semibold rounded-xl ${
            tradeType === 'buy'
              ? 'bg-success hover:bg-success/90 text-success-foreground'
              : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
          }`}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {lots} Lot{lots > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
