import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OptionChainData, OptionPosition, OptionTrade, IndexSymbol, LOT_SIZES } from '@/types/options';

const STORAGE_KEY = 'paper_options_portfolio';

interface OptionsPortfolio {
  cashBalance: number;
  positions: OptionPosition[];
  trades: OptionTrade[];
}

const getInitialPortfolio = (): OptionsPortfolio => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      trades: parsed.trades.map((t: OptionTrade) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      })),
    };
  }
  return {
    cashBalance: 500000, // 5 Lakhs for options trading
    positions: [],
    trades: [],
  };
};

export const useOptionsData = () => {
  const [selectedIndex, setSelectedIndex] = useState<IndexSymbol>('NIFTY');
  const [optionChain, setOptionChain] = useState<OptionChainData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<OptionsPortfolio>(getInitialPortfolio);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchOptionChain = useCallback(async (symbol: IndexSymbol) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('nse-options', {
        body: null,
        headers: {},
      });

      // Use query param approach since invoke doesn't support query params directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nse-options?symbol=${symbol}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch option chain');
      }

      const chainData: OptionChainData = await response.json();
      setOptionChain(chainData);
      setLastUpdate(new Date());
      
      // Update positions with current prices
      updatePositionPrices(chainData);
    } catch (err) {
      console.error('Error fetching option chain:', err);
      setError('Failed to load option data. Using simulated prices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePositionPrices = useCallback((chainData: OptionChainData) => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(pos => {
        if (pos.symbol !== chainData.symbol) return pos;
        
        const strike = chainData.options.find(o => o.strikePrice === pos.strikePrice);
        if (!strike) return pos;
        
        const optionData = pos.optionType === 'CE' ? strike.CE : strike.PE;
        if (!optionData) return pos;
        
        const currentPrice = optionData.lastPrice;
        const totalValue = pos.quantity * pos.lotSize * currentPrice;
        const costBasis = pos.quantity * pos.lotSize * pos.avgPrice;
        const pnl = totalValue - costBasis;
        const pnlPercent = (pnl / costBasis) * 100;
        
        return {
          ...pos,
          currentPrice,
          pnl,
          pnlPercent,
        };
      });
      
      return { ...prev, positions: updatedPositions };
    });
  }, []);

  // Fetch data on mount and when index changes
  useEffect(() => {
    fetchOptionChain(selectedIndex);
  }, [selectedIndex, fetchOptionChain]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOptionChain(selectedIndex);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedIndex, fetchOptionChain]);

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const executeTrade = useCallback((
    type: 'buy' | 'sell',
    symbol: IndexSymbol,
    strikePrice: number,
    optionType: 'CE' | 'PE',
    expiryDate: string,
    quantity: number,
    price: number
  ) => {
    const lotSize = LOT_SIZES[symbol];
    const total = quantity * lotSize * price;

    setPortfolio(prev => {
      if (type === 'buy') {
        if (total > prev.cashBalance) return prev;

        const existingPosition = prev.positions.find(
          p => p.symbol === symbol && 
               p.strikePrice === strikePrice && 
               p.optionType === optionType &&
               p.expiryDate === expiryDate
        );

        let newPositions: OptionPosition[];
        if (existingPosition) {
          const newQuantity = existingPosition.quantity + quantity;
          const newAvgPrice = ((existingPosition.quantity * existingPosition.avgPrice) + (quantity * price)) / newQuantity;
          
          newPositions = prev.positions.map(p =>
            p.id === existingPosition.id
              ? { ...p, quantity: newQuantity, avgPrice: newAvgPrice }
              : p
          );
        } else {
          newPositions = [
            ...prev.positions,
            {
              id: Date.now().toString(),
              symbol,
              strikePrice,
              optionType,
              expiryDate,
              quantity,
              lotSize,
              avgPrice: price,
              currentPrice: price,
              pnl: 0,
              pnlPercent: 0,
            },
          ];
        }

        const trade: OptionTrade = {
          id: Date.now().toString(),
          type: 'buy',
          symbol,
          strikePrice,
          optionType,
          expiryDate,
          quantity,
          lotSize,
          price,
          total,
          timestamp: new Date(),
        };

        return {
          ...prev,
          cashBalance: prev.cashBalance - total,
          positions: newPositions,
          trades: [trade, ...prev.trades],
        };
      } else {
        const existingPosition = prev.positions.find(
          p => p.symbol === symbol && 
               p.strikePrice === strikePrice && 
               p.optionType === optionType &&
               p.expiryDate === expiryDate
        );

        if (!existingPosition || existingPosition.quantity < quantity) return prev;

        let newPositions: OptionPosition[];
        if (existingPosition.quantity === quantity) {
          newPositions = prev.positions.filter(p => p.id !== existingPosition.id);
        } else {
          newPositions = prev.positions.map(p =>
            p.id === existingPosition.id
              ? { ...p, quantity: p.quantity - quantity }
              : p
          );
        }

        const trade: OptionTrade = {
          id: Date.now().toString(),
          type: 'sell',
          symbol,
          strikePrice,
          optionType,
          expiryDate,
          quantity,
          lotSize,
          price,
          total,
          timestamp: new Date(),
        };

        return {
          ...prev,
          cashBalance: prev.cashBalance + total,
          positions: newPositions,
          trades: [trade, ...prev.trades],
        };
      }
    });

    return true;
  }, []);

  const resetPortfolio = useCallback(() => {
    const initial: OptionsPortfolio = {
      cashBalance: 500000,
      positions: [],
      trades: [],
    };
    setPortfolio(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  const totalPositionsValue = portfolio.positions.reduce(
    (sum, pos) => sum + (pos.quantity * pos.lotSize * pos.currentPrice),
    0
  );

  const totalPnL = portfolio.positions.reduce((sum, pos) => sum + pos.pnl, 0);

  return {
    selectedIndex,
    setSelectedIndex,
    optionChain,
    loading,
    error,
    portfolio,
    executeTrade,
    resetPortfolio,
    lastUpdate,
    refreshData: () => fetchOptionChain(selectedIndex),
    totalPositionsValue,
    totalPnL,
  };
};
