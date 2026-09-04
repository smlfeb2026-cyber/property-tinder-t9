import React from 'react';
import { Flame, LineChart, Zap, UserCheck, Bell, Sliders, Sparkles, Building2 } from 'lucide-react';
import { CustomerProfile, AlertNotification } from '../types';

interface NavbarProps {
  activeTab: 'tinder' | 'monitor' | 'valuation' | 'agent';
  setActiveTab: (tab: 'tinder' | 'monitor' | 'valuation' | 'agent') => void;
  customer: CustomerProfile;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  onOpenAgentModal: () => void;
  notifications: AlertNotification[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  customer,
  onOpenProfile,
  onOpenNotifications,
  onOpenAgentModal,
  notifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/10 text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('tinder')}>
            <div className="w-8 h-8 bg-emerald-600 rounded-sm flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              P
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif italic tracking-tight text-white text-lg sm:text-xl font-medium">
                  PropMatch AI
                </span>
                <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-emerald-900/40 text-emerald-400 font-semibold border border-emerald-500/30">
                  Singapore
                </span>
              </div>
              <p className="text-[10px] text-gray-500 tracking-wider uppercase hidden sm:block">
                URA Master & HDB Matchmaking Pipeline
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-lg border border-white/10">
            <button
              id="nav-tab-tinder"
              onClick={() => setActiveTab('tinder')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-medium transition-all ${
                activeTab === 'tinder'
                  ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Matchmaker</span>
            </button>

            <button
              id="nav-tab-monitor"
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-medium transition-all ${
                activeTab === 'monitor'
                  ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Price Monitor</span>
            </button>

            <button
              id="nav-tab-valuation"
              onClick={() => setActiveTab('valuation')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-medium transition-all ${
                activeTab === 'valuation'
                  ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Valuation & ROI</span>
            </button>

            <button
              id="nav-tab-agent"
              onClick={() => setActiveTab('agent')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-medium transition-all ${
                activeTab === 'agent'
                  ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Portfolio Agent</span>
              {customer.agentStatus === 'assigned' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell */}
            <button
              id="btn-notifications"
              onClick={onOpenNotifications}
              className="relative p-2 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition border border-white/10"
              title="Recent alerts & profit matches"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Customer Status & Parameters Pill */}
            <button
              id="btn-customer-profile"
              onClick={onOpenProfile}
              className="flex items-center space-x-2 px-3 py-1.5 sm:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition"
            >
              <div className="w-7 h-7 rounded-sm bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-medium text-white flex items-center space-x-1.5">
                  <span>{customer.name}</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-950/80 px-1 py-0.2 rounded border border-emerald-600/30 uppercase tracking-wider">
                    Residence
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 truncate max-w-[130px] uppercase tracking-wider">
                  {customer.currentProperty.town} • +${Math.round(customer.currentProperty.expectedProfit / 1000)}k
                </div>
              </div>
              <Sliders className="w-3.5 h-3.5 text-gray-500 ml-1 hidden sm:block" />
            </button>

            {/* Opt-in Agent Button */}
            {customer.agentStatus !== 'assigned' ? (
              <button
                id="btn-quick-opt-agent"
                onClick={onOpenAgentModal}
                className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)] transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Opt For Agent</span>
              </button>
            ) : (
              <button
                id="btn-agent-status-pill"
                onClick={() => setActiveTab('agent')}
                className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs font-medium uppercase tracking-wider"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Agent: {customer.assignedAgent?.name.split(' ')[0]}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-white/10 text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('tinder')}
            className={`flex-1 flex flex-col items-center py-1 ${
              activeTab === 'tinder' ? 'text-emerald-400 font-bold' : 'text-gray-500'
            }`}
          >
            <Flame className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Tinder</span>
          </button>
          <button
            onClick={() => setActiveTab('monitor')}
            className={`flex-1 flex flex-col items-center py-1 ${
              activeTab === 'monitor' ? 'text-emerald-400 font-bold' : 'text-gray-500'
            }`}
          >
            <LineChart className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab('valuation')}
            className={`flex-1 flex flex-col items-center py-1 ${
              activeTab === 'valuation' ? 'text-emerald-400 font-bold' : 'text-gray-500'
            }`}
          >
            <Zap className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Valuation</span>
          </button>
          <button
            onClick={() => setActiveTab('agent')}
            className={`flex-1 flex flex-col items-center py-1 ${
              activeTab === 'agent' ? 'text-emerald-400 font-bold' : 'text-gray-500'
            }`}
          >
            <UserCheck className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">Agent</span>
          </button>
        </div>
      </div>
    </header>
  );
};
