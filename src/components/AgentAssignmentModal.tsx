import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Star,
  Award,
  Phone,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building,
  ArrowRight,
} from 'lucide-react';
import { AgentProfile, CustomerProfile } from '../types';
import { CERTIFIED_AGENTS } from '../data/singaporePropertyData';

interface AgentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  onAssignAgent: (agent: AgentProfile, appointmentDate?: string) => void;
}

export const AgentAssignmentModal: React.FC<AgentAssignmentModalProps> = ({
  isOpen,
  onClose,
  customer,
  onAssignAgent,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile>(
    customer.assignedAgent || CERTIFIED_AGENTS[0]
  );
  const [appointmentDate, setAppointmentDate] = useState('2026-09-08');
  const [appointmentTime, setAppointmentTime] = useState('14:00');
  const [consultationType, setConsultationType] = useState<'on_site' | 'virtual'>('on_site');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleConfirmAssignment = () => {
    onAssignAgent(selectedAgent, `${appointmentDate} ${appointmentTime} (${consultationType === 'on_site' ? 'On-site Inspection' : 'Virtual Zoom'})`);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-[#E0E0E0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl font-normal text-white">Opt for Assigned Property Agent</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                CEA-licensed Singapore real estate specialists assigned directly to your property & wishlist
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current Status Banner */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase tracking-widest font-medium">Assignment Request For:</span>
              <span className="font-semibold text-white text-sm">
                {customer.name} ({customer.currentProperty.address})
              </span>
              <span className="text-emerald-400 block text-xs mt-0.5 font-medium">
                Target Profit: +S${customer.currentProperty.expectedProfit.toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                100% Free Consultation
              </span>
            </div>
          </div>

          {/* Select an Agent */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Select Your Dedicated Property Agent</span>
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {CERTIFIED_AGENTS.map((agent) => {
                const isSelected = selectedAgent.id === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/40 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={agent.avatarUrl}
                        alt={agent.name}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-black/40 text-gray-300 border border-white/10">
                            CEA: {agent.ceaRegNo}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-400 font-medium">{agent.agency} • {agent.title}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{agent.specialization}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-400 pt-0.5">
                          <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                            <Star className="w-3 h-3 fill-emerald-400" />
                            <span>{agent.rating} ({agent.reviewCount} reviews)</span>
                          </span>
                          <span>•</span>
                          <span className="text-gray-300">{agent.dealsClosed}+ Closed Deals</span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                          isSelected
                            ? 'bg-emerald-600 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Choose'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Initial Valuation Appointment */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule Valuation & Strategy Session</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Preferred Time</label>
                <select
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="10:00" className="bg-[#0F0F0F]">10:00 AM (Morning)</option>
                  <option value="14:00" className="bg-[#0F0F0F]">02:00 PM (Afternoon)</option>
                  <option value="16:30" className="bg-[#0F0F0F]">04:30 PM (Late Afternoon)</option>
                  <option value="19:30" className="bg-[#0F0F0F]">07:30 PM (Evening)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Meeting Format</label>
                <select
                  value={consultationType}
                  onChange={(e) => setConsultationType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="on_site" className="bg-[#0F0F0F]">On-Site Flat Condition Inspection</option>
                  <option value="virtual" className="bg-[#0F0F0F]">Virtual Zoom Property Consultation</option>
                </select>
              </div>
            </div>
          </div>

          {/* Included Services Guarantee */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1.5">
            <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>What Your Assigned Agent Will Deliver:</span>
            </span>
            <ul className="text-gray-400 space-y-1 pl-5 list-disc text-xs">
              <li>Official on-site physical appraisal & customized URA Master Plan pricing report.</li>
              <li>Balloting strategy & timeline coordination for upcoming BTO launches & ECs.</li>
              <li>Zero upfront fees: Standard CEA 2% commission payable only upon successful completion.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmAssignment}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Confirm Agent Assignment for {selectedAgent.name.split(' ')[0]}</span>
          </button>
        </div>

        {/* Success confirmation */}
        {isSuccess && (
          <div className="absolute inset-0 bg-[#0A0A0A]/95 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif italic text-2xl text-white font-normal">Agent Assigned Successfully!</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              {selectedAgent.name} ({selectedAgent.agency}) has been assigned to your property at{' '}
              {customer.currentProperty.address}. Your appointment is confirmed!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
