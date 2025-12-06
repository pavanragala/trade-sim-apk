import { TransactionItem } from './TransactionItem';
import { Transaction } from '@/types/trading';

interface HistoryViewProps {
  transactions: Transaction[];
}

export const HistoryView = ({ transactions }: HistoryViewProps) => {
  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold">Transaction History</h1>

      {transactions.length > 0 ? (
        <div className="bg-card rounded-xl p-4">
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl">
          <p className="text-muted-foreground mb-2">No transactions yet</p>
          <p className="text-sm text-muted-foreground">Your trading history will appear here</p>
        </div>
      )}
    </div>
  );
};
