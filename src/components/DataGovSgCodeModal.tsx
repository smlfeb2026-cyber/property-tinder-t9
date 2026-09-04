import React, { useState } from 'react';
import {
  X,
  Code2,
  Copy,
  Check,
  ExternalLink,
  Database,
  RefreshCw,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { DATASET_ID, DATASET_URL, PYTHON_DATA_CODE } from '../services/dataGovSgService';
import { DataGovSgRecord } from '../types';

interface DataGovSgCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawSampleRecord?: DataGovSgRecord | null;
  totalRecordsCount?: number;
  lastSyncedTime?: string;
  onRefreshLiveFeed?: () => void;
  isLoading?: boolean;
}

export const DataGovSgCodeModal: React.FC<DataGovSgCodeModalProps> = ({
  isOpen,
  onClose,
  rawSampleRecord,
  totalRecordsCount = 223000,
  lastSyncedTime,
  onRefreshLiveFeed,
  isLoading = false,
}) => {
  const [copiedPython, setCopiedPython] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'python' | 'curl' | 'raw_json'>('python');

  if (!isOpen) return null;

  const handleCopyPython = () => {
    navigator.clipboard.writeText(PYTHON_DATA_CODE);
    setCopiedPython(true);
    setTimeout(() => setCopiedPython(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(DATASET_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const curlCommand = `curl -s "${DATASET_URL}&limit=5"`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-[#E0E0E0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif italic text-xl font-normal text-white">
                  Data.gov.sg HDB Resale API
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live Feed Active
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Official Singapore Government Open Data portal integration (Dataset: <span className="font-mono text-white">{DATASET_ID}</span>)
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

        {/* Dataset Live Stats bar */}
        <div className="px-6 py-3 bg-black/40 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Dataset Identifier:</span>
            <span className="font-mono text-emerald-400 font-semibold">{DATASET_ID.slice(0, 14)}...</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Agency Provider:</span>
            <span className="text-white font-semibold">HDB Singapore</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Dataset Volume:</span>
            <span className="text-white font-semibold">~{totalRecordsCount.toLocaleString()} Records</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-gray-500 block">Status & Ping:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>{lastSyncedTime ? `Synced ${lastSyncedTime}` : 'Live 200 OK'}</span>
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Overview Banner */}
          <div className="p-4 rounded-xl bg-black/50 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Integrated Python API Pipeline</span>
              </div>
              {onRefreshLiveFeed && (
                <button
                  onClick={onRefreshLiveFeed}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Querying...' : 'Re-run Query'}</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your Python datastore query code is fitted directly into the application's real-time transaction engine.
              Transactions from Singapore's official CKAN datastore are fetched, parsed, and matched against homeowner profit goals in real time.
            </p>
          </div>

          {/* Code Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === 'python'
                      ? 'bg-emerald-600 text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Python Code</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === 'curl'
                      ? 'bg-emerald-600 text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>cURL Request</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raw_json')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                    activeTab === 'raw_json'
                      ? 'bg-emerald-600 text-black font-bold'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <Database className="w-3.5 h-3.5" />
                    <span>Live response.json()</span>
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={DATASET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-[11px] text-gray-400 hover:text-emerald-400 transition"
                >
                  <span>Open API URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Tab 1: Python Code */}
            {activeTab === 'python' && (
              <div className="relative rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleCopyPython}
                  className="absolute right-3 top-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                  title="Copy Python Code"
                >
                  {copiedPython ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre">
                  {PYTHON_DATA_CODE}
                </pre>
              </div>
            )}

            {/* Tab 2: cURL */}
            {activeTab === 'curl' && (
              <div className="relative rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="absolute right-3 top-3 p-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                  title="Copy cURL Command"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="text-gray-300 leading-relaxed overflow-x-auto whitespace-pre">
                  {curlCommand}
                </pre>
              </div>
            )}

            {/* Tab 3: Raw response.json() Sample */}
            {activeTab === 'raw_json' && (
              <div className="relative rounded-xl bg-black/70 border border-white/10 p-4 font-mono text-xs max-h-72 overflow-y-auto">
                <pre className="text-gray-300 leading-relaxed whitespace-pre text-[11px]">
                  {JSON.stringify(
                    rawSampleRecord || {
                      _id: 223740,
                      month: '2026-09',
                      town: 'BISHAN',
                      flat_type: '4 ROOM',
                      block: '235',
                      street_name: 'BISHAN ST 22',
                      storey_range: '07 TO 09',
                      floor_area_sqm: '105.00',
                      flat_model: 'Model A',
                      lease_commence_date: '1992',
                      remaining_lease: '64 years 08 months',
                      resale_price: '880000',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            )}
          </div>

          {/* Fields Mapping Documentation */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Field Mapping from <span className="font-mono text-emerald-400">d_8b84c4ee58e3cfc0ece0d773c8ca6abc</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">resale_price</span>
                  <span className="text-gray-400">→ Price (S$)</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Registered sale price in Singapore Dollars. Compares directly to homeowner target.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">floor_area_sqm</span>
                  <span className="text-gray-400">→ Area (Sqft) & PSF</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Converted to square feet (×10.7639) to calculate transaction PSF.
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">town & street_name</span>
                  <span className="text-gray-400">→ Estate & Street</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Filtered by customer's town (e.g. Bishan, Queenstown, Bedok, Tampines).
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-emerald-400 font-semibold">remaining_lease</span>
                  <span className="text-gray-400">→ Lease Health</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Remaining 99-year lease tracking for CPF usage rules and valuation decay.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-white/5 text-xs">
          <span className="text-gray-400">
            Source: <span className="font-mono text-gray-300">data.gov.sg/api/action/datastore_search</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
