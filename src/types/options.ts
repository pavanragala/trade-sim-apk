export interface OptionData {
  openInterest: number;
  changeinOpenInterest: number;
  totalTradedVolume: number;
  impliedVolatility: number;
  lastPrice: number;
  change: number;
  bidQty: number;
  bidprice: number;
  askQty: number;
  askPrice: number;
}

export interface OptionStrike {
  strikePrice: number;
  expiryDate: string;
  CE: OptionData | null;
  PE: OptionData | null;
}

export interface OptionChainData {
  symbol: string;
  spotPrice: number;
  atmStrike: number;
  currentExpiry: string;
  expiryDates: string[];
  timestamp: string;
  options: OptionStrike[];
  simulated?: boolean;
}

export interface OptionPosition {
  id: string;
  symbol: string;
  strikePrice: number;
  optionType: 'CE' | 'PE';
  expiryDate: string;
  quantity: number; // in lots
  lotSize: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface OptionTrade {
  id: string;
  type: 'buy' | 'sell';
  symbol: string;
  strikePrice: number;
  optionType: 'CE' | 'PE';
  expiryDate: string;
  quantity: number;
  lotSize: number;
  price: number;
  total: number;
  timestamp: Date;
}

export type IndexSymbol = 'NIFTY' | 'BANKNIFTY' | 'FINNIFTY';

export const LOT_SIZES: Record<IndexSymbol, number> = {
  NIFTY: 75,
  BANKNIFTY: 35,
  FINNIFTY: 25,
};
