import { TransactionRecord, DataGovSgRecord, CustomerProfile } from '../types';

export const DATASET_ID = 'd_8b84c4ee58e3cfc0ece0d773c8ca6abc';
export const DATA_GOV_SG_URL = `https://data.gov.sg/api/action/datastore_search?resource_id=${DATASET_ID}`;
export const DATASET_URL = DATA_GOV_SG_URL;

export const PYTHON_DATA_CODE = `import requests
         
dataset_id = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc"
url = "https://data.gov.sg/api/action/datastore_search?resource_id="  + dataset_id
       
response = requests.get(url)
print(response.json())`;

export interface FetchHdbResaleOptions {
  town?: string;
  limit?: number;
  q?: string;
  sort?: string;
  customer?: CustomerProfile;
}

export interface FetchHdbResaleResult {
  success: boolean;
  datasetId: string;
  records: TransactionRecord[];
  rawRecords: DataGovSgRecord[];
  total: number;
  sourceUrl: string;
  isLive: boolean;
  error?: string;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatFlatType(flatType: string): string {
  if (!flatType) return 'HDB Flat';
  const clean = flatType.toUpperCase();
  if (clean.includes('1 ROOM')) return '1-Room HDB';
  if (clean.includes('2 ROOM')) return '2-Room HDB';
  if (clean.includes('3 ROOM')) return '3-Room HDB';
  if (clean.includes('4 ROOM')) return '4-Room HDB';
  if (clean.includes('5 ROOM')) return '5-Room HDB';
  if (clean.includes('EXECUTIVE')) return 'Executive Flat';
  return toTitleCase(flatType);
}

function parseRemainingLease(remainingLeaseStr: string, commenceYear: number): number {
  if (remainingLeaseStr) {
    const match = remainingLeaseStr.match(/(\d+)\s*year/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  if (commenceYear) {
    const currentYear = new Date().getFullYear();
    return Math.max(1, 99 - (currentYear - commenceYear));
  }
  return 65;
}

export function transformGovRecordToTransaction(
  rec: DataGovSgRecord,
  customer?: CustomerProfile
): TransactionRecord {
  const price = parseFloat(rec.resale_price) || 0;
  const sqm = parseFloat(rec.floor_area_sqm) || 100;
  const areaSqft = Math.round(sqm * 10.7639);
  const psf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;
  const leaseCommenceDate = parseInt(rec.lease_commence_date, 10) || 1990;
  const remainingLeaseYears = parseRemainingLease(rec.remaining_lease, leaseCommenceDate);

  const townClean = toTitleCase(rec.town);
  const address = `Blk ${rec.block} ${toTitleCase(rec.street_name)}`;
  const unitType = `${formatFlatType(rec.flat_type)} (${rec.flat_model || 'Standard'})`;

  let isComparableToUser = false;
  if (customer) {
    const customerTown = customer.currentProperty.town.toLowerCase();
    const matchesTown = townClean.toLowerCase().includes(customerTown) || customerTown.includes(townClean.toLowerCase());
    const customerFlatType = customer.currentProperty.unitType.toLowerCase();
    const matchesType =
      (customerFlatType.includes('4') && rec.flat_type.includes('4')) ||
      (customerFlatType.includes('5') && rec.flat_type.includes('5')) ||
      (customerFlatType.includes('3') && rec.flat_type.includes('3'));
    isComparableToUser = matchesTown && matchesType;
  }

  return {
    id: `gov-${rec._id}`,
    date: rec.month,
    address,
    town: townClean,
    propertyType: 'HDB Resale',
    unitType,
    price,
    psf,
    areaSqft,
    storeyRange: rec.storey_range ? `#${rec.storey_range.replace(/\s+TO\s+/i, ' to #')}` : '#Mid Floor',
    leaseCommenceDate,
    remainingLeaseYears,
    isComparableToUser,
    isLiveGovData: true,
    rawGovRecord: rec,
  };
}

/**
 * Fetches real HDB Resale transactions from Singapore Data.gov.sg
 * Dataset: d_8b84c4ee58e3cfc0ece0d773c8ca6abc
 */
export async function fetchHdbResaleFromDataGov(
  options: FetchHdbResaleOptions = {}
): Promise<FetchHdbResaleResult> {
  const { town, limit = 50, q, sort = 'month desc', customer } = options;

  // Try server endpoint first (handles proxy, CORS safety, formatting)
  try {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (sort) params.set('sort', sort);
    if (town && town !== 'All') params.set('town', town);
    if (q) params.set('q', q);

    const response = await fetch(`/api/data-gov-sg/resale-prices?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.records) {
        const transformed = data.records.map((rec: DataGovSgRecord) =>
          transformGovRecordToTransaction(rec, customer)
        );
        return {
          success: true,
          datasetId: DATASET_ID,
          records: transformed,
          rawRecords: data.records,
          total: data.total || transformed.length,
          sourceUrl: data.queriedUrl || DATA_GOV_SG_URL,
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Server proxy fetch failed, trying direct Data.gov.sg fallback...', err);
  }

  // Direct client fallback to Data.gov.sg
  try {
    const directUrl = new URL(DATA_GOV_SG_URL);
    directUrl.searchParams.set('limit', String(limit));
    if (sort) directUrl.searchParams.set('sort', sort);
    if (town && town !== 'All') {
      directUrl.searchParams.set('filters', JSON.stringify({ town: town.toUpperCase() }));
    }
    if (q) directUrl.searchParams.set('q', q);

    const response = await fetch(directUrl.toString());
    if (!response.ok) {
      throw new Error(`Data.gov.sg returned HTTP ${response.status}`);
    }
    const data = await response.json();
    const rawRecords: DataGovSgRecord[] = data.result?.records || [];
    const transformed = rawRecords.map((rec) =>
      transformGovRecordToTransaction(rec, customer)
    );

    return {
      success: true,
      datasetId: DATASET_ID,
      records: transformed,
      rawRecords,
      total: data.result?.total || transformed.length,
      sourceUrl: directUrl.toString(),
      isLive: true,
    };
  } catch (err: any) {
    console.error('Failed to fetch from Data.gov.sg:', err);
    return {
      success: false,
      datasetId: DATASET_ID,
      records: [],
      rawRecords: [],
      total: 0,
      sourceUrl: DATA_GOV_SG_URL,
      isLive: false,
      error: err.message || 'Network error fetching data.gov.sg',
    };
  }
}
