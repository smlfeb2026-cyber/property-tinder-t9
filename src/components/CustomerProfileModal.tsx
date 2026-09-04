import React, { useState } from 'react';
import { X, Save, Building, DollarSign, MapPin, Sparkles, CheckCircle2, User } from 'lucide-react';
import { CustomerProfile, PropertyType } from '../types';
import { ALTERNATIVE_CUSTOMERS } from '../data/singaporePropertyData';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  onSaveCustomer: (updated: CustomerProfile) => void;
}

const SG_TOWNS = [
  'Bishan',
  'Queenstown',
  'Kallang/Whampoa',
  'Bukit Merah',
  'Toa Payoh',
  'Tampines',
  'Bedok',
  'Bukit Batok',
  'Punggol',
  'Woodlands',
  'Clementi',
  'Jurong East',
  'Central',
];

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onSaveCustomer,
}) => {
  const [formData, setFormData] = useState<CustomerProfile>(customer);
  const [successToast, setSuccessToast] = useState(false);

  if (!isOpen) return null;

  const handleCurrentPropertyChange = (field: keyof CustomerProfile['currentProperty'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      currentProperty: {
        ...prev.currentProperty,
        [field]: value,
      },
    }));
  };

  const handleWishlistChange = (field: keyof CustomerProfile['wishlist'], value: any) => {
    setFormData((prev) => ({
      ...prev,
      wishlist: {
        ...prev.wishlist,
        [field]: value,
      },
    }));
  };

  const toggleTargetType = (type: PropertyType) => {
    const current = formData.wishlist.targetTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    if (next.length > 0) {
      handleWishlistChange('targetTypes', next);
    }
  };

  const toggleTargetTown = (town: string) => {
    const current = formData.wishlist.targetLocations;
    const next = current.includes(town)
      ? current.filter((t) => t !== town)
      : [...current, town];
    if (next.length > 0) {
      handleWishlistChange('targetLocations', next);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomer(formData);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 900);
  };

  const loadPreset = (preset: CustomerProfile) => {
    setFormData(preset);
  };

  // Calculation previews
  const purchasePrice = Number(formData.currentProperty.purchasePrice) || 0;
  const expSelling = Number(formData.currentProperty.expectedSellingPrice) || 0;
  const calcGrossGain = expSelling - purchasePrice;
  const loan = Number(formData.currentProperty.outstandingLoan) || 0;
  const cpf = Number(formData.currentProperty.cpfUsed) || 0;
  const agentCommission = Math.round(expSelling * 0.02 * 1.09);
  const approxNetCash = Math.max(0, expSelling - loan - cpf - agentCommission - 2000);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-[#E0E0E0] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif italic text-xl font-normal text-white">Registered Customer Parameters</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Homeowner details, current property valuation baselines & next home wishlist
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

        {/* Quick preset selector */}
        <div className="px-6 py-3 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="uppercase tracking-wider font-semibold text-[10px]">Switch Preset Homeowner:</span>
          </span>
          <div className="flex items-center space-x-2">
            {ALTERNATIVE_CUSTOMERS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                className={`px-2.5 py-1 rounded-md transition border text-[10px] uppercase tracking-wider font-semibold ${
                  formData.id === preset.id
                    ? 'bg-emerald-600 text-black border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 border-white/10 hover:text-white'
                }`}
              >
                {preset.name.split(' ')[0]} ({preset.currentProperty.town})
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Customer Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <span>1. Homeowner Contact & Identity</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Customer Name(s)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Current Property Parameters */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>2. Current Property Parameters (For Sale)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Property Address</label>
                <input
                  type="text"
                  value={formData.currentProperty.address}
                  onChange={(e) => handleCurrentPropertyChange('address', e.target.value)}
                  placeholder="e.g. Blk 248 Bishan Street 22"
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Town / Estate Location</label>
                <select
                  value={formData.currentProperty.town}
                  onChange={(e) => handleCurrentPropertyChange('town', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                >
                  {SG_TOWNS.map((town) => (
                    <option key={town} value={town} className="bg-[#0F0F0F]">
                      {town}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Unit Model / Type</label>
                <input
                  type="text"
                  value={formData.currentProperty.unitType}
                  onChange={(e) => handleCurrentPropertyChange('unitType', e.target.value)}
                  placeholder="4-Room HDB"
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Floor Area (Sqft)</label>
                <input
                  type="number"
                  value={formData.currentProperty.floorAreaSqft}
                  onChange={(e) => handleCurrentPropertyChange('floorAreaSqft', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Purchase Year</label>
                <input
                  type="number"
                  value={formData.currentProperty.purchaseYear}
                  onChange={(e) => handleCurrentPropertyChange('purchaseYear', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Remaining Lease (Yrs)</label>
                <input
                  type="number"
                  value={formData.currentProperty.remainingLeaseYears}
                  onChange={(e) => handleCurrentPropertyChange('remainingLeaseYears', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>
            </div>

            {/* Financial Parameters */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center justify-between">
                    <span>Original Purchase Price (S$)</span>
                    <span className="text-[10px] text-gray-500">Paid in {formData.currentProperty.purchaseYear}</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                    <input
                      type="number"
                      value={formData.currentProperty.purchasePrice}
                      onChange={(e) => handleCurrentPropertyChange('purchasePrice', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center justify-between">
                    <span className="text-white font-semibold">Expected Selling Price (S$)</span>
                    <span className="text-[10px] text-gray-400">Target list price</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                    <input
                      type="number"
                      value={formData.currentProperty.expectedSellingPrice}
                      onChange={(e) => handleCurrentPropertyChange('expectedSellingPrice', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-emerald-500/40 text-xs focus:outline-none focus:border-emerald-400 text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">Expected Profit Through Sale (S$)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                    <input
                      type="number"
                      value={formData.currentProperty.expectedProfit}
                      onChange={(e) => handleCurrentPropertyChange('expectedProfit', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-emerald-500/50 text-xs focus:outline-none focus:border-emerald-400 text-emerald-300"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Outstanding Loan Balance (S$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                    <input
                      type="number"
                      value={formData.currentProperty.outstandingLoan}
                      onChange={(e) => handleCurrentPropertyChange('outstandingLoan', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    CPF Principal + Accrued Int (S$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                    <input
                      type="number"
                      value={formData.currentProperty.cpfUsed}
                      onChange={(e) => handleCurrentPropertyChange('cpfUsed', Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/60 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Math Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Gross Capital Gain:</span>
                  <span className="font-semibold text-emerald-400">+S${calcGrossGain.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Profit Target:</span>
                  <span className="font-semibold text-white">
                    S${formData.currentProperty.expectedProfit.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Est. Net Cash in Hand:</span>
                  <span className="font-semibold text-white">~S${approxNetCash.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Status:</span>
                  <span className={`font-semibold ${calcGrossGain >= formData.currentProperty.expectedProfit ? 'text-emerald-400' : 'text-gray-400'}`}>
                    {calcGrossGain >= formData.currentProperty.expectedProfit ? 'Target Surpassed ⚡' : 'Target Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Wishlist (For Buying / Matchmaking) */}
          <div className="space-y-3 pt-3 border-t border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>3. Wishlist For Next Property (Property Tinder Filters)</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Target Property Types (select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'bto' as PropertyType, label: 'New Launch BTO (Standard / Plus / Prime)' },
                  { id: 'ec' as PropertyType, label: 'Executive Condominium (EC)' },
                  { id: 'hdb_resale' as PropertyType, label: 'HDB Resale Flat' },
                  { id: 'private_condo' as PropertyType, label: 'URA Private Condo' },
                ].map((item) => {
                  const selected = formData.wishlist.targetTypes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleTargetType(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition ${
                        selected
                          ? 'bg-emerald-600 text-black border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                      }`}
                    >
                      {selected && '✓ '}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Preferred Locations & Towns (URA Planning Areas)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SG_TOWNS.map((town) => {
                  const selected = formData.wishlist.targetLocations.includes(town);
                  return (
                    <button
                      key={town}
                      type="button"
                      onClick={() => toggleTargetTown(town)}
                      className={`px-2.5 py-1 rounded-md text-xs transition border ${
                        selected
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 font-semibold'
                          : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {selected ? `✓ ${town}` : `+ ${town}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Maximum Target Budget (S$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-xs">S$</span>
                  <input
                    type="number"
                    value={formData.wishlist.maxBudget}
                    onChange={(e) => handleWishlistChange('maxBudget', Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Expected Timeline</label>
                <select
                  value={formData.wishlist.expectedTimeline}
                  onChange={(e) => handleWishlistChange('expectedTimeline', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                >
                  <option value="immediate" className="bg-[#0F0F0F]">Immediate (Ready Resale / TOP)</option>
                  <option value="3_to_6_months" className="bg-[#0F0F0F]">Within 3 to 6 Months</option>
                  <option value="1_year" className="bg-[#0F0F0F]">Within 1 Year</option>
                  <option value="bto_launch" className="bg-[#0F0F0F]">New Launch BTO / EC Balloting (3-4 years construction)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-gray-400 hover:text-white text-xs uppercase tracking-wider font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Homeowner Parameters</span>
            </button>
          </div>
        </form>

        {/* Success Toast */}
        {successToast && (
          <div className="absolute inset-x-0 bottom-4 mx-auto w-max px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-xl animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Parameters saved successfully! Updating matches & monitors...</span>
          </div>
        )}
      </div>
    </div>
  );
};
