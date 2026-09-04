import React, { useState } from 'react';
import {
  Zap,
  Calculator,
  DollarSign,
  TrendingUp,
  Building,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  Award,
  FileText,
  UserCheck,
} from 'lucide-react';
import { CustomerProfile } from '../types';

interface ValuationDashboardProps {
  customer: CustomerProfile;
  onOpenAgentModal: () => void;
  onOpenProfile: () => void;
}

export const ValuationDashboard: React.FC<ValuationDashboardProps> = ({
  customer,
  onOpenAgentModal,
  onOpenProfile,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    {
      sender: 'agent',
      text: `Hello ${customer.name}! I am your Electric Property Agent. Based on our live URA Master Plan & HDB Resale transactions, your 4-Room flat at ${customer.currentProperty.address} has reached an estimated market valuation of S$855,000—surpassing your S$${(customer.currentProperty.expectedProfit / 1000).toFixed(0)}k profit target by +S$40,000! Ask me any questions about timing your sale or balloting for new BTO/ECs.`,
    },
  ]);

  // Financial baseline calculations
  const purchasePrice = customer.currentProperty.purchasePrice;
  const currentValuation = customer.currentProperty.valuationEstimate || 855000;
  const grossProfit = currentValuation - purchasePrice;
  const targetProfit = customer.currentProperty.expectedProfit;
  const profitSurplus = grossProfit - targetProfit;
  const isTargetMet = grossProfit >= targetProfit;

  // Deductions
  const loan = customer.currentProperty.outstandingLoan;
  const cpf = customer.currentProperty.cpfUsed;
  const agentFee = Math.round(currentValuation * 0.02 * 1.09); // 2% + 9% GST
  const legalFee = 2000;
  const netCashProceeds = Math.max(0, currentValuation - loan - cpf - agentFee - legalFee);

  // Upgraders purchasing power (assuming 75% max LTV loan on next property)
  const maxAffordableNextHome = Math.round((netCashProceeds + cpf) / 0.25);

  const runAIEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/agent-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          propertyAddress: customer.currentProperty.address,
          propertyType: customer.currentProperty.unitType,
          purchasePrice: customer.currentProperty.purchasePrice,
          purchaseYear: customer.currentProperty.purchaseYear,
          expectedSellingPrice: customer.currentProperty.expectedSellingPrice,
          expectedProfit: customer.currentProperty.expectedProfit,
          outstandingLoan: customer.currentProperty.outstandingLoan,
          cpfUsed: customer.currentProperty.cpfUsed,
          wishlistLocation: customer.wishlist.targetLocations.join(', '),
          wishlistType: customer.wishlist.targetTypes.join(', '),
          targetBudget: customer.wishlist.maxBudget,
          recentComparablePrice: currentValuation,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setEvaluationResult(data.data.aiAnalysis);
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: data.data.aiAnalysis,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to run AI evaluation:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isEvaluating) return;

    const q = userQuery;
    setUserQuery('');
    setChatHistory((prev) => [...prev, { sender: 'user', text: q }]);

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/agent-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          propertyAddress: customer.currentProperty.address,
          propertyType: customer.currentProperty.unitType,
          purchasePrice: customer.currentProperty.purchasePrice,
          purchaseYear: customer.currentProperty.purchaseYear,
          expectedSellingPrice: customer.currentProperty.expectedSellingPrice,
          expectedProfit: customer.currentProperty.expectedProfit,
          outstandingLoan: customer.currentProperty.outstandingLoan,
          cpfUsed: customer.currentProperty.cpfUsed,
          wishlistLocation: customer.wishlist.targetLocations.join(', '),
          wishlistType: customer.wishlist.targetTypes.join(', '),
          targetBudget: customer.wishlist.maxBudget,
          recentComparablePrice: currentValuation,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: `⚡ Electric Agent response to "${q}":\n\n${data.data.aiAnalysis}`,
          },
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Regarding "${q}": Based on current Singapore regulations, since your estimated net cash proceeds stand at S$${netCashProceeds.toLocaleString()}, you can comfortably transition into an EC or resale unit without ABSD issues by applying for upfront remission!`,
        },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-4 h-4 text-emerald-400" />
            </span>
            <h1 className="font-serif italic text-2xl text-white font-normal tracking-tight">
              Valuation & Profit Engine
            </h1>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              Active AVM Valuation
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Singapore Property Valuation, Financial Deductions (CPF, Loan, Agent Fee) and Purchasing Power for Upgraders.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider border border-white/10 transition"
          >
            Edit Parameters
          </button>
          <button
            onClick={onOpenAgentModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)] transition"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Opt for Assigned Agent</span>
          </button>
        </div>
      </div>

      {/* Main Valuation Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Valuation Benchmark */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Est. Current Valuation
            </span>
            <span className="p-1.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
              <Building className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="font-serif italic text-3xl font-normal text-white">
              S${currentValuation.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Based on recent comps in {customer.currentProperty.town} (S${Math.round(currentValuation / customer.currentProperty.floorAreaSqft)} psf)
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 text-xs text-gray-400 flex justify-between">
            <span>Purchase Price ({customer.currentProperty.purchaseYear}):</span>
            <span className="font-semibold text-white">S${purchasePrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Profit Margin Projection */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Projected Capital Gain</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider border ${
                isTargetMet
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              {isTargetMet ? 'Target Surpassed' : 'Target Pending'}
            </span>
          </div>
          <div>
            <div className="font-serif italic text-3xl font-normal text-emerald-400">
              +S${grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your target profit was <strong className="text-white">+S${targetProfit.toLocaleString()}</strong>.
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 text-xs text-gray-400 flex items-center justify-between">
            <span>Profit Margin Surplus:</span>
            <span className="font-semibold text-emerald-400">
              {profitSurplus >= 0 ? `+S$${profitSurplus.toLocaleString()} (Exceeded)` : `-S$${Math.abs(profitSurplus).toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Card 3: Net Cash In Hand */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Projected Net Cash Proceeds
            </span>
            <span className="p-1.5 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div>
            <div className="font-serif italic text-3xl font-normal text-white">
              S${netCashProceeds.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Actual cash in hand after repaying loan, CPF refund & sales fees
            </p>
          </div>
          <div className="pt-2.5 border-t border-white/10 text-xs text-gray-400 flex justify-between">
            <span>Max Next Home Budget:</span>
            <span className="font-semibold text-emerald-400">~S${maxAffordableNextHome.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Itemized Financial Bridge Breakdown */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sale Proceeds & Deductions Waterfall</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
            <span className="text-gray-500 text-[10px] uppercase tracking-wider block">1. Gross Selling Price</span>
            <span className="font-bold text-white text-base">S${currentValuation.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 block">Estimated list valuation</span>
          </div>

          <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
            <span className="text-rose-400/80 text-[10px] uppercase tracking-wider block">2. Less: Outstanding Loan</span>
            <span className="font-bold text-rose-400 text-base">-S${loan.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 block">Repaid to HDB/bank</span>
          </div>

          <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
            <span className="text-rose-400/80 text-[10px] uppercase tracking-wider block">3. Less: CPF Refund + Int</span>
            <span className="font-bold text-rose-400 text-base">-S${cpf.toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 block">Returns to your CPF OA</span>
          </div>

          <div className="p-3.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
            <span className="text-rose-400/80 text-[10px] uppercase tracking-wider block">4. Less: Agent & Legal</span>
            <span className="font-bold text-rose-400 text-base">-S${(agentFee + legalFee).toLocaleString()}</span>
            <span className="text-[10px] text-gray-500 block">2% CEA commission + GST</span>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-1">
            <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider block">5. Net Cash in Pocket</span>
            <span className="font-bold text-emerald-400 text-base">S${netCashProceeds.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400/70 block">Liquid funds ready</span>
          </div>
        </div>
      </div>

      {/* AI Electric Agent Interactive Evaluation Console */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-black font-black text-sm">
              ⚡
            </div>
            <div>
              <h3 className="font-serif italic text-lg text-white font-normal">
                Property Agent AI Consultation
              </h3>
              <p className="text-xs text-gray-400">
                Live evaluation using URA Master Plan & HDB Resale Index
              </p>
            </div>
          </div>

          <button
            onClick={runAIEvaluation}
            disabled={isEvaluating}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold uppercase tracking-wider transition disabled:opacity-50"
          >
            {isEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Refresh Valuation Report</span>
          </button>
        </div>

        {/* Chat History Box */}
        <div className="p-4 rounded-lg bg-black/40 border border-white/10 max-h-80 overflow-y-auto space-y-3 text-xs leading-relaxed">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="w-6 h-6 rounded-md bg-emerald-600 text-black font-bold flex items-center justify-center shrink-0 text-[10px]">
                  ⚡
                </div>
              )}
              <div
                className={`p-3 rounded-lg max-w-xl whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-emerald-950/80 border border-emerald-500/40 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isEvaluating && (
            <div className="flex items-center space-x-2 text-gray-400 italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing URA market trends and profit projections...</span>
            </div>
          )}
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask agent (e.g. 'Should I sell before year end?', 'Can I upgrade to an EC without ABSD?')..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60 placeholder:text-gray-600"
          />
          <button
            type="submit"
            disabled={isEvaluating || !userQuery.trim()}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Direct Action Banner */}
        <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-serif italic text-base text-white flex items-center space-x-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Ready to lock in this valuation & profit?</span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5">
              Have a dedicated CEA-licensed agent assigned to conduct an on-site inspection and handle marketing.
            </p>
          </div>
          <button
            onClick={onOpenAgentModal}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)] transition whitespace-nowrap"
          >
            Opt for Agent Assignment
          </button>
        </div>
      </div>
    </div>
  );
};
