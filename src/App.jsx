import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Newspaper, Users, Search, Calculator, Activity } from 'lucide-react';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://stock-tracker-backend-dvzl.onrender.com';

const StockTrackerApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [premarketData, setPremarketData] = useState({ gainers: [], losers: [] });
  const [liveMarketData, setLiveMarketData] = useState({ gainers: [], losers: [] });
  const [congressTrades, setCongressTrades] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [searchTicker, setSearchTicker] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [stockNews, setStockNews] = useState(null);
  const [optionsData, setOptionsData] = useState(null);
  const [bsInputs, setBsInputs] = useState({
    stock_price: 100,
    strike: 100,
    time_to_expiry: 30,
    risk_free_rate: 4.5,
    volatility: 30,
    option_type: 'call'
  });
  const [bsResult, setBsResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchPremarket();
    fetchLiveMarket();
    fetchCongressTrades();
    fetchMarketNews();
  }, []);

  const fetchPremarket = async () => {
    try {
      const res = await fetch(`${API_URL}/api/premarket`);
      const data = await res.json();
      setPremarketData(data);
    } catch (error) {
      console.error('Error fetching premarket:', error);
    }
  };

  const fetchLiveMarket = async () => {
    try {
      const res = await fetch(`${API_URL}/api/live-market`);
      const data = await res.json();
      setLiveMarketData(data);
    } catch (error) {
      console.error('Error fetching live market:', error);
    }
  };

  const fetchCongressTrades = async () => {
    try {
      const res = await fetch(`${API_URL}/api/congress-trades`);
      const data = await res.json();
      setCongressTrades(data.trades || []);
    } catch (error) {
      console.error('Error fetching congress trades:', error);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const res = await fetch(`${API_URL}/api/market-news`);
      const data = await res.json();
      setMarketNews(data.news || []);
    } catch (error) {
      console.error('Error fetching market news:', error);
    }
  };

  const analyzeStock = async () => {
    if (!searchTicker) return;
    
    setLoading(true);
    try {
      const [analysisRes, newsRes, optionsRes] = await Promise.all([
        fetch(`${API_URL}/api/analyze/${searchTicker}`),
        fetch(`${API_URL}/api/news/${searchTicker}`),
        fetch(`${API_URL}/api/options/${searchTicker}`)
      ]);

      const analysis = await analysisRes.json();
      const news = await newsRes.json();
      const options = await optionsRes.json();

      setAnalysisData(analysis);
      setStockNews(news);
      setOptionsData(options);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error analyzing stock:', error);
      alert('Error fetching stock data. Please check the ticker symbol.');
    } finally {
      setLoading(false);
    }
  };

  const calculateBlackScholes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/calculate-bs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bsInputs)
      });
      const data = await res.json();
      setBsResult(data);
    } catch (error) {
      console.error('Error calculating Black-Scholes:', error);
    }
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter ticker symbol (e.g., AAPL)"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && analyzeStock()}
            className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={analyzeStock}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </div>

      {/* Market News */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Breaking Market News</h2>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {marketNews.slice(0, 5).map((item, idx) => (
            <div key={idx} className="bg-gray-700 p-3 rounded">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold">
                {item.title}
              </a>
              <p className="text-gray-400 text-sm mt-1">{item.source} • {new Date(item.published).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Premarket Movers */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-400" />
          Premarket Movers
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-green-400 font-semibold mb-2">Top Gainers</h3>
            {premarketData.gainers.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{stock.ticker}</span>
                  <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${stock.price}</div>
                  <div className="text-green-400 text-sm">+{stock.change_pct}%</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-red-400 font-semibold mb-2">Top Losers</h3>
            {premarketData.losers.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{stock.ticker}</span>
                  <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${stock.price}</div>
                  <div className="text-red-400 text-sm">{stock.change_pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Market */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          Live Market
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-green-400 font-semibold mb-2">Top Gainers</h3>
            {liveMarketData.gainers.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{stock.ticker}</span>
                  <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${stock.price}</div>
                  <div className="text-green-400 text-sm">+{stock.change_pct}%</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-red-400 font-semibold mb-2">Top Losers</h3>
            {liveMarketData.losers.slice(0, 5).map((stock, idx) => (
              <div key={idx} className="bg-gray-700 p-3 rounded mb-2 flex justify-between items-center">
                <div>
                  <span className="text-white font-bold">{stock.ticker}</span>
                  <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">${stock.price}</div>
                  <div className="text-red-400 text-sm">{stock.change_pct}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Congressional Trades */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-yellow-400" />
          Recent Congressional Trades
        </h2>
        <div className="space-y-3">
          {congressTrades.map((trade, idx) => (
            <div key={idx} className="bg-gray-700 p-4 rounded flex justify-between items-center">
              <div>
                <div className="text-white font-semibold">{trade.politician}</div>
                <div className="text-gray-400 text-sm">{trade.party}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">{trade.ticker}</div>
                <div className={`text-sm ${trade.type === 'Purchase' ? 'text-green-400' : 'text-red-400'}`}>
                  {trade.type}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{trade.amount}</div>
                <div className="text-gray-400 text-sm">{trade.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Analysis Component
  const Analysis = () => {
    if (!analysisData) {
      return (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <p className="text-gray-400">Enter a ticker symbol to analyze</p>
        </div>
      );
    }

    const signalColors = {
      green: 'bg-green-500',
      lightgreen: 'bg-green-400',
      yellow: 'bg-yellow-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{analysisData.ticker}</h1>
              <p className="text-gray-400">{analysisData.name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">${analysisData.current_price}</div>
              <div className={`mt-2 px-4 py-2 rounded-lg ${signalColors[analysisData.signal_color]} text-white font-bold`}>
                {analysisData.signal}
              </div>
              <div className="text-gray-400 mt-1">Confidence: {analysisData.confidence}%</div>
            </div>
          </div>
        </div>

        {/* News Sentiment */}
        {stockNews && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-blue-400" />
              Latest News & Sentiment
            </h2>
            <div className="mb-4 p-4 bg-gray-700 rounded">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Sentiment Score:</span>
                <span className={`font-bold text-lg ${stockNews.sentiment_score > 20 ? 'text-green-400' : stockNews.sentiment_score < -20 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {stockNews.sentiment_score > 0 ? '+' : ''}{stockNews.sentiment_score}%
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-400">Positive: {stockNews.positive_count}</span>
                <span className="text-gray-400">Neutral: {stockNews.neutral_count}</span>
                <span className="text-red-400">Negative: {stockNews.negative_count}</span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stockNews.news.slice(0, 8).map((item, idx) => (
                <div key={idx} className="bg-gray-700 p-3 rounded">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold">
                    {item.title}
                  </a>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400 text-sm">{item.source}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      item.sentiment === 'positive' ? 'bg-green-900 text-green-300' :
                      item.sentiment === 'negative' ? 'bg-red-900 text-red-300' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {item.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Technical Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Technical Score</div>
              <div className="text-2xl font-bold text-white">{analysisData.technical.score}/100</div>
              <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analysisData.technical.score}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">RSI (14)</div>
              <div className="text-2xl font-bold text-white">{analysisData.technical.rsi}</div>
              <div className={`text-sm mt-1 ${
                analysisData.technical.rsi > 70 ? 'text-red-400' :
                analysisData.technical.rsi < 30 ? 'text-green-400' :
                'text-yellow-400'
              }`}>
                {analysisData.technical.rsi > 70 ? 'Overbought' :
                 analysisData.technical.rsi < 30 ? 'Oversold' : 'Neutral'}
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">MACD</div>
              <div className="text-white">
                <div>MACD: {analysisData.technical.macd.macd}</div>
                <div>Signal: {analysisData.technical.macd.signal}</div>
                <div className={analysisData.technical.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                  Histogram: {analysisData.technical.macd.histogram}
                </div>
              </div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Moving Averages</div>
              <div className="text-white text-sm space-y-1">
                <div>SMA 20: ${analysisData.technical.moving_averages.sma_20}</div>
                <div>SMA 50: ${analysisData.technical.moving_averages.sma_50}</div>
                <div>SMA 200: ${analysisData.technical.moving_averages.sma_200}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fundamental Analysis */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Fundamental Analysis</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Fundamental Score</div>
              <div className="text-2xl font-bold text-white">{analysisData.fundamental.score}/100</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">P/E Ratio</div>
              <div className="text-xl font-bold text-white">{analysisData.fundamental.pe_ratio || 'N/A'}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Profit Margin</div>
              <div className="text-xl font-bold text-white">{analysisData.fundamental.profit_margin}%</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">ROE</div>
              <div className="text-xl font-bold text-white">{analysisData.fundamental.roe}%</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Debt/Equity</div>
              <div className="text-xl font-bold text-white">{analysisData.fundamental.debt_to_equity || 'N/A'}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Market Cap</div>
              <div className="text-xl font-bold text-white">
                ${(analysisData.fundamental.market_cap / 1e9).toFixed(2)}B
              </div>
            </div>
          </div>
        </div>

        {/* Price Predictions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Price Predictions (Monte Carlo)</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {['1_week', '1_month', '3_month'].map((period) => {
              const pred = analysisData.predictions[period];
              const label = period.replace('_', ' ').toUpperCase();
              return (
                <div key={period} className="bg-gray-700 p-4 rounded">
                  <h3 className="text-blue-400 font-semibold mb-3">{label}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Most Likely:</span>
                      <span className="text-white font-bold">${pred.median}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Best Case (95%):</span>
                      <span className="text-green-400">${pred.percentile_95}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Worst Case (5%):</span>
                      <span className="text-red-400">${pred.percentile_5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit Prob:</span>
                      <span className="text-yellow-400">{pred.prob_profit}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Trading Recommendation</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Entry Price</div>
              <div className="text-xl font-bold text-green-400">${analysisData.recommendation.entry}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Stop Loss</div>
              <div className="text-xl font-bold text-red-400">${analysisData.recommendation.stop_loss}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Target</div>
              <div className="text-xl font-bold text-blue-400">${analysisData.recommendation.target}</div>
            </div>
            <div className="bg-gray-700 p-4 rounded">
              <div className="text-gray-400 text-sm">Risk/Reward</div>
              <div className="text-xl font-bold text-yellow-400">1:{analysisData.recommendation.risk_reward}</div>
            </div>
          </div>
        </div>

        {/* Options Chain */}
        {optionsData && !optionsData.error && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-white mb-4">Options Chain</h2>
            <div className="mb-4 text-gray-400">Expiration: {optionsData.expiration}</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-green-400 font-semibold mb-2">Calls</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-2 text-left text-gray-400">Strike</th>
                        <th className="p-2 text-right text-gray-400">Last</th>
                        <th className="p-2 text-right text-gray-400">Volume</th>
                        <th className="p-2 text-right text-gray-400">OI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsData.calls.slice(0, 10).map((opt, idx) => (
                        <tr key={idx} className="border-t border-gray-700">
                          <td className="p-2 text-white">${opt.strike}</td>
                          <td className="p-2 text-right text-white">${opt.lastPrice?.toFixed(2) || '0'}</td>
                          <td className="p-2 text-right text-gray-400">{opt.volume || 0}</td>
                          <td className="p-2 text-right text-gray-400">{opt.openInterest || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-red-400 font-semibold mb-2">Puts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="p-2 text-left text-gray-400">Strike</th>
                        <th className="p-2 text-right text-gray-400">Last</th>
                        <th className="p-2 text-right text-gray-400">Volume</th>
                        <th className="p-2 text-right text-gray-400">OI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsData.puts.slice(0, 10).map((opt, idx) => (
                        <tr key={idx} className="border-t border-gray-700">
                          <td className="p-2 text-white">${opt.strike}</td>
                          <td className="p-2 text-right text-white">${opt.lastPrice?.toFixed(2) || '0'}</td>
                          <td className="p-2 text-right text-gray-400">{opt.volume || 0}</td>
                          <td className="p-2 text-right text-gray-400">{opt.openInterest || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Black-Scholes Calculator Component
  const BlackScholesCalc = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-purple-400" />
          Black-Scholes Calculator
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-400 mb-2">Stock Price ($)</label>
            <input
              type="number"
              value={bsInputs.stock_price}
              onChange={(e) => setBsInputs({...bsInputs, stock_price: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Strike Price ($)</label>
            <input
              type="number"
              value={bsInputs.strike}
              onChange={(e) => setBsInputs({...bsInputs, strike: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Days to Expiry</label>
            <input
              type="number"
              value={bsInputs.time_to_expiry}
              onChange={(e) => setBsInputs({...bsInputs, time_to_expiry: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Risk-Free Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={bsInputs.risk_free_rate}
              onChange={(e) => setBsInputs({...bsInputs, risk_free_rate: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Volatility (IV %)</label>
            <input
              type="number"
              value={bsInputs.volatility}
              onChange={(e) => setBsInputs({...bsInputs, volatility: parseFloat(e.target.value)})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Option Type</label>
            <select
              value={bsInputs.option_type}
              onChange={(e) => setBsInputs({...bsInputs, option_type: e.target.value})}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500"
            >
              <option value="call">Call</option>
              <option value="put">Put</option>
            </select>
          </div>
        </div>

        <button
          onClick={calculateBlackScholes}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
        >
          Calculate
        </button>

        {bsResult && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="text-gray-400 mb-2">Theoretical Price</div>
              <div className="text-4xl font-bold text-white">${bsResult.theoretical_price}</div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Delta</div>
                <div className="text-2xl font-bold text-blue-400">{bsResult.greeks.delta}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Gamma</div>
                <div className="text-2xl font-bold text-green-400">{bsResult.greeks.gamma}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Theta</div>
                <div className="text-2xl font-bold text-red-400">{bsResult.greeks.theta}</div>
              </div>
              <div className="bg-gray-700 p-4 rounded">
                <div className="text-gray-400 text-sm">Vega</div>
                <div className="text-2xl font-bold text-purple-400">{bsResult.greeks.vega}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Main App Render
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            Stock Tracker & Analyzer
          </h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto flex overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-4 whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-6 py-4 whitespace-nowrap ${activeTab === 'analysis' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-4 whitespace-nowrap ${activeTab === 'calculator' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            BS Calculator
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'analysis' && <Analysis />}
        {activeTab === 'calculator' && <BlackScholesCalc />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>⚠️ For educational purposes only. Not financial advice.</p>
          <p className="mt-1">Always do your own research before making investment decisions.</p>
        </div>
      </footer>
    </div>
  );
};

export default StockTrackerApp;
