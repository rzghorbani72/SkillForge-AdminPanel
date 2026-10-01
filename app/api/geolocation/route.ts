import { NextRequest, NextResponse } from 'next/server';
import { detectUserCountry } from '@/lib/geo-location';
import { getDefaultLanguageForCountry } from '@/lib/i18n/config';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

export async function GET(_request: NextRequest) {
  try {
    const country = await detectUserCountry();
    const language = getDefaultLanguageForCountry(country.code);

    return NextResponse.json({
      country: country.code,
      countryName: country.name,
      language,
    });
  } catch (error) {
    logger.error('Geo', 'LookupFailed', errorFields(error));
    return NextResponse.json(
      { country: 'US', countryName: 'United States', language: 'en' },
      { status: 200 },
    );
  }
}
