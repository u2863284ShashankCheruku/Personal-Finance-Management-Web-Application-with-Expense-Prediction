import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  Target, 
  TrendingUp, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, cn } from '../lib/utils';

interface Budget {
  amount: number;
  month?: string;
}

const Budget: React.FC = () => {
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currentBudget, setCurrentBudget] = useState<number | null>(null);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBudget();
  }, []);

  const fetchBudget = async () => {
    setLoading(true);
    try {
      const [budgetRes, summaryRes] = await Promise.all([
        api.get('/budget/'),
        api.get('/dashboard/summary')
      ]);
      // API returns { "budget": 10000 }
      setCurrentBudget(budgetRes.data.budget || 0);
      setTotalExpense(Number(summaryRes.data?.total_expense) || 0);
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      // API expects { "monthly_limit": 10000 }
      await api.post('/budget/', { monthly_limit: parseFloat(budgetAmount) });
      setSuccess(true);
      setCurrentBudget(parseFloat(budgetAmount));
      setBudgetAmount('');
      fetchBudget();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error setting budget:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const safeBudget = currentBudget || 0;
  const usedPercent = safeBudget > 0 ? (totalExpense / safeBudget) * 100 : 0;
  const boundedUsedPercent = Math.max(0, Math.min(100, usedPercent));
  const remaining = Math.max(0, safeBudget - totalExpense);
  const overspent = Math.max(0, totalExpense - safeBudget);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Budget Management</h1>
          <p className="text-slate-500">Set your limits and save more for what matters.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Budget Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-32 h-32 text-indigo-600" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-xl mb-6">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Monthly Budget</p>
            {loading ? (
              <div className="h-10 w-32 bg-slate-100 animate-pulse rounded-lg"></div>
            ) : (
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                {formatCurrency(currentBudget || 0)}
              </h2>
            )}
            
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">Budget Progress</span>
                <span className="text-sm font-bold text-indigo-600">{Math.round(usedPercent)}% used</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${boundedUsedPercent}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-indigo-600 rounded-full"
                ></motion.div>
              </div>
              <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {overspent > 0
                  ? `You are over budget by ${formatCurrency(overspent)} this month.`
                  : `You have ${formatCurrency(remaining)} remaining for this month.`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Set Budget Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Set New Budget
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Limit</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Enter amount"
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                This will be your spending limit for the current month.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70",
                success 
                  ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
              )}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Budget Updated
                </>
              ) : (
                <>
                  Update Budget
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Budget Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl shadow-indigo-900/20 flex flex-col md:flex-row items-center gap-8"
      >
        <div className="w-20 h-20 bg-indigo-800 rounded-2xl flex items-center justify-center shrink-0">
          <PieChartIcon className="w-10 h-10 text-indigo-300" />
        </div>
        <div>
          <h4 className="text-xl font-bold mb-2">Smart Budgeting Tip</h4>
          <p className="text-indigo-200 leading-relaxed">
            Try the 50/30/20 rule: Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. This balanced approach helps ensure you're covering essentials while still enjoying your life and building a secure future.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Budget;
