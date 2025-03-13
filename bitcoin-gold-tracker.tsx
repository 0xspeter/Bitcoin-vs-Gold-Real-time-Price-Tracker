import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RefreshCw, TrendingUp, Coins } from 'lucide-react';

const BitcoinGoldTracker = () => {
  const [bitcoinPrice, setBitcoinPrice] = useState(0);
  const [goldPrice, setGoldPrice] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [simulatedBtcPrice, setSimulatedBtcPrice] = useState(0);
  const [simulatedPercentage, setSimulatedPercentage] = useState(0);

  // Constants for calculations
  const btcSupply = 19600000; // Approximate circulating supply
  const goldTotalOz = 6353000000; // Total gold in troy oz

  // Fetch real-time price data
  const fetchPrices = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be actual API calls
      // For demo, we'll use a more realistic current price than the one in the image
      const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const btcData = await btcResponse.json();
      const currentBtcPrice = btcData.bitcoin.usd;
      
      // Gold price can be fetched from a metals API, but we'll use an approximate value for demo
      const currentGoldPrice = 2490; // Current price per troy oz
      
      // Calculate market caps
      const btcMarketCap = btcSupply * currentBtcPrice;
      const goldMarketCap = goldTotalOz * currentGoldPrice;
      
      // Calculate percentage
      const percentOfGold = (btcMarketCap / goldMarketCap) * 100;
      
      setBitcoinPrice(currentBtcPrice);
      setGoldPrice(currentGoldPrice);
      setPercentage(percentOfGold);
      setSimulatedBtcPrice(currentBtcPrice);
      setSimulatedPercentage(percentOfGold);
      
      // Add to price history for the chart
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        bitcoin: currentBtcPrice,
        gold: currentGoldPrice,
        percentage: percentOfGold
      };
      
      setPriceHistory(prev => {
        const newHistory = [...prev, newDataPoint];
        if (newHistory.length > 10) return newHistory.slice(-10);
        return newHistory;
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching prices:', error);
      // Fallback to hardcoded values if API fails
      const fallbackBtcPrice = 80000; // More realistic current price
      const fallbackGoldPrice = 2490;
      
      const btcMarketCap = btcSupply * fallbackBtcPrice;
      const goldMarketCap = goldTotalOz * fallbackGoldPrice;
      const percentOfGold = (btcMarketCap / goldMarketCap) * 100;
      
      setBitcoinPrice(fallbackBtcPrice);
      setGoldPrice(fallbackGoldPrice);
      setPercentage(percentOfGold);
      setSimulatedBtcPrice(fallbackBtcPrice);
      setSimulatedPercentage(percentOfGold);
    } finally {
      setLoading(false);
    }
  };

  // Handle slider change for simulated BTC price
  const handleSimulationChange = (e) => {
    const newPrice = parseFloat(e.target.value);
    setSimulatedBtcPrice(newPrice);
    
    // Recalculate percentage based on new price
    const btcMarketCap = btcSupply * newPrice;
    const goldMarketCap = goldTotalOz * goldPrice;
    const newPercentage = (btcMarketCap / goldMarketCap) * 100;
    setSimulatedPercentage(newPercentage);
  };

  // Initialize and set up interval for updates
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatLargeCurrency = (value) => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}兆`;
    }
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}億`;
    }
    return formatCurrency(value);
  };

  return (
    <div className="flex flex-col p-6 bg-gray-100 rounded-lg w-full max-w-4xl mx-auto shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">比特幣 vs 黃金 實時追蹤器</h1>
        <button 
          onClick={fetchPrices} 
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          更新實時數據
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">比特幣現價</h2>
          <p className="text-3xl font-bold text-teal-500">{formatCurrency(bitcoinPrice)}</p>
          <div className="flex items-center mt-2 text-gray-600">
            <p>總市值: {formatLargeCurrency(bitcoinPrice * btcSupply)}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">黃金價格 (每盎司)</h2>
          <p className="text-3xl font-bold text-yellow-500">{formatCurrency(goldPrice)}</p>
          <div className="flex items-center mt-2 text-gray-600">
            <p>總市值: {formatLargeCurrency(goldPrice * goldTotalOz)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">比特幣相對黃金總市值比例</h2>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
            <div 
              className="bg-teal-500 h-4 rounded-full" 
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <span className="text-xl font-bold text-teal-500">{percentage.toFixed(2)}%</span>
        </div>
        <p className="mt-2 text-gray-600">
          比特幣需要增長約 {((100/percentage) - 1).toFixed(2)}倍才能超越黃金總市值
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">模擬比特幣價格</h2>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="range"
            min={bitcoinPrice * 0.5}
            max={bitcoinPrice * 15}
            step={1000}
            value={simulatedBtcPrice}
            onChange={handleSimulationChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-lg font-bold min-w-24 text-teal-500">{formatCurrency(simulatedBtcPrice)}</span>
        </div>
        
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2">模擬結果：</h3>
          <div className="flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
              <div 
                className="bg-teal-500 h-4 rounded-full" 
                style={{ width: `${Math.min(simulatedPercentage, 100)}%` }}
              ></div>
            </div>
            <span className="text-xl font-bold text-teal-500">{simulatedPercentage.toFixed(2)}%</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <p className="text-gray-600">
              模擬市值: {formatLargeCurrency(simulatedBtcPrice * btcSupply)}
            </p>
            <p className="text-gray-600">
              距離超越黃金還需: {simulatedPercentage >= 100 ? "已超越!" : `${((100/simulatedPercentage) - 1).toFixed(2)}倍`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">價格趨勢</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" />
            <YAxis yAxisId="right" orientation="right" stroke="#eab308" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="bitcoin" 
              stroke="#06b6d4" 
              name="比特幣 (USD)" 
              dot={false}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="gold" 
              stroke="#eab308" 
              name="黃金 (USD)" 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="text-right text-sm text-gray-500 mt-4">
        最後更新: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
};

export default BitcoinGoldTracker;
