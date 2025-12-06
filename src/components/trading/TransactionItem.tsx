import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Transaction } from '@/types/trading';

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const isBuy = transaction.type === 'buy';

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isBuy ? 'bg-success/10 text-gain' : 'bg-destructive/10 text-loss'
        }`}>
          {isBuy ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <div>
          <p className="font-medium">{isBuy ? 'Bought' : 'Sold'} {transaction.symbol}</p>
          <p className="text-xs text-muted-foreground">
            {transaction.shares} shares @ ${transaction.price.toFixed(2)}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-semibold ${isBuy ? 'text-loss' : 'text-gain'}`}>
          {isBuy ? '-' : '+'}${transaction.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">
          {transaction.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
};
