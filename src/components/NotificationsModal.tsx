import React from 'react';
import {
  X,
  Bell,
  Sparkles,
  TrendingUp,
  Building,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AlertNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AlertNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onActionClick: (notification: AlertNotification) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onActionClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-[#E0E0E0] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl font-normal text-white">Property & Profit Alerts</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Automated triggers for recent comparable sales & matching BTO/EC launches
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-[10px] text-gray-400 hover:text-white uppercase tracking-wider px-2 py-1 rounded-md hover:bg-white/5 transition font-semibold"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.map((notif) => {
            const isProfitMet = notif.type === 'profit_target_met';
            const isBto = notif.type === 'bto_launch_match';
            const isEc = notif.type === 'ec_launch_match';

            return (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 rounded-xl border transition space-y-2.5 ${
                  notif.isRead
                    ? 'bg-white/5 border-white/10 text-gray-300'
                    : 'bg-white/10 border-emerald-500/40 shadow-lg ring-1 ring-emerald-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`p-1.5 rounded-md ${
                        isProfitMet
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          : isBto
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-950/60 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {isProfitMet ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : isBto ? (
                        <Building className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <h4 className="font-semibold text-sm text-white">{notif.title}</h4>
                  </div>
                  <span className="text-[10px] text-gray-500 shrink-0 uppercase tracking-wider">{notif.timestamp}</span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">{notif.message}</p>

                {/* Notification CTA Action */}
                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>Profit condition satisfied</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick(notif);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition"
                  >
                    <span>View Match / Opt Agent</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-[11px] text-gray-500">
            Electric Agent monitors URA & HDB transaction databases 24/7 to alert you instantly when your target profit is reached.
          </p>
        </div>
      </div>
    </div>
  );
};
