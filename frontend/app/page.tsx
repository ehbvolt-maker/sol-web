"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Play, Square } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const statusRes = await axios.get('http://localhost:8000/api/v1/trading/status');
      setStatus(statusRes.data);

      const accountRes = await axios.get('http://localhost:8000/api/v1/trading/account');
      setAccount(accountRes.data);

      // Mock chart data for now if backend doesn't return history yet
      // In real implementation, we'd fetch historical data
      setChartData(prev => {
        const newVal = { time: new Date().toLocaleTimeString(), value: Math.random() * 100 + 100 };
        const newData = [...prev, newVal];
        return newData.slice(-20); // Keep last 20 points
      });

    } catch (e) {
      console.error("Error fetching data", e);
    }
  };

  const toggleStrategy = async (symbol: string, running: boolean) => {
    try {
      if (running) {
        await axios.post(`http://localhost:8000/api/v1/trading/stop-strategy/${symbol}`);
      } else {
        await axios.post(`http://localhost:8000/api/v1/trading/start-strategy/${symbol}`);
      }
      fetchData(); // Refresh immediate
    } catch (e) {
      console.error("Error toggling strategy", e);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text">
            Antigravity Trading
          </h1>
          <p className="text-slate-400">Professional Automated Trading Agent</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Activity className="text-blue-500" />
            <div>
              <p className="text-xs text-slate-500">System Status</p>
              <p className="font-mono text-emerald-400">ONLINE</p>
            </div>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <DollarSign className="text-emerald-500" />
            <div>
              <p className="text-xs text-slate-500">Equity</p>
              <p className="font-mono text-white">${account?.equity || '---'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Live Market Performance</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
                  itemStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">Strategy Control</h2>
          <div className="space-y-4">
            {/* Example Strategy Item */}
            {['AAPL', 'GOOGL', 'TSLA'].map(symbol => {
              const isRunning = status?.strategies?.includes(symbol);
              return (
                <div key={symbol} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div>
                    <h3 className="font-bold text-lg">{symbol}</h3>
                    <p className="text-xs text-slate-400">SMA Crossover</p>
                  </div>
                  <button
                    onClick={() => toggleStrategy(symbol, isRunning)}
                    className={`p-3 rounded-lg transition-all ${isRunning
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                  >
                    {isRunning ? <Square size={20} /> : <Play size={20} />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
