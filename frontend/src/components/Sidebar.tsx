import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Wallet, 
  LogOut, 
  TrendingUp, 
  Bell,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Transaction', path: '/transactions', icon: PlusCircle },
    { name: 'Budget', path: '/budget', icon: Wallet },
    { name: 'Predictions', path: '/predictions', icon: TrendingUp },
  ];

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-slate-950/50 z-40 transition-opacity md:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 transition-transform duration-300 ease-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight">FinTrack Pro</h1>
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
      </div>

      <nav className="flex-1 mt-8 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;
