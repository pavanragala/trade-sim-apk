import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import { OptionChainData, IndexSymbol } from '@/types/options';
import { Button } from '@/components/ui/button';

interface SpotPriceCardProps {
  data: OptionChainData | null;
  loading: boolean;
  lastUpdate: Date | null;
  onRefresh: () => void;
}

export const SpotPriceCard = ({ data, loading, lastUpdate, onRefresh }: SpotPriceCardProps) => {
  if (!data) {
    return (
      <div className="card-gradient rounded-xl p-5 animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-2" />
        <div className="h-8 bg-muted rounded w-32" />
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl p-5 fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">{data.symbol} SPOT</span>
          {data.simulated && (
            <span className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" />
              Demo
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          ₹{data.spotPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <div>
          <span className="text-muted-foreground">ATM Strike: </span>
          <span className="font-semibold">{data.atmStrike}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Expiry: </span>
          <span className="font-semibold">{data.currentExpiry}</span>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground mt-2">
          Updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
