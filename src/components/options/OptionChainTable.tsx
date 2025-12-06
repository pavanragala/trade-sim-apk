import { OptionChainData, OptionStrike, IndexSymbol, LOT_SIZES } from '@/types/options';

interface OptionChainTableProps {
  data: OptionChainData;
  onSelectOption: (strike: OptionStrike, type: 'CE' | 'PE') => void;
}

export const OptionChainTable = ({ data, onSelectOption }: OptionChainTableProps) => {
  const lotSize = LOT_SIZES[data.symbol as IndexSymbol] || 25;

  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary">
            <tr>
              <th colSpan={4} className="py-2 px-3 text-center text-gain border-r border-border">
                CALLS (CE)
              </th>
              <th className="py-2 px-3 text-center bg-accent">Strike</th>
              <th colSpan={4} className="py-2 px-3 text-center text-loss border-l border-border">
                PUTS (PE)
              </th>
            </tr>
            <tr className="text-muted-foreground text-xs">
              <th className="py-2 px-2 text-right">OI</th>
              <th className="py-2 px-2 text-right">Chg</th>
              <th className="py-2 px-2 text-right">IV</th>
              <th className="py-2 px-2 text-right border-r border-border">LTP</th>
              <th className="py-2 px-2 text-center bg-accent font-bold">{lotSize}</th>
              <th className="py-2 px-2 text-left border-l border-border">LTP</th>
              <th className="py-2 px-2 text-left">IV</th>
              <th className="py-2 px-2 text-left">Chg</th>
              <th className="py-2 px-2 text-left">OI</th>
            </tr>
          </thead>
          <tbody>
            {data.options.map((strike) => {
              const isATM = strike.strikePrice === data.atmStrike;
              const isITMCall = strike.strikePrice < data.spotPrice;
              const isITMPut = strike.strikePrice > data.spotPrice;

              return (
                <tr
                  key={strike.strikePrice}
                  className={`border-b border-border ${isATM ? 'bg-accent/50' : ''}`}
                >
                  {/* Call Side */}
                  <td
                    className={`py-2 px-2 text-right cursor-pointer hover:bg-success/10 transition-colors ${
                      isITMCall ? 'bg-success/5' : ''
                    }`}
                    onClick={() => strike.CE && onSelectOption(strike, 'CE')}
                  >
                    {strike.CE ? (strike.CE.openInterest / 1000).toFixed(0) + 'K' : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-right cursor-pointer hover:bg-success/10 transition-colors ${
                      isITMCall ? 'bg-success/5' : ''
                    } ${strike.CE?.changeinOpenInterest && strike.CE.changeinOpenInterest > 0 ? 'text-gain' : 'text-loss'}`}
                    onClick={() => strike.CE && onSelectOption(strike, 'CE')}
                  >
                    {strike.CE ? (strike.CE.changeinOpenInterest / 1000).toFixed(1) + 'K' : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-right cursor-pointer hover:bg-success/10 transition-colors ${
                      isITMCall ? 'bg-success/5' : ''
                    }`}
                    onClick={() => strike.CE && onSelectOption(strike, 'CE')}
                  >
                    {strike.CE ? strike.CE.impliedVolatility.toFixed(1) : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-semibold cursor-pointer hover:bg-success/10 transition-colors border-r border-border ${
                      isITMCall ? 'bg-success/5' : ''
                    } ${strike.CE?.change && strike.CE.change >= 0 ? 'text-gain' : 'text-loss'}`}
                    onClick={() => strike.CE && onSelectOption(strike, 'CE')}
                  >
                    {strike.CE ? strike.CE.lastPrice.toFixed(2) : '-'}
                  </td>

                  {/* Strike Price */}
                  <td className={`py-2 px-2 text-center font-bold ${isATM ? 'bg-primary text-primary-foreground' : 'bg-accent'}`}>
                    {strike.strikePrice}
                  </td>

                  {/* Put Side */}
                  <td
                    className={`py-2 px-2 text-left font-semibold cursor-pointer hover:bg-destructive/10 transition-colors border-l border-border ${
                      isITMPut ? 'bg-destructive/5' : ''
                    } ${strike.PE?.change && strike.PE.change >= 0 ? 'text-gain' : 'text-loss'}`}
                    onClick={() => strike.PE && onSelectOption(strike, 'PE')}
                  >
                    {strike.PE ? strike.PE.lastPrice.toFixed(2) : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-left cursor-pointer hover:bg-destructive/10 transition-colors ${
                      isITMPut ? 'bg-destructive/5' : ''
                    }`}
                    onClick={() => strike.PE && onSelectOption(strike, 'PE')}
                  >
                    {strike.PE ? strike.PE.impliedVolatility.toFixed(1) : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-left cursor-pointer hover:bg-destructive/10 transition-colors ${
                      isITMPut ? 'bg-destructive/5' : ''
                    } ${strike.PE?.changeinOpenInterest && strike.PE.changeinOpenInterest > 0 ? 'text-gain' : 'text-loss'}`}
                    onClick={() => strike.PE && onSelectOption(strike, 'PE')}
                  >
                    {strike.PE ? (strike.PE.changeinOpenInterest / 1000).toFixed(1) + 'K' : '-'}
                  </td>
                  <td
                    className={`py-2 px-2 text-left cursor-pointer hover:bg-destructive/10 transition-colors ${
                      isITMPut ? 'bg-destructive/5' : ''
                    }`}
                    onClick={() => strike.PE && onSelectOption(strike, 'PE')}
                  >
                    {strike.PE ? (strike.PE.openInterest / 1000).toFixed(0) + 'K' : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
