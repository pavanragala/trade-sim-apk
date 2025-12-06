import { IndexSymbol } from '@/types/options';

interface IndexSelectorProps {
  selectedIndex: IndexSymbol;
  onSelect: (index: IndexSymbol) => void;
}

const indices: { symbol: IndexSymbol; name: string }[] = [
  { symbol: 'NIFTY', name: 'NIFTY 50' },
  { symbol: 'BANKNIFTY', name: 'BANK NIFTY' },
  { symbol: 'FINNIFTY', name: 'FIN NIFTY' },
];

export const IndexSelector = ({ selectedIndex, onSelect }: IndexSelectorProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {indices.map(({ symbol, name }) => (
        <button
          key={symbol}
          onClick={() => onSelect(symbol)}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
            selectedIndex === symbol
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
};
