import { CurrencyCode, CurrencyConfig } from '@/types/api';

// All available currencies with their details
export const ALL_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    is_default: false
  },
  IRR: {
    code: 'IRR',
    name: 'Iranian Rial',
    symbol: 'ریال',
    is_default: false
  },
  TL: {
    code: 'TL',
    name: 'Turkish Lira',
    symbol: '₺',
    is_default: false
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    is_default: false
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    is_default: false
  },
  TRY: {
    code: 'TRY',
    name: 'Turkish Lira (New)',
    symbol: '₺',
    is_default: false
  }
};

// Default currency configurations for different regions
export const REGIONAL_CURRENCIES: Record<string, CurrencyCode[]> = {
  iran: ['IRR'],
  turkey: ['TL', 'TRY', 'EUR'],
  uk: ['GBP', 'EUR', 'USD'],
  usa: ['USD'],
  europe: ['EUR', 'USD'],
  middle_east: ['USD', 'EUR', 'IRR'],
  asia: ['USD', 'EUR']
};

// Get available currencies for a school based on its name or preferences
export const getSchoolCurrencies = (schoolName: string): CurrencyConfig[] => {
  const name = schoolName.toLowerCase();

  // Check for specific country/region matches
  if (
    name.includes('iran') ||
    name.includes('persian') ||
    name.includes('فارسی')
  ) {
    return [ALL_CURRENCIES.IRR];
  }

  if (
    name.includes('turkey') ||
    name.includes('turkish') ||
    name.includes('türk')
  ) {
    return [ALL_CURRENCIES.TL, ALL_CURRENCIES.TRY, ALL_CURRENCIES.EUR];
  }

  if (
    name.includes('spain') ||
    name.includes('spanish') ||
    name.includes('español')
  ) {
    return [ALL_CURRENCIES.EUR, ALL_CURRENCIES.USD];
  }

  if (
    name.includes('uk') ||
    name.includes('british') ||
    name.includes('england')
  ) {
    return [ALL_CURRENCIES.GBP, ALL_CURRENCIES.EUR, ALL_CURRENCIES.USD];
  }

  if (
    name.includes('usa') ||
    name.includes('american') ||
    name.includes('united states')
  ) {
    return [ALL_CURRENCIES.USD];
  }

  if (name.includes('europe') || name.includes('euro')) {
    return [ALL_CURRENCIES.EUR, ALL_CURRENCIES.USD];
  }

  // Default to USD for international schools
  return [ALL_CURRENCIES.USD];
};

// Get default currency for a school
export const getSchoolDefaultCurrency = (schoolName: string): CurrencyCode => {
  const currencies = getSchoolCurrencies(schoolName);
  return currencies[0]?.code || 'USD';
};

// Format currency display
export const formatCurrencyDisplay = (currency: CurrencyCode): string => {
  const config = ALL_CURRENCIES[currency];
  return `${config.symbol} ${config.name}`;
};

// Get currency symbol
export const getCurrencySymbol = (currency: CurrencyCode): string => {
  return ALL_CURRENCIES[currency]?.symbol || currency;
};
