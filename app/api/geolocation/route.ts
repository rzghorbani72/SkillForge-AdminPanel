import { NextRequest, NextResponse } from 'next/server';
import { detectUserCountry } from '@/lib/geo-location';
import { getDefaultLanguageForCountry } from '@/lib/i18n/config';

export async function GET(request: NextRequest) {
  try {
    const country = await detectUserCountry();
    const language = getDefaultLanguageForCountry(country.code);

    return NextResponse.json({
      country: country.code,
      countryName: country.name,
      language
    });
  } catch (error) {
    console.error('Geolocation error:', error);
    return NextResponse.json(
      { country: 'US', countryName: 'United States', language: 'en' },
      { status: 200 }
    );
  }
}
