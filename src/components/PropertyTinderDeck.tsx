import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  X,
  Zap,
  Sparkles,
  MapPin,
  TrendingUp,
  DollarSign,
  Building,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { PropertyCard, CustomerProfile } from '../types';

interface PropertyTinderDeckProps {
  properties: PropertyCard[];
  customer: CustomerProfile;
  onShortlistProperty: (property: PropertyCard) => void;
  onPassProperty: (property: PropertyCard) => void;
  onOptForAgent: (property?: PropertyCard) => void;
  shortlistedProperties: PropertyCard[];
}

export const PropertyTinderDeck: React.FC<PropertyTinderDeckProps> = ({
  properties,
  customer,
  onShortlistProperty,
  onPassProperty,
  onOptForAgent,
  shortlistedProperties,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [matchModalProperty, setMatchModalProperty] = useState<PropertyCard | null>(null);
  const [viewDetailModal, setViewDetailModal] = useState<PropertyCard | null>(null);

  // Filter properties based on customer wishlist or show all ranked
  const activeDeck = properties;
  const currentCard = activeDeck[currentIndex];

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentCard) return;

    setSwipeDirection(direction);

    if (direction === 'right' || direction === 'up') {
      onShortlistProperty(currentCard);
      if (currentCard.matchScore >= 88 || direction === 'up') {
        setMatchModalProperty(currentCard);
      }
    } else {
      onPassProperty(currentCard);
    }

    setTimeout(() => {
      setSwipeDirection(null);
      setCurrentIndex((prev) => prev + 1);
    }, 280);
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  // Profit unlocking metrics
  const homeownerNetProceeds = Math.max(
    0,
    customer.currentProperty.expectedSellingPrice -
      customer.currentProperty.outstandingLoan -
      customer.currentProperty.cpfUsed -
      Math.round(customer.currentProperty.expectedSellingPrice * 0.02 * 1.09) -
      2000
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Tinder Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-5 rounded-xl border border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1.5 rounded-sm bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
              <Heart className="w-4 h-4 fill-emerald-400" />
            </span>
            <h1 className="font-serif italic text-2xl text-white font-normal tracking-tight">Property Matchmaker</h1>
            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
            Matching new BTO launches, upcoming ECs & Prime Resales directly against your current property profit margin.
          </p>
        </div>

        {/* Quick profit baseline pill */}
        <div className="flex items-center space-x-3 bg-black/40 px-4 py-2.5 rounded-lg border border-white/10 text-xs">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Target Profit Margin</div>
            <div className="font-bold text-emerald-400 text-sm">
              +S${(customer.currentProperty.expectedProfit / 1000).toFixed(0)}k
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Est. Net Cash in Hand</div>
            <div className="font-bold text-white text-sm">
              ~S${(homeownerNetProceeds / 1000).toFixed(0)}k
            </div>
          </div>
        </div>
      </div>

      {/* Main Tinder Card Deck */}
      <div className="relative flex flex-col items-center justify-center min-h-[560px]">
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={currentCard.id}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                x: swipeDirection === 'left' ? -350 : swipeDirection === 'right' ? 350 : 0,
                rotate: swipeDirection === 'left' ? -18 : swipeDirection === 'right' ? 18 : 0,
              }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.28 }}
              className="w-full max-w-lg bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden text-[#E0E0E0] flex flex-col"
            >
              {/* Image & Badges */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
                <img
                  src={currentCard.imageUrl}
                  alt={currentCard.name}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/30 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-sm text-[10px] uppercase tracking-widest font-bold backdrop-blur-md border border-white/20 bg-black/70 text-white">
                    {currentCard.badgeLabel}
                  </span>

                  {/* Match Score Badge */}
                  <div className="flex items-center space-x-1.5 px-3 py-1 rounded-sm bg-black/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{currentCard.matchScore}% Match</span>
                  </div>
                </div>

                {/* Bottom Overlay Info on Image */}
                <div className="absolute bottom-3 inset-x-4">
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{currentCard.mrtDistance}</span>
                  </div>
                  <h2 className="font-serif italic text-2xl font-normal text-white drop-shadow-sm mt-0.5">
                    {currentCard.name}
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{currentCard.town} ({currentCard.region})</span>
                    <span>•</span>
                    <span>{currentCard.bedrooms} Beds</span>
                    <span>•</span>
                    <span>{currentCard.floorAreaSqft} sqft (S${currentCard.pricePerSqft} psf)</span>
                  </div>
                </div>
              </div>

              {/* Card Body & Match Breakdown */}
              <div className="p-5 space-y-4 flex-1">
                {/* Price & Projected Capital Upside */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-[10px] uppercase font-medium tracking-widest text-gray-500 block">
                      Launch / List Price
                    </span>
                    <span className="text-lg font-bold text-white">
                      S${currentCard.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Downpayment: S${currentCard.downpaymentRequired.toLocaleString()}
                    </span>
                  </div>

                  <div className="border-l border-white/10 pl-3">
                    <span className="text-[10px] uppercase font-medium tracking-widest text-emerald-400 flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Projected MOP Upside</span>
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      +S${currentCard.projectedMOPUpside.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-400/90 block font-medium mt-0.5">
                      +{currentCard.projectedUpsidePercent}% Capital Yield
                    </span>
                  </div>
                </div>

                {/* Profit Bridging: How your current sale covers this */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-emerald-500/20 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-400">
                    <span className="flex items-center space-x-1.5 uppercase tracking-wider text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profit Bridging Analysis</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-500/30">
                      {homeownerNetProceeds >= currentCard.downpaymentRequired
                        ? '100% Covered ✓'
                        : 'Partial Coverage'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    Selling your {customer.currentProperty.unitType} at {customer.currentProperty.town} yields approx{' '}
                    <strong className="text-white">S${homeownerNetProceeds.toLocaleString()}</strong> net proceeds.
                    This covers <strong className="text-white">S${currentCard.downpaymentRequired.toLocaleString()}</strong> downpayment with{' '}
                    <strong className="text-emerald-400">
                      S${Math.max(0, homeownerNetProceeds - currentCard.downpaymentRequired).toLocaleString()}
                    </strong>{' '}
                    surplus cash liquidity remaining!
                  </p>
                </div>

                {/* URA Master Plan Key Highlights */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-emerald-400" />
                    <span>URA Master Plan Zoning & Catalysts</span>
                  </div>
                  <p className="text-xs text-gray-300 italic">
                    "{currentCard.uraZoning}"
                  </p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {currentCard.uraMasterPlanHighlights.slice(0, 2).map((highlight, idx) => (
                      <li key={idx} className="flex items-start space-x-1.5">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Match Reasons */}
                <div className="pt-2 border-t border-white/10">
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.matchReasons.map((reason, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-sm bg-white/5 text-gray-300 text-[11px] border border-white/10 flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{reason}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tinder Action Buttons */}
              <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-around">
                {/* Swipe Left / Pass */}
                <button
                  id="btn-tinder-pass"
                  onClick={() => handleSwipe('left')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-400 flex items-center justify-center transition shadow-md active:scale-95"
                  title="Pass (Swipe Left)"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Electric Super Match / Instant Agent */}
                <button
                  id="btn-tinder-super"
                  onClick={() => handleSwipe('up')}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition active:scale-95"
                  title="Super Like & Assign Agent"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Super Match</span>
                </button>

                {/* Swipe Right / Match */}
                <button
                  id="btn-tinder-match"
                  onClick={() => handleSwipe('right')}
                  className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 flex items-center justify-center transition shadow-md active:scale-95"
                  title="Match / Shortlist (Swipe Right)"
                >
                  <Heart className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* Empty deck state */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-8 bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-md w-full space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif italic text-2xl text-white">All Properties Swiped</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                You have reviewed all current BTO, EC & Resale opportunities matching your parameters.
                You can reload the deck or review your shortlisted matches below.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider border border-white/10 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rewind Cards</span>
                </button>
                <button
                  onClick={() => onOptForAgent()}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)] transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Assign Agent</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shortlisted Matches Tray */}
      {shortlistedProperties.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <h3 className="font-serif italic text-xl text-white">Shortlisted Matches</h3>
              <span className="px-2 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                {shortlistedProperties.length} Saved
              </span>
            </div>
            <button
              onClick={() => onOptForAgent()}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold uppercase tracking-wider flex items-center space-x-1"
            >
              <span>Assign Agent for Matches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {shortlistedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-[#0F0F0F] border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/40 transition group flex flex-col"
              >
                <div className="relative h-28 w-full bg-black">
                  <img src={prop.imageUrl} alt={prop.name} className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition" />
                  <span className="absolute top-2 left-2 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm bg-black/80 text-white backdrop-blur-sm border border-white/10">
                    {prop.badgeLabel}
                  </span>
                  <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-600 text-black">
                    {prop.matchScore}%
                  </span>
                </div>
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif italic text-base text-white group-hover:text-emerald-400 transition truncate">
                      {prop.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">{prop.town} • S${prop.price.toLocaleString()}</p>
                    <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                      Projected Gain: +S${prop.projectedMOPUpside.toLocaleString()}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setViewDetailModal(prop)}
                      className="text-gray-400 hover:text-white text-[10px] uppercase tracking-wider"
                    >
                      View Specs
                    </button>
                    <button
                      onClick={() => onOptForAgent(prop)}
                      className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-wider transition"
                    >
                      Assign Agent
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Match Score Celebration Modal */}
      {matchModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0F0F0F] border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl relative"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/50 mx-auto flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <Zap className="w-7 h-7 text-emerald-400 fill-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                ⚡ Prime Match Detected
              </span>
              <h3 className="font-serif italic text-2xl text-white">{matchModalProperty.name}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Match score: <strong className="text-emerald-400">{matchModalProperty.matchScore}%</strong>.
                Your current property profit unlocks this unit effortlessly with{' '}
                <strong className="text-emerald-400">
                  +S${matchModalProperty.projectedMOPUpside.toLocaleString()}
                </strong>{' '}
                in projected capital appreciation!
              </p>
            </div>

            <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-xs text-gray-300 text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Purchase Price:</span>
                <span className="text-white font-bold">S${matchModalProperty.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Required Downpayment:</span>
                <span className="text-white font-bold">S${matchModalProperty.downpaymentRequired.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Your Est. Sales Cash Surplus:</span>
                <span className="text-emerald-400 font-bold">~S${(homeownerNetProceeds - matchModalProperty.downpaymentRequired).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => setMatchModalProperty(null)}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold uppercase tracking-wider border border-white/10 transition"
              >
                Keep Swiping
              </button>
              <button
                onClick={() => {
                  const prop = matchModalProperty;
                  setMatchModalProperty(null);
                  onOptForAgent(prop);
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)] transition"
              >
                Assign Portfolio Agent
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Property Specs Detail Modal */}
      {viewDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 text-white">
            <div className="flex items-center justify-between">
              <h3 className="font-serif italic text-xl">{viewDetailModal.name}</h3>
              <button
                onClick={() => setViewDetailModal(null)}
                className="p-1 rounded-md text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={viewDetailModal.imageUrl}
              alt={viewDetailModal.name}
              className="w-full h-44 object-cover rounded-xl border border-white/10"
            />
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-black/50 rounded-xl border border-white/10 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Town / Region:</span>
                  <span className="font-semibold">{viewDetailModal.town} ({viewDetailModal.region})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">MRT Connectivity:</span>
                  <span className="font-semibold text-emerald-400">{viewDetailModal.mrtDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Indicative Price:</span>
                  <span className="font-semibold text-white">S${viewDetailModal.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Floor Area:</span>
                  <span className="font-semibold">{viewDetailModal.floorAreaSqft} sqft (S${viewDetailModal.pricePerSqft} psf)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated TOP:</span>
                  <span className="font-semibold">{viewDetailModal.estimatedTOP || 'Immediate'}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px] block mb-1">URA Master Plan Zoning & Highlights:</span>
                <p className="text-gray-300 mb-1 italic">"{viewDetailModal.uraZoning}"</p>
                <ul className="list-disc list-inside text-gray-400 space-y-0.5">
                  {viewDetailModal.uraMasterPlanHighlights.map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
              <button
                onClick={() => setViewDetailModal(null)}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 uppercase tracking-wider border border-white/10"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const p = viewDetailModal;
                  setViewDetailModal(null);
                  onOptForAgent(p);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Assign Agent for This Unit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
