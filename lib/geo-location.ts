import {
  CountryCode,
  getCountryByCode,
  getDefaultCountry
} from './country-codes';

export interface GeoLocationData {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
}

export const detectUserCountry = async (): Promise<CountryCode> => {
  try {
    // Try multiple IP geolocation services for better reliability
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
      'https://api.country.is/'
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();

        // Handle different response formats
        let countryCode: string;

        if (data.country_code) {
          countryCode = data.country_code;
        } else if (data.countryCode) {
          countryCode = data.countryCode;
        } else if (data.country) {
          countryCode = data.country;
        } else {
          continue;
        }

        const country = getCountryByCode(countryCode.toUpperCase());
        if (country) {
          return country;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${service}:`, error);
        continue;
      }
    }

    // Fallback to default country
    return getDefaultCountry();
  } catch (error) {
    console.warn('Failed to detect user country:', error);
    return getDefaultCountry();
  }
};

export const getStoredCountry = (): CountryCode | null => {
  try {
    const stored = localStorage.getItem('user_country');
    if (stored) {
      const country = getCountryByCode(stored);
      return country || null;
    }
  } catch (error) {
    console.warn('Failed to get stored country:', error);
  }
  return null;
};

export const storeCountry = (country: CountryCode): void => {
  try {
    localStorage.setItem('user_country', country.code);
  } catch (error) {
    console.warn('Failed to store country:', error);
  }
};
