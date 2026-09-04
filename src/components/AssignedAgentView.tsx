import React from 'react';
import {
  UserCheck,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  ShieldCheck,
  Star,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import { AgentProfile, CustomerProfile } from '../types';

interface AssignedAgentViewProps {
  customer: CustomerProfile;
  onOpenAgentModal: () => void;
  onOpenValuation: () => void;
}

export const AssignedAgentView: React.FC<AssignedAgentViewProps> = ({
  customer,
  onOpenAgentModal,
  onOpenValuation,
}) => {
  const agent = customer.assignedAgent;

  if (!agent) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-xl bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif italic text-3xl font-normal text-white tracking-tight">No Property Agent Assigned Yet</h2>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            You can opt for a verified CEA-licensed Electric Property Agent to be assigned specifically to your property at{' '}
            <strong className="text-white">{customer.currentProperty.address}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">On-Site Valuation</span>
            <p className="text-gray-400 text-xs">Comprehensive inspection of your flat's condition & renovation value.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">Profit Target Alignment</span>
            <p className="text-gray-400 text-xs">Strategic pricing to lock in your +S${(customer.currentProperty.expectedProfit / 1000).toFixed(0)}k profit goal.</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] block">BTO / EC Bridging</span>
            <p className="text-gray-400 text-xs">Seamless key-to-key handover so you avoid temporary rental costs.</p>
          </div>
        </div>

        <button
          onClick={onOpenAgentModal}
          className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] transition"
        >
          Opt for Property Agent Assignment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-white/5 border border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10"
            />
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="font-serif italic text-2xl font-normal text-white">{agent.name}</h2>
                <span className="px-2 py-0.5 rounded-sm bg-emerald-950/60 text-emerald-400 font-semibold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                  Assigned Agent
                </span>
              </div>
              <p className="text-xs text-emerald-400 font-medium">{agent.agency} • {agent.title}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pt-1">
                <span className="font-mono text-gray-500">CEA: {agent.ceaRegNo}</span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-emerald-400" />
                  <span>{agent.rating} ({agent.reviewCount} reviews)</span>
                </span>
                <span>•</span>
                <span className="text-gray-300">{agent.dealsClosed}+ Closed Deals</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <a
              href={`tel:${agent.phone}`}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Agent</span>
            </a>
            <button
              onClick={onOpenAgentModal}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider border border-white/10 transition"
            >
              Change Agent
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 italic bg-black/40 p-3 rounded-lg border border-white/10">
          "{agent.bio}"
        </p>
      </div>

      {/* Assignment Progress & Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scheduled On-Site Inspection */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif italic text-lg text-white font-normal flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Scheduled On-Site Inspection</span>
            </h3>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
              Confirmed
            </span>
          </div>

          <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Target Property:</span>
              <span className="font-semibold text-white">{customer.currentProperty.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target Selling Price:</span>
              <span className="font-serif italic text-white text-sm">
                S${customer.currentProperty.expectedSellingPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target Profit Margin:</span>
              <span className="font-semibold text-emerald-400">
                +S${customer.currentProperty.expectedProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-white/10">
              <span className="text-gray-500">Appointment Slot:</span>
              <span className="font-semibold text-white">Tuesday, 02:00 PM (On-site)</span>
            </div>
          </div>

          <button
            onClick={() => alert(`Direct message sent to ${agent.name}: "Hi Kelvin, looking forward to our property valuation on Tuesday!"`)}
            className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Send Direct WhatsApp Message</span>
          </button>
        </div>

        {/* Milestone Tracker */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h3 className="font-serif italic text-lg text-white font-normal flex items-center space-x-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Home Sale & Progression</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-black font-bold flex items-center justify-center text-xs shrink-0">
                ✓
              </div>
              <div>
                <span className="font-semibold text-white block">Step 1: Automated Valuation Benchmark</span>
                <p className="text-gray-400 text-xs">
                  Estimated market value S$855,000 computed against recent URA & HDB transactions.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold flex items-center justify-center text-xs shrink-0">
                2
              </div>
              <div>
                <span className="font-semibold text-white block">Step 2: On-Site Condition & Assessment</span>
                <p className="text-gray-400 text-xs">
                  Agent inspection scheduled to finalize listing price to hit target profit.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-white/5 text-gray-500 border border-white/10 font-bold flex items-center justify-center text-xs shrink-0">
                3
              </div>
              <div>
                <span className="font-semibold text-gray-400 block">Step 3: Property Match VIP Balloting</span>
                <p className="text-gray-500 text-xs">
                  Agent arranges priority viewing / showflat ballot pass for your shortlisted EC/BTO units.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenValuation}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.2)] transition"
          >
            Review Profit Projection & Deductions
          </button>
        </div>
      </div>
    </div>
  );
};
