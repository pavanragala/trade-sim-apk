import { useState, useEffect, useCallback } from 'react';
import { Stock, Portfolio, Position, Transaction } from '@/types/trading';

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.52, change: 2.34, changePercent: 1.33, volume: '52.3M', marketCap: '2.78T' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.95, changePercent: -0.67, volume: '21.1M', marketCap: '1.78T' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.21, changePercent: 1.12, volume: '18.7M', marketCap: '2.81T' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 1.87, changePercent: 1.06, volume: '35.2M', marketCap: '1.85T' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.32, changePercent: -2.10, volume: '98.4M', marketCap: '789.5B' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58, volume: '42.1M', marketCap: '1.22T' },
  { symbol: 'META', name: 'Meta Platforms', price: 505.75, change: 8.32, changePercent: 1.67, volume: '15.3M', marketCap: '1.29T' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 195.40, change: -1.22, changePercent: -0.62, volume: '8.9M', marketCap: '562.8B' },
];

const STORAGE_KEY = 'paper_trading_portfolio';

const getInitialPortfolio = (): Portfolio => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      transactions: parsed.transactions.map((t: Transaction) => ({
        ...t,
        timestamp: new Date(t.timestamp),
      })),
    };
  }
  return {
    cashBalance: 100000,
    totalValue: 100000,
    positions: [],
    transactions: [],
  };
};

export const useTradingData = () => {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [portfolio, setPortfolio] = useState<Portfolio>(getInitialPortfolio);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          const randomChange = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(1, stock.price + randomChange);
          const change = newPrice - (stock.price - stock.change);
          const changePercent = (change / (stock.price - stock.change)) * 100;
          
          return {
            ...stock,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update portfolio value when prices change
  useEffect(() => {
    setPortfolio(prev => {
      const updatedPositions = prev.positions.map(pos => {
        const currentStock = stocks.find(s => s.symbol === pos.symbol);
        const currentPrice = currentStock?.price || pos.currentPrice;
        const totalValue = pos.shares * currentPrice;
        const totalGain = totalValue - (pos.shares * pos.avgCost);
        const gainPercent = (totalGain / (pos.shares * pos.avgCost)) * 100;
        
        return {
          ...pos,
          currentPrice,
          totalValue,
          totalGain,
          gainPercent,
        };
      });

      const positionsValue = updatedPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
      const totalValue = prev.cashBalance + positionsValue;

      return {
        ...prev,
        positions: updatedPositions,
        totalValue,
      };
    });
  }, [stocks]);

  // Save portfolio to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  const executeTrade = useCallback((
    type: 'buy' | 'sell',
    symbol: string,
    shares: number,
    price: number
  ) => {
    const total = shares * price;
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return false;

    setPortfolio(prev => {
      if (type === 'buy') {
        if (total > prev.cashBalance) return prev;

        const existingPosition = prev.positions.find(p => p.symbol === symbol);
        let newPositions: Position[];

        if (existingPosition) {
          const newShares = existingPosition.shares + shares;
          const newAvgCost = ((existingPosition.shares * existingPosition.avgCost) + total) / newShares;
          newPositions = prev.positions.map(p =>
            p.symbol === symbol
              ? {
                  ...p,
                  shares: newShares,
                  avgCost: newAvgCost,
                  currentPrice: price,
                  totalValue: newShares * price,
                  totalGain: (newShares * price) - (newShares * newAvgCost),
                  gainPercent: ((price - newAvgCost) / newAvgCost) * 100,
                }
              : p
          );
        } else {
          newPositions = [
            ...prev.positions,
            {
              symbol,
              name: stock.name,
              shares,
              avgCost: price,
              currentPrice: price,
              totalValue: total,
              totalGain: 0,
              gainPercent: 0,
            },
          ];
        }

        const transaction: Transaction = {
          id: Date.now().toString(),
          type: 'buy',
          symbol,
          shares,
          price,
          total,
          timestamp: new Date(),
        };

        return {
          ...prev,
          cashBalance: prev.cashBalance - total,
          positions: newPositions,
          transactions: [transaction, ...prev.transactions],
        };
      } else {
        const existingPosition = prev.positions.find(p => p.symbol === symbol);
        if (!existingPosition || existingPosition.shares < shares) return prev;

        let newPositions: Position[];
        if (existingPosition.shares === shares) {
          newPositions = prev.positions.filter(p => p.symbol !== symbol);
        } else {
          newPositions = prev.positions.map(p =>
            p.symbol === symbol
              ? {
                  ...p,
                  shares: p.shares - shares,
                  totalValue: (p.shares - shares) * price,
                  totalGain: ((p.shares - shares) * price) - ((p.shares - shares) * p.avgCost),
                }
              : p
          );
        }

        const transaction: Transaction = {
          id: Date.now().toString(),
          type: 'sell',
          symbol,
          shares,
          price,
          total,
          timestamp: new Date(),
        };

        return {
          ...prev,
          cashBalance: prev.cashBalance + total,
          positions: newPositions,
          transactions: [transaction, ...prev.transactions],
        };
      }
    });

    return true;
  }, [stocks]);

  const resetPortfolio = useCallback(() => {
    const initial: Portfolio = {
      cashBalance: 100000,
      totalValue: 100000,
      positions: [],
      transactions: [],
    };
    setPortfolio(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  }, []);

  return {
    stocks,
    portfolio,
    executeTrade,
    resetPortfolio,
  };
};
