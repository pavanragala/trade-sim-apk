import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { OptionTrade } from '@/types/options';

interface OptionsTradeHistoryProps {
  trades: OptionTrade[];
}

export const OptionsTradeHistory = ({ trades }: OptionsTradeHistoryProps) => {
  if (trades.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl">
        <p className="text-muted-foreground mb-2">No trades yet</p>
        <p className="text-sm text-muted-foreground">Your option trading history will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-4">
      {trades.map(trade => {
        const isBuy = trade.type === 'buy';

        return (
          <div key={trade.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isBuy ? 'bg-success/10 text-gain' : 'bg-destructive/10 text-loss'
              }`}>
                {isBuy ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-medium">
                  {isBuy ? 'Bought' : 'Sold'} {trade.symbol} {trade.strikePrice} {trade.optionType}
                </p>
                <p className="text-xs text-muted-foreground">
                  {trade.quantity} lot{trade.quantity > 1 ? 's' : ''} @ ₹{trade.price.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${isBuy ? 'text-loss' : 'text-gain'}`}>
                {isBuy ? '-' : '+'}₹{trade.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-muted-foreground">
                {trade.timestamp.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
