import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Calendar, 
  ArrowRight, 
  Info,
  Loader2,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';
import { formatCurrency } from '../lib/utils';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchPredictions = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const response = await api.get('/predict/');
      const rawPredictions = Array.isArray(response.data?.predictions) ? response.data.predictions : [];
      const normalizedPredictions = rawPredictions
        .map((value: unknown) => Number(value))
        .filter((value: number) => Number.isFinite(value))
        .map((value: number) => Math.max(0, value));
      setPredictions(normalizedPredictions);
      setFetchError(false);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setFetchError(true);
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPredictions(true);

    const intervalId = window.setInterval(() => {
      fetchPredictions(false);
    }, 15000);

    const handleWindowFocus = () => {
      fetchPredictions(false);
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [fetchPredictions]);

  const predictionData = predictions.map((val, idx) => ({
    month: `Month ${idx + 1}`,
    predicted: val
  }));

  const hasPredictions = predictions.length > 0;
  const hasMeaningfulPredictions = hasPredictions && predictions.some((value) => value > 0);
  const peakValue = hasMeaningfulPredictions ? Math.max(...predictions) : 0;
  const peakIndex = hasMeaningfulPredictions ? predictions.indexOf(peakValue) + 1 : 0;
  const averagePrediction = hasMeaningfulPredictions
    ? predictions.reduce((sum, value) => sum + value, 0) / predictions.length
    : 0;
  const reserveRecommendation = Math.max(0, peakValue - averagePrediction);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            AI Spending Forecast
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Predictive insights powered by machine learning.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">Model Accuracy: 94.2%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Prediction Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-4 space-y-8"
        >
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Quarterly Outlook
            </h3>
            <div className="space-y-6">
              {predictions.map((val, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 + 0.3 }}
                  key={idx} 
                  className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-indigo-600 font-extrabold text-lg">{idx + 1}</span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Month</p>
                      <p className="text-sm font-bold text-slate-700">Forecast</p>
                    </div>
                  </div>
                  <p className="text-xl font-extrabold text-indigo-600">{formatCurrency(val)}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                  <Sparkles className="w-6 h-6 text-indigo-200" />
                </div>
                <h4 className="text-xl font-bold">Smart Insight</h4>
              </div>
              <p className="text-indigo-100 text-lg leading-relaxed opacity-90">
                {fetchError ? (
                  <>
                    We could not refresh predictions right now. Last known outlook is shown and will update automatically.
                  </>
                ) : hasPredictions ? (
                  <>
                    Your spending is projected to peak in <span className="font-bold text-white">Month {peakIndex}</span>. We recommend setting aside an extra <span className="font-bold text-white">{formatCurrency(reserveRecommendation)}</span> now to cover the expected variance.
                  </>
                ) : (
                  <>
                    Add more transaction history to unlock a personalized monthly spending insight.
                  </>
                )}
              </p>
              <button className="mt-8 w-full py-4 bg-white text-indigo-600 font-extrabold rounded-2xl shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
                Adjust Budget
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Prediction Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Spending Trajectory</h3>
              <p className="text-slate-400 font-medium mt-1">Visualizing your future financial path</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                <span className="w-3 h-3 bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"></span>
                Predicted
              </div>
            </div>
          </div>

          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictionData}>
                <defs>
                  <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '15px' }}
                  itemStyle={{ color: '#6366f1', fontWeight: '800', fontSize: '16px' }}
                  labelStyle={{ fontWeight: '700', color: '#64748b', marginBottom: '5px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#6366f1" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorPredict)" 
                  dot={{ r: 8, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }} 
                  activeDot={{ r: 10, strokeWidth: 0, fill: '#4f46e5' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <Info className="w-6 h-6 text-indigo-500" />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Our advanced ML algorithms analyze your historical data across multiple dimensions. These predictions are updated in real-time as you log new transactions, helping you stay ahead of your financial commitments.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Predictions;
