export type PropertyType = 'hdb_resale' | 'bto' | 'ec' | 'private_condo';
export type RegionType = 'CCR' | 'RCR' | 'OCR';

export interface CurrentProperty {
  address: string;
  town: string;
  block: string;
  street: string;
  postalCode: string;
  unitType: string; // e.g. "4-Room HDB", "5-Room HDB", "3-Bedder Condo", "Executive Flat"
  floorAreaSqft: number;
  floorLevel: string; // e.g. "#11-20"
  purchaseYear: number;
  purchasePrice: number;
  expectedSellingPrice: number;
  expectedProfit: number;
  outstandingLoan: number;
  cpfUsed: number; // Principal + accrued interest
  remainingLeaseYears: number;
  valuationEstimate?: number;
}

export interface Wishlist {
  targetTypes: PropertyType[];
  targetLocations: string[]; // e.g. ["Bishan", "Queenstown", "Kallang/Whampoa", "Tampines"]
  maxBudget: number;
  minBedrooms: number;
  expectedTimeline: 'immediate' | '3_to_6_months' | '1_year' | 'bto_launch';
  minProjectedProfitYield?: number;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  registeredDate: string;
  currentProperty: CurrentProperty;
  wishlist: Wishlist;
  assignedAgent?: AgentProfile | null;
  agentStatus: 'unassigned' | 'requested' | 'assigned';
  watchlistedPropertyIds: string[];
}

export interface PropertyCard {
  id: string;
  name: string;
  type: PropertyType;
  badgeLabel: string;
  address: string;
  town: string;
  region: RegionType;
  price: number;
  pricePerSqft: number;
  floorAreaSqft: number;
  bedrooms: number;
  bathrooms: number;
  mrtDistance: string; // e.g. "350m to Bishan MRT (NSL/CCL)"
  uraZoning: string; // e.g. "Residential (Plot Ratio 2.8) - Master Plan 2025"
  uraMasterPlanHighlights: string[];
  imageUrl: string;
  estimatedTOP?: string;
  projectedMOPUpside: number; // Projected profit margin upon MOP or exit in S$
  projectedUpsidePercent: number; // e.g. 24%
  matchScore: number; // 0 - 100% computed from customer preferences
  matchReasons: string[];
  downpaymentRequired: number;
  monthlyMortgageEstimate: number;
  isBtoOrEc: boolean;
}

export interface TransactionRecord {
  id: string;
  date: string; // YYYY-MM
  address: string;
  town: string;
  propertyType: 'HDB Resale' | 'URA Private Condo' | 'BTO Baseline' | 'Executive Condo';
  unitType: string;
  price: number;
  psf: number;
  areaSqft: number;
  storeyRange: string;
  leaseCommenceDate: number;
  remainingLeaseYears: number;
  isComparableToUser?: boolean;
  isLiveGovData?: boolean;
  rawGovRecord?: any;
}

export interface DataGovSgRecord {
  _id: number;
  month: string;
  town: string;
  flat_type: string;
  block: string;
  street_name: string;
  storey_range: string;
  floor_area_sqm: string;
  flat_model: string;
  lease_commence_date: string;
  remaining_lease: string;
  resale_price: string;
}

export interface DataGovSgResponse {
  success: boolean;
  result: {
    resource_id: string;
    total?: number;
    records: DataGovSgRecord[];
    fields?: Array<{ type: string; id: string }>;
    _links?: Record<string, string>;
  };
}

export interface PriceTrendPoint {
  period: string; // e.g. "2024-Q1"
  hdbResaleAvgPsf: number;
  uraPrivateAvgPsf: number;
  ecAvgPsf: number;
  townAveragePsf: number;
  volume: number;
}

export interface AlertNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'profit_target_met' | 'bto_launch_match' | 'ec_launch_match' | 'market_surge' | 'agent_assigned';
  relatedPropertyId?: string;
  isRead: boolean;
  highlightProfit?: number;
}

export interface AgentProfile {
  id: string;
  name: string;
  agency: string;
  ceaRegNo: string;
  title: string;
  rating: number;
  reviewCount: number;
  dealsClosed: number;
  specialization: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  yearsOfExp: number;
}
