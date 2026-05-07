import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingDown, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Bell,
  PlusCircle,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface DashboardSummary {
  total_expense: number;
  categories: Record<string, number>;
  monthly_trend: Record<string, number>;
}

interface Alert {
  month_index: number;
  predicted: number;
  budget: number;
  warning: string;
}

interface Transaction {
  amount: number;
  type: 'income' | 'expense';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [predictions, setPredictions] = useState<number[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [budgetUsagePct, setBudgetUsagePct] = useState(0);
  const [savingsRate, setSavingsRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, predictRes, alertsRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/predict/'),
          api.get('/alerts/')
        ]);
        setSummary(summaryRes.data);
        // Predictions might come from /predict/ or /alerts/
        setPredictions(predictRes.data.predictions || alertsRes.data.predictions || []);
        setAlerts(alertsRes.data.alerts || []);

        try {
          const budgetRes = await api.get('/budget/');
          const budgetValue = Number(budgetRes.data?.budget) || 0;
          const totalExpense = Number(summaryRes.data?.total_expense) || 0;
          setMonthlyBudget(budgetValue);
          setBudgetUsagePct(budgetValue > 0 ? (totalExpense / budgetValue) * 100 : 0);
        } catch (budgetErr) {
          console.error('Error fetching budget:', budgetErr);
          setMonthlyBudget(0);
          setBudgetUsagePct(0);
        }

        // Balance is derived from all transactions: income - expense.
        try {
          const transactionsRes = await api.get('/transactions/');
          const transactions: Transaction[] = transactionsRes.data || [];
          const { incomeTotal, expenseTotal, balance } = transactions.reduce(
            (acc, transaction) => {
              const value = Number(transaction.amount) || 0;
              if (transaction.type === 'income') {
                acc.incomeTotal += value;
                acc.balance += value;
              } else {
                acc.expenseTotal += value;
                acc.balance -= value;
              }
              return acc;
            },
            { incomeTotal: 0, expenseTotal: 0, balance: 0 }
          );

          const computedSavingsRate =
            incomeTotal > 0 ? ((incomeTotal - expenseTotal) / incomeTotal) * 100 : 0;

          setTotalBalance(balance);
          setSavingsRate(computedSavingsRate);
        } catch (transactionErr) {
          console.error('Error fetching transactions for balance:', transactionErr);
          setTotalBalance(0);
          setSavingsRate(0);
        }
      } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error('Error fetching dashboard data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Prepare data for charts
  const pieData = summary ? Object.entries(summary.categories).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];

  const trendData = summary ? Object.entries(summary.monthly_trend).map(([month, value]) => ({
    month,
    expense: value
  })) : [];

  const predictionData = predictions.map((val, idx) => ({
    month: `Month ${idx + 1}`,
    predicted: val
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const boundedBudgetUsage = Math.max(0, Math.min(100, budgetUsagePct));

  const trendValues = summary
    ? Object.values(summary.monthly_trend)
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
    : [];

  const currentMonthSpend = trendValues.length > 0 ? trendValues[trendValues.length - 1] : 0;
  const previousMonthSpend = trendValues.length > 1 ? trendValues[trendValues.length - 2] : 0;
  const monthOverMonthChangePct =
    previousMonthSpend > 0
      ? ((currentMonthSpend - previousMonthSpend) / previousMonthSpend) * 100
      : 0;
  const absChangePct = Math.abs(monthOverMonthChangePct);
  const isLowerThanLastMonth = monthOverMonthChangePct < 0;
  const hasComparableMonths = trendValues.length > 1 && previousMonthSpend > 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-indigo-600 p-8 md:p-12 text-white shadow-2xl shadow-indigo-200"
      >
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                Welcome back, <span className="text-indigo-200">{displayName}</span>!
              </h1>
              <p className="text-lg text-indigo-100 mb-8 leading-relaxed opacity-90">
                {hasComparableMonths ? (
                  <>
                    {isLowerThanLastMonth
                      ? "You've managed your finances exceptionally well this month. Your spending is "
                      : "Keep an eye on your spending this month. Your spending is "}
                    <span className="font-bold text-white underline decoration-indigo-300 underline-offset-4">{`${absChangePct.toFixed(1)}% ${isLowerThanLastMonth ? 'lower' : 'higher'}`}</span>
                    {' '}than last month.
                  </>
                ) : (
                  <>
                    Keep adding transactions to unlock a month-over-month spending comparison.
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Add Transaction
                </button>
                <button className="px-6 py-3 bg-indigo-500/30 backdrop-blur-md text-white font-bold rounded-xl border border-white/20 hover:bg-indigo-500/40 transition-all">
                  View Reports
                </button>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="hidden lg:block w-72 h-72 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Active Card</span>
            </div>
            <div className="space-y-4">
              <div className="h-4 w-full bg-white/20 rounded-full"></div>
              <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
              <div className="pt-8">
                <p className="text-xs text-indigo-200 mb-1">Total Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Financial Overview</h2>
          <p className="text-slate-500">Real-time insights into your spending habits.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(summary?.total_expense || 0)} 
          icon={TrendingDown} 
          color="rose"
          trend={{ value: 12, isPositive: false }}
        />
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Monthly Budget</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(monthlyBudget)}</h3>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Progress</span>
              <span className="text-indigo-600">{Math.round(boundedBudgetUsage)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${boundedBudgetUsage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-indigo-600 rounded-full"
              ></motion.div>
            </div>
          </div>
        </div>
        <StatCard 
          title="Savings Rate" 
          value={`${savingsRate.toFixed(1)}%`} 
          icon={TrendingUp} 
          color="emerald"
          trend={{ value: Math.abs(Number(savingsRate.toFixed(1))), isPositive: savingsRate >= 0 }}
          delay={0.1}
        />
        <StatCard 
          title="Active Alerts" 
          value={alerts.length} 
          icon={AlertTriangle} 
          color="amber"
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Monthly Spending Trend</h3>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
              Expenses
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="expense" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Category Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{formatCurrency(item.value as number)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prediction Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Future Expense Predictions
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="predicted" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-slate-500 italic">
            * Predictions are based on your historical spending patterns using machine learning.
          </p>
        </motion.div>

        {/* Alerts Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            Budget Alerts
          </h3>
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">{alert.warning}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Predicted: <span className="font-bold">{formatCurrency(alert.predicted)}</span> vs 
                    Budget: <span className="font-bold">{formatCurrency(alert.budget)}</span>
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-slate-600 font-medium">No budget alerts at the moment.</p>
                <p className="text-slate-400 text-sm">You're doing great with your spending!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
