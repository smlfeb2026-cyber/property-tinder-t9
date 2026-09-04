import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Table as TableIcon,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  MapPin,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Building,
  BellRing,
  Info,
  SlidersHorizontal,
  Code2,
  RefreshCw,
  Database,
  ExternalLink,
} from 'lucide-react';
import { TransactionRecord, PriceTrendPoint, CustomerProfile, DataGovSgRecord } from '../types';
import { RECENT_TRANSACTIONS, PRICE_TRENDS_DATA } from '../data/singaporePropertyData';
import { fetchHdbResaleFromDataGov, DATASET_ID, DATASET_URL } from '../services/dataGovSgService';
import { DataGovSgCodeModal } from './DataGovSgCodeModal';

interface PriceMonitorProps {
  customer: CustomerProfile;
  onOpenAgentModal: () => void;
  onPinProperty?: (propertyAddress: string) => void;
}

export const PriceMonitor: React.FC<PriceMonitorProps> = ({
  customer,
  onOpenAgentModal,
}) => {
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [selectedTown, setSelectedTown] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyComps, setOnlyComps] = useState(false);
  const [pinnedAddresses, setPinnedAddresses] = useState<string[]>([
    'Blk 249 Bishan St 22',
    'Lumina Grand (EC)',
  ]);
  const [activeSeries, setActiveSeries] = useState<{
    hdb: boolean;
    private: boolean;
    ec: boolean;
    town: boolean;
  }>({
    hdb: true,
    private: true,
    ec: true,
    town: true,
  });

  // Live Data.gov.sg state
  const [liveGovTransactions, setLiveGovTransactions] = useState<TransactionRecord[]>([]);
  const [rawSampleRecord, setRawSampleRecord] = useState<DataGovSgRecord | null>(null);
  const [totalGovCount, setTotalGovCount] = useState<number>(223800);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

  const availableTowns = ['All', 'Bishan', 'Queenstown', 'Ang Mo Kio', 'Kallang/Whampoa', 'Bukit Batok', 'Tampines', 'Punggol', 'Bedok'];
  const availableTypes = ['All', 'HDB Resale', 'URA Private Condo', 'Executive Condo'];

  // Toggle pinned property
  const togglePin = (address: string) => {
    setPinnedAddresses((prev) =>
      prev.includes(address) ? prev.filter((a) => a !== address) : [...prev, address]
    );
  };

  // Fetch live Data.gov.sg transactions
  const loadDataGovFeed = async (townToFetch?: string) => {
    setIsLoadingLive(true);
    try {
      const townParam = townToFetch || (selectedTown === 'All' ? customer.currentProperty.town : selectedTown);
      const res = await fetchHdbResaleFromDataGov({
        town: townParam,
        limit: 60,
        sort: 'month desc',
        customer,
      });

      if (res.success && res.records.length > 0) {
        setLiveGovTransactions(res.records);
        if (res.rawRecords && res.rawRecords.length > 0) {
          setRawSampleRecord(res.rawRecords[0]);
        }
        if (res.total) {
          setTotalGovCount(res.total);
        }
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to load Data.gov.sg transactions:', err);
    } finally {
      setIsLoadingLive(false);
    }
  };

  // Trigger load on mount or town switch
  useEffect(() => {
    loadDataGovFeed(selectedTown === 'All' ? customer.currentProperty.town : selectedTown);
  }, [selectedTown, customer.currentProperty.town]);

  // Combined transactions (Live Data.gov.sg + Curated private/EC benchmark data)
  const combinedTransactions = useMemo(() => {
    if (liveGovTransactions.length === 0) {
      return RECENT_TRANSACTIONS;
    }
    const nonHdbCurated = RECENT_TRANSACTIONS.filter((tx) => tx.propertyType !== 'HDB Resale');
    return [...liveGovTransactions, ...nonHdbCurated];
  }, [liveGovTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return combinedTransactions.filter((tx) => {
      const matchTown = selectedTown === 'All' || tx.town.toLowerCase() === selectedTown.toLowerCase();
      const matchType = selectedType === 'All' || tx.propertyType === selectedType;
      const matchSearch =
        tx.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.town.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.unitType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchComp = !onlyComps || tx.isComparableToUser;
      return matchTown && matchType && matchSearch && matchComp;
    });
  }, [combinedTransactions, selectedTown, selectedType, searchQuery, onlyComps]);

  // Customer target metrics
  const targetPsf = Math.round(
    customer.currentProperty.expectedSellingPrice / customer.currentProperty.floorAreaSqft
  );
  const purchasePsf = Math.round(
    customer.currentProperty.purchasePrice / customer.currentProperty.floorAreaSqft
  );

  // Graph calculations
  const maxPsf = 2700;
  const minPsf = 500;
  const svgHeight = 240;
  const svgWidth = 680;

  const getY = (val: number) => {
    return svgHeight - ((val - minPsf) / (maxPsf - minPsf)) * (svgHeight - 40) - 20;
  };

  const getX = (index: number, total: number) => {
    return 40 + (index / (total - 1)) * (svgWidth - 80);
  };

  // Build SVG path strings
  const generatePath = (key: keyof PriceTrendPoint) => {
    return PRICE_TRENDS_DATA.map((pt, i) => {
      const x = getX(i, PRICE_TRENDS_DATA.length);
      const y = getY(pt[key] as number);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h1 className="font-serif italic text-2xl text-white font-normal tracking-tight">
              Property Price Monitor
            </h1>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              URA & HDB Feed
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Real-time transacted sale prices for selected properties and targeted planning areas in Singapore.
          </p>
        </div>

        {/* View Toggle (Graph vs Table) */}
        <div className="flex items-center space-x-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
          <button
            id="btn-view-graph"
            onClick={() => setViewMode('graph')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-semibold transition ${
              viewMode === 'graph'
                ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>Trend Graph</span>
          </button>
          <button
            id="btn-view-table"
            onClick={() => setViewMode('table')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs uppercase tracking-wider font-semibold transition ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-black font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Target Profit Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-sm bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs uppercase tracking-wider">
            {customer.currentProperty.town.slice(0, 3).toUpperCase()}
          </div>
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Monitored Unit</div>
            <div className="text-white font-medium truncate max-w-[180px]">
              {customer.currentProperty.address}
            </div>
            <div className="text-gray-400 text-[10px] uppercase tracking-wider">
              Bought @ S${customer.currentProperty.purchasePrice.toLocaleString()} (S${purchasePsf} psf)
            </div>
          </div>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
          <div className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Expected Selling Target</div>
          <div className="text-white font-serif italic text-lg font-medium">
            S${customer.currentProperty.expectedSellingPrice.toLocaleString()}
          </div>
          <div className="text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Target Profit: +S${customer.currentProperty.expectedProfit.toLocaleString()}</span>
          </div>
        </div>

        <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4 flex flex-col justify-between">
          <div>
            <div className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Recent Comparable Transacted</div>
            <div className="text-emerald-400 font-bold text-base flex items-center space-x-1.5">
              <span>S$858,000</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                +S$18k Over Target
              </span>
            </div>
          </div>
          <button
            onClick={onOpenAgentModal}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1 mt-1"
          >
            <span>Assign Agent to Lock In Valuation &rarr;</span>
          </button>
        </div>
      </div>

      {/* Official Data.gov.sg API Live Connection Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 text-xs shadow-[0_0_15px_rgba(16,185,129,0.05)]">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white flex items-center space-x-1">
              <span>Data.gov.sg Feed</span>
            </span>
          </div>
          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-white/5 border border-white/10 text-emerald-400">
            dataset_id: {DATASET_ID}
          </span>
          <span className="text-[11px] text-gray-400">
            • {liveGovTransactions.length > 0 ? `${liveGovTransactions.length} Live Records Synced` : 'Connecting...'}
            {lastSyncTime && ` (${lastSyncTime})`}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsCodeModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-[11px] font-semibold uppercase tracking-wider transition"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Inspect Python API Code</span>
          </button>
          <button
            type="button"
            onClick={() => loadDataGovFeed()}
            disabled={isLoadingLive}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[11px] uppercase tracking-wider transition shadow-[0_0_12px_rgba(16,185,129,0.25)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLive ? 'animate-spin' : ''}`} />
            <span>{isLoadingLive ? 'Querying...' : 'Sync Live Data'}</span>
          </button>
        </div>
      </div>

      {/* GRAPH VIEW */}
      {viewMode === 'graph' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
          {/* Graph Legend & Series Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Toggle Series:</span>
              <button
                onClick={() => setActiveSeries((s) => ({ ...s, private: !s.private }))}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wider transition ${
                  activeSeries.private
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300 font-bold'
                    : 'bg-black/30 border-white/10 text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>URA Condos (S$2,510 psf)</span>
              </button>

              <button
                onClick={() => setActiveSeries((s) => ({ ...s, ec: !s.ec }))}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wider transition ${
                  activeSeries.ec
                    ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 font-bold'
                    : 'bg-black/30 border-white/10 text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Executive Condos (S$1,485 psf)</span>
              </button>

              <button
                onClick={() => setActiveSeries((s) => ({ ...s, town: !s.town }))}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wider transition ${
                  activeSeries.town
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                    : 'bg-black/30 border-white/10 text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{customer.currentProperty.town} Comps (S$788 psf)</span>
              </button>

              <button
                onClick={() => setActiveSeries((s) => ({ ...s, hdb: !s.hdb }))}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wider transition ${
                  activeSeries.hdb
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 font-bold'
                    : 'bg-black/30 border-white/10 text-gray-500'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>HDB Resale Index (S$678 psf)</span>
              </button>
            </div>

            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Updated URA/HDB Q1 2026 Data</span>
            </div>
          </div>

          {/* SVG Price Trend Chart */}
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight + 40}`}
              className="w-full h-72 sm:h-80 select-none"
            >
              {/* Horizontal Gridlines */}
              {[600, 1000, 1500, 2000, 2500].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1="40"
                      y1={y}
                      x2={svgWidth - 40}
                      y2={y}
                      stroke="#262626"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text x="35" y={y + 4} fill="#525252" fontSize="10" textAnchor="end" fontFamily="monospace">
                      S${val}
                    </text>
                  </g>
                );
              })}

              {/* Target Price Threshold Line (User's Expected PSF) */}
              <line
                x1="40"
                y1={getY(targetPsf)}
                x2={svgWidth - 40}
                y2={getY(targetPsf)}
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
              <text
                x={svgWidth - 42}
                y={getY(targetPsf) - 6}
                fill="#10b981"
                fontSize="10"
                fontWeight="bold"
                textAnchor="end"
              >
                Target Threshold: S${targetPsf} psf
              </text>

              {/* Trend Lines */}
              {activeSeries.private && (
                <path
                  d={generatePath('uraPrivateAvgPsf')}
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
              {activeSeries.ec && (
                <path
                  d={generatePath('ecAvgPsf')}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
              {activeSeries.town && (
                <path
                  d={generatePath('townAveragePsf')}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              {activeSeries.hdb && (
                <path
                  d={generatePath('hdbResaleAvgPsf')}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Data points & tooltips on the town series */}
              {activeSeries.town &&
                PRICE_TRENDS_DATA.map((pt, idx) => {
                  const x = getX(idx, PRICE_TRENDS_DATA.length);
                  const y = getY(pt.townAveragePsf);
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="4.5" fill="#10b981" stroke="#000" strokeWidth="2" />
                      {idx === PRICE_TRENDS_DATA.length - 1 && (
                        <text
                          x={x}
                          y={y - 10}
                          fill="#10b981"
                          fontSize="11"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          S${pt.townAveragePsf} psf
                        </text>
                      )}
                    </g>
                  );
                })}

              {/* X Axis Periods */}
              {PRICE_TRENDS_DATA.map((pt, idx) => {
                const x = getX(idx, PRICE_TRENDS_DATA.length);
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight + 25}
                    fill="#737373"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {pt.period}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Key Insights Callout */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs flex items-start space-x-3">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Price Velocity & Margin Analysis
              </span>
              <p className="text-gray-400 leading-relaxed">
                Over the past 8 quarters, {customer.currentProperty.town} 4-Room resale prices have risen{' '}
                <strong className="text-emerald-400">+10.9%</strong> from S$710 psf to S$788 psf.
                Comparable blocks along Bishan St 22 recently transacted between{' '}
                <strong className="text-white">S$845,000 to S$865,000</strong>.
                This firmly satisfies your expected profit threshold of{' '}
                <strong className="text-emerald-400">+S${customer.currentProperty.expectedProfit.toLocaleString()}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW & FILTER CONTROLS */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        {/* Table Filters Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Town Selector */}
            <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={selectedTown}
                onChange={(e) => setSelectedTown(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                {availableTowns.map((t) => (
                  <option key={t} value={t} className="bg-[#0F0F0F]">
                    {t === 'All' ? 'All Towns' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Selector */}
            <div className="flex items-center space-x-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-xs">
              <Building className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-white focus:outline-none text-xs"
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t} className="bg-[#0F0F0F]">
                    {t === 'All' ? 'All Property Types' : t}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Comps Toggle */}
            <button
              onClick={() => setOnlyComps(!onlyComps)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition flex items-center space-x-1.5 ${
                onlyComps
                  ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                  : 'bg-black/40 border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Comps Only</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search block, street, condo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* The Transacted Records Table */}
        <div className="overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-black/60 text-gray-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Address / Project</th>
                <th className="py-3 px-4">Town</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Floor Level</th>
                <th className="py-3 px-4 text-right">Transacted Price</th>
                <th className="py-3 px-4 text-right">PSF</th>
                <th className="py-3 px-4 text-center">Profit vs Target</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isPinned = pinnedAddresses.includes(tx.address);
                  const priceDiff = tx.price - customer.currentProperty.expectedSellingPrice;
                  const isExceeding = priceDiff >= 0;

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-white/5 transition ${
                        tx.isComparableToUser ? 'bg-emerald-950/15' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-gray-500">{tx.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center space-x-1.5 flex-wrap gap-1">
                          <span>{tx.address}</span>
                          {tx.isLiveGovData && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[8px] uppercase tracking-wider font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40">
                              GOV.SG LIVE
                            </span>
                          )}
                          {tx.isComparableToUser && (
                            <span className="px-1.5 py-0.2 rounded-sm text-[8px] uppercase tracking-wider font-bold bg-emerald-600 text-black">
                              DIRECT COMP
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {tx.unitType} • {tx.areaSqft} sqft ({tx.remainingLeaseYears} yrs lease)
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{tx.town}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider font-semibold ${
                            tx.propertyType === 'HDB Resale'
                              ? 'bg-blue-950/40 text-blue-300 border border-blue-500/20'
                              : tx.propertyType === 'Executive Condo'
                              ? 'bg-purple-950/40 text-purple-300 border border-purple-500/20'
                              : 'bg-rose-950/40 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          {tx.propertyType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{tx.storeyRange}</td>
                      <td className="py-3 px-4 text-right font-bold text-white text-sm">
                        S${tx.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-300">
                        S${tx.psf}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-bold ${
                            isExceeding
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}
                        >
                          <span>
                            {isExceeding ? `+S$${(priceDiff / 1000).toFixed(0)}k Over` : `S$${Math.abs(priceDiff / 1000).toFixed(0)}k Under`}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => togglePin(tx.address)}
                          className={`p-1.5 rounded-md border transition ${
                            isPinned
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                              : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
                          }`}
                          title={isPinned ? 'Unpin from price monitor' : 'Pin to price monitor & alert'}
                        >
                          {isPinned ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No transactions match your current filters. Try changing town or searching another estate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 pt-2">
          <div className="flex items-center space-x-2">
            <span>Showing {filteredTransactions.length} records</span>
            {liveGovTransactions.length > 0 && (
              <span className="text-emerald-400 font-semibold">
                ({liveGovTransactions.length} directly from Data.gov.sg {DATASET_ID})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold uppercase tracking-wider text-[11px] flex items-center space-x-1"
            >
              <Code2 className="w-3 h-3" />
              <span>Python & API Details</span>
            </button>
            <span>Pinned for instant alerts: <strong className="text-white">{pinnedAddresses.length} properties</strong></span>
          </div>
        </div>
      </div>

      {/* Python Data Code & Live API Inspector Modal */}
      <DataGovSgCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        rawSampleRecord={rawSampleRecord}
        totalRecordsCount={totalGovCount}
        lastSyncedTime={lastSyncTime}
        onRefreshLiveFeed={() => loadDataGovFeed()}
        isLoading={isLoadingLive}
      />
    </div>
  );
};
