import React, { useEffect, useState } from 'react';
import { Bell, Search, AlertTriangle, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import axios from 'axios';

interface AlertItem {
  month_index: number;
  predicted: number;
  budget: number;
  warning: string;
}

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/alerts/');
        setAlerts(response.data?.alerts || []);
      } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error('Error fetching alerts:', err);
        }
        setAlerts([]);
      }
    };

    fetchAlerts();
  }, []);

  return (
    <header className="h-auto md:h-16 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-6 lg:px-8 py-3 gap-3 sticky top-0 z-40">
      <div className="flex items-center gap-3 w-full md:max-w-xl">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center bg-slate-100 px-4 py-2 rounded-lg flex-1 min-w-0">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-600"
        />
      </div>
      </div>

      <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-6 w-full md:w-auto">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((current) => !current)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell className="w-5 h-5" />
            {alerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Notifications</p>
                  <p className="text-xs text-slate-500">{alerts.length} active alert{alerts.length === 1 ? '' : 's'}</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  onClick={() => setShowNotifications(false)}
                >
                  Close
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0">
                      <div className="p-2 bg-amber-50 rounded-xl shrink-0">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{alert.warning}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Predicted {alert.predicted.toFixed(2)} vs budget {alert.budget.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-slate-700">No new notifications</p>
                    <p className="text-xs text-slate-500 mt-1">You’re all clear for now.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name || user?.email.split('@')[0]}</p>
            <p className="text-xs text-slate-500">Premium Account</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
