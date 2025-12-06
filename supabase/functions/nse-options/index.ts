import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NSE indices for options trading
const INDICES = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];

// Common NSE headers to mimic browser request
const nseHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Referer': 'https://www.nseindia.com/',
  'X-Requested-With': 'XMLHttpRequest',
  'Connection': 'keep-alive',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
};

async function getNSECookies(): Promise<string> {
  try {
    const response = await fetch('https://www.nseindia.com/', {
      headers: nseHeaders,
    });
    const cookies = response.headers.get('set-cookie') || '';
    return cookies;
  } catch (error) {
    console.error('Error getting NSE cookies:', error);
    return '';
  }
}

async function fetchOptionChain(symbol: string, cookies: string) {
  const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        ...nseHeaders,
        'Cookie': cookies,
      },
    });
    
    if (!response.ok) {
      console.error(`NSE API error for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching option chain for ${symbol}:`, error);
    return null;
  }
}

function processOptionChainData(data: any, symbol: string) {
  if (!data || !data.records || !data.records.data) {
    return null;
  }

  const records = data.records;
  const spotPrice = records.underlyingValue;
  const expiryDates = records.expiryDates || [];
  const currentExpiry = expiryDates[0];
  
  // Get ATM strike (closest to spot price)
  const strikes = [...new Set(records.data.map((item: any) => item.strikePrice))] as number[];
  strikes.sort((a, b) => a - b);
  const atmStrike = strikes.reduce((prev, curr) => 
    Math.abs(curr - spotPrice) < Math.abs(prev - spotPrice) ? curr : prev
  );

  // Filter options around ATM (5 strikes above and below)
  const atmIndex = strikes.indexOf(atmStrike);
  const relevantStrikes = strikes.slice(Math.max(0, atmIndex - 5), atmIndex + 6);

  const options = records.data
    .filter((item: any) => 
      item.expiryDate === currentExpiry && 
      relevantStrikes.includes(item.strikePrice)
    )
    .map((item: any) => ({
      strikePrice: item.strikePrice,
      expiryDate: item.expiryDate,
      CE: item.CE ? {
        openInterest: item.CE.openInterest || 0,
        changeinOpenInterest: item.CE.changeinOpenInterest || 0,
        totalTradedVolume: item.CE.totalTradedVolume || 0,
        impliedVolatility: item.CE.impliedVolatility || 0,
        lastPrice: item.CE.lastPrice || 0,
        change: item.CE.change || 0,
        bidQty: item.CE.bidQty || 0,
        bidprice: item.CE.bidprice || 0,
        askQty: item.CE.askQty || 0,
        askPrice: item.CE.askPrice || 0,
      } : null,
      PE: item.PE ? {
        openInterest: item.PE.openInterest || 0,
        changeinOpenInterest: item.PE.changeinOpenInterest || 0,
        totalTradedVolume: item.PE.totalTradedVolume || 0,
        impliedVolatility: item.PE.impliedVolatility || 0,
        lastPrice: item.PE.lastPrice || 0,
        change: item.PE.change || 0,
        bidQty: item.PE.bidQty || 0,
        bidprice: item.PE.bidprice || 0,
        askQty: item.PE.askQty || 0,
        askPrice: item.PE.askPrice || 0,
      } : null,
    }));

  return {
    symbol,
    spotPrice,
    atmStrike,
    currentExpiry,
    expiryDates,
    timestamp: new Date().toISOString(),
    options,
  };
}

// Generate simulated option data when NSE API is unavailable
function generateSimulatedData(symbol: string) {
  const spotPrices: Record<string, number> = {
    'NIFTY': 24500 + (Math.random() - 0.5) * 200,
    'BANKNIFTY': 52000 + (Math.random() - 0.5) * 500,
    'FINNIFTY': 23500 + (Math.random() - 0.5) * 200,
  };

  const spotPrice = spotPrices[symbol] || 20000;
  const strikeGap = symbol === 'BANKNIFTY' ? 100 : 50;
  const atmStrike = Math.round(spotPrice / strikeGap) * strikeGap;

  // Generate expiry dates (next 4 Thursdays)
  const expiryDates: string[] = [];
  const today = new Date();
  let d = new Date(today);
  d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7));
  for (let i = 0; i < 4; i++) {
    expiryDates.push(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'));
    d.setDate(d.getDate() + 7);
  }

  const options = [];
  for (let i = -5; i <= 5; i++) {
    const strike = atmStrike + (i * strikeGap);
    const distFromATM = Math.abs(i);
    
    // Simulate option prices based on distance from ATM
    const ceBasePrice = Math.max(0, spotPrice - strike) + (5 - distFromATM) * 20 + Math.random() * 10;
    const peBasePrice = Math.max(0, strike - spotPrice) + (5 - distFromATM) * 20 + Math.random() * 10;
    
    options.push({
      strikePrice: strike,
      expiryDate: expiryDates[0],
      CE: {
        openInterest: Math.floor(Math.random() * 500000) + 100000,
        changeinOpenInterest: Math.floor((Math.random() - 0.5) * 50000),
        totalTradedVolume: Math.floor(Math.random() * 100000) + 10000,
        impliedVolatility: 12 + Math.random() * 8,
        lastPrice: parseFloat(ceBasePrice.toFixed(2)),
        change: parseFloat(((Math.random() - 0.5) * 20).toFixed(2)),
        bidQty: Math.floor(Math.random() * 1000) * 75,
        bidprice: parseFloat((ceBasePrice - 0.5).toFixed(2)),
        askQty: Math.floor(Math.random() * 1000) * 75,
        askPrice: parseFloat((ceBasePrice + 0.5).toFixed(2)),
      },
      PE: {
        openInterest: Math.floor(Math.random() * 500000) + 100000,
        changeinOpenInterest: Math.floor((Math.random() - 0.5) * 50000),
        totalTradedVolume: Math.floor(Math.random() * 100000) + 10000,
        impliedVolatility: 12 + Math.random() * 8,
        lastPrice: parseFloat(peBasePrice.toFixed(2)),
        change: parseFloat(((Math.random() - 0.5) * 20).toFixed(2)),
        bidQty: Math.floor(Math.random() * 1000) * 75,
        bidprice: parseFloat((peBasePrice - 0.5).toFixed(2)),
        askQty: Math.floor(Math.random() * 1000) * 75,
        askPrice: parseFloat((peBasePrice + 0.5).toFixed(2)),
      },
    });
  }

  return {
    symbol,
    spotPrice: parseFloat(spotPrice.toFixed(2)),
    atmStrike,
    currentExpiry: expiryDates[0],
    expiryDates,
    timestamp: new Date().toISOString(),
    options,
    simulated: true,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol')?.toUpperCase() || 'NIFTY';

    if (!INDICES.includes(symbol)) {
      return new Response(
        JSON.stringify({ error: `Invalid symbol. Supported: ${INDICES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching option chain for ${symbol}`);

    // Try to fetch from NSE
    const cookies = await getNSECookies();
    const nseData = await fetchOptionChain(symbol, cookies);
    
    let responseData;
    
    if (nseData && nseData.records) {
      responseData = processOptionChainData(nseData, symbol);
      console.log(`Successfully fetched live data for ${symbol}`);
    } else {
      // Fall back to simulated data
      console.log(`Using simulated data for ${symbol}`);
      responseData = generateSimulatedData(symbol);
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in nse-options function:', error);
    
    // Return simulated data on error
    const symbol = new URL(req.url).searchParams.get('symbol')?.toUpperCase() || 'NIFTY';
    const simulatedData = generateSimulatedData(symbol);
    
    return new Response(
      JSON.stringify(simulatedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
