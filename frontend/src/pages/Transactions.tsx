import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  DollarSign, 
  Tag, 
  Loader2,
  CheckCircle2,
  History,
  ArrowRight,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';
import axios from 'axios';

interface Transaction {
  id?: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

const Transactions: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('food');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editDate, setEditDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const categories = [
    'food', 'rent', 'transport', 'entertainment', 'shopping', 'health', 'utilities', 'other'
  ];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const incomeTotal = transactions.reduce((total, transaction) => {
    return transaction.type === 'income' ? total + (Number(transaction.amount) || 0) : total;
  }, 0);

  const expenseTotal = transactions.reduce((total, transaction) => {
    return transaction.type === 'expense' ? total + (Number(transaction.amount) || 0) : total;
  }, 0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/transactions/');
      setTransactions(response.data);
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 401) {
        console.error('Error fetching transactions:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      await api.post('/transactions/', {
        amount: parseFloat(amount),
        category,
        type,
        date
      });
      setSuccess(true);
      setAmount('');
      fetchTransactions();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingId(transaction.id || '');
    setEditAmount(transaction.amount.toString());
    setEditCategory(transaction.category);
    setEditType(transaction.type);
    setEditDate(transaction.date);
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    setEditSubmitting(true);
    try {
      await api.put(`/transactions/${editingId}`, {
        amount: parseFloat(editAmount),
        category: editCategory,
        type: editType,
        date: editDate
      });
      fetchTransactions();
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating transaction:', err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteClick = (transactionId: string) => {
    setDeleteConfirmId(transactionId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    
    setDeleteSubmitting(true);
    try {
      await api.delete(`/transactions/${deleteConfirmId}`);
      fetchTransactions();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error('Error deleting transaction:', err);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Transactions</h1>
          <p className="text-slate-500 mt-1 text-lg">Keep track of your spending and income with ease.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 flex items-center gap-2 font-bold">
            <ArrowUpRight className="w-4 h-4" />
            Income: {formatCurrency(incomeTotal)}
          </div>
          <div className="px-4 py-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 flex items-center gap-2 font-bold">
            <ArrowDownRight className="w-4 h-4" />
            Expenses: {formatCurrency(expenseTotal)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Transaction Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 h-fit sticky top-24"
        >
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-200">
            <PlusCircle className="w-7 h-7 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-8">New Entry</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Amount</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-xl"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold transition-all",
                    type === 'expense' 
                      ? "bg-rose-50 border-rose-500 text-rose-600 shadow-lg shadow-rose-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <ArrowDownRight className="w-5 h-5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    "flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-bold transition-all",
                    type === 'income' 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                  )}
                >
                  <ArrowUpRight className="w-5 h-5" />
                  Income
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowDownRight className="w-4 h-4 text-slate-400 rotate-45" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className={cn(
                "w-full font-extrabold py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4",
                success 
                  ? "bg-emerald-500 text-white shadow-emerald-500/30" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30"
              )}
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Transaction Saved
                </>
              ) : (
                <>
                  Save Transaction
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Recent Transactions List */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <History className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">All</button>
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Income</button>
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Expense</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-5 text-left text-xs font-extrabold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-right text-xs font-extrabold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-right text-xs font-extrabold text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto" />
                    </td>
                  </tr>
                ) : transactions.length > 0 ? transactions.map((t, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors">
                          <Calendar className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">
                          {format(new Date(t.date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 capitalize group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {t.category}
                      </span>
                    </td>
                    <td className={cn(
                      "px-8 py-6 whitespace-nowrap text-lg font-extrabold text-right",
                      t.type === 'income' ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditClick(t)}
                        className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(t.id || '')}
                        className="p-2 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="w-10 h-10 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold text-lg">No transactions yet</p>
                      <p className="text-slate-300 text-sm">Add your first transaction to see it here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-96 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Edit Transaction</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdateTransaction} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Amount</label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEditType('expense')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold transition-all",
                          editType === 'expense'
                            ? "bg-rose-50 border-rose-500 text-rose-600"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        <ArrowDownRight className="w-4 h-4" />
                        Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType('income')}
                        className={cn(
                          "flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-bold transition-all",
                          editType === 'income'
                            ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        )}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Income
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Category</label>
                    <div className="relative group">
                      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none font-medium"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowDownRight className="w-4 h-4 text-slate-400 rotate-45" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="date"
                        required
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={editSubmitting}
                      className="flex-1 font-extrabold py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {editSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Update Transaction'
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 font-extrabold py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-96"
            >
              <div className="p-8">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Trash2 className="w-6 h-6 text-rose-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Delete Transaction?</h2>
                <p className="text-slate-500 text-center mb-8">This action cannot be undone. Are you sure you want to delete this transaction?</p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirmDelete}
                    disabled={deleteSubmitting}
                    className="flex-1 font-extrabold py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {deleteSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Delete'
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 font-extrabold py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition-all"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
