'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_CODES } from '@/lib/country-codes';
import { detectUserCountry, getStoredCountry, storeCountry } from '@/lib/geo-location';
import {
  cleanPhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumber,
  getFullPhoneNumber,
} from '@/lib/phone-utils';
import { useLanguage, useTranslation } from '@/lib/i18n/hooks';
import { getDefaultCountryByLanguage } from '@/lib/country-codes';
import { logger } from '@/lib/logging/app-logger';
import { errorFields } from '@/lib/logging/error-fields';

interface PhoneInputWithCountryProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (countryCode: string) => void;
  onFullPhoneChange?: (fullPhoneNumber: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
  onValidationChange?: (isValid: boolean) => void;
  onBlur?: () => void;
  lockCountryCode?: string;
}

export function PhoneInputWithCountry({
  id,
  label,
  placeholder = 'Enter your phone number',
  value,
  onChange,
  onCountryChange,
  onFullPhoneChange,
  error,
  disabled = false,
  className,
  maxLength = 10,
  onValidationChange,
  onBlur,
  lockCountryCode,
}: PhoneInputWithCountryProps) {
  const { isRTL, language } = useLanguage();
  const { t } = useTranslation();
  const lockedCountry = useMemo(
    () =>
      lockCountryCode ? (COUNTRY_CODES.find((c) => c.code === lockCountryCode) ?? null) : null,
    [lockCountryCode],
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    lockedCountry ?? getDefaultCountryByLanguage(language),
  );
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (lockedCountry) {
      setSelectedCountry(lockedCountry);
      onCountryChange?.(lockedCountry.code);
      setIsLoadingCountry(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockCountryCode]);

  // Detect user's country on component mount and when language changes
  useEffect(() => {
    if (lockedCountry) return;

    const initializeCountry = async () => {
      setIsLoadingCountry(true);

      // Get language-based default country
      const languageBasedCountry = getDefaultCountryByLanguage(language);
      const languageCountryMap: Record<string, string> = {
        fa: 'IR',
        tr: 'TR',
        en: 'US',
        ar: 'SA',
      };

      // Check if stored country matches the current language preference
      const storedCountry = getStoredCountry();
      if (storedCountry && storedCountry.code === languageCountryMap[language]) {
        // Stored country matches language, use it
        setSelectedCountry(storedCountry);
        setIsLoadingCountry(false);
        return;
      }

      // Stored country doesn't match language or doesn't exist, use language-based default
      setSelectedCountry(languageBasedCountry);
      storeCountry(languageBasedCountry);

      // Optionally try to detect from IP (but prefer language-based default)
      try {
        const detectedCountry = await detectUserCountry();
        // Only use detected country if it matches the language preference
        if (detectedCountry.code === languageCountryMap[language]) {
          setSelectedCountry(detectedCountry);
          storeCountry(detectedCountry);
        }
      } catch (error) {
        logger.warn('Geo', 'DetectCountryFailed', errorFields(error));
      } finally {
        setIsLoadingCountry(false);
      }
    };

    initializeCountry();
  }, [language, lockedCountry]);

  // Update full phone number whenever value or selectedCountry changes
  useEffect(() => {
    if (value && selectedCountry && !isLoadingCountry && onFullPhoneChange) {
      const fullPhoneNumber = getFullPhoneNumber(value, selectedCountry);
      onFullPhoneChange(fullPhoneNumber);
    } else if (!value && onFullPhoneChange) {
      // Clear full phone number if value is empty
      onFullPhoneChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, selectedCountry, isLoadingCountry]);

  const handleCountryChange = (countryCode: string) => {
    if (lockCountryCode) return;
    const country = COUNTRY_CODES.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      storeCountry(country);
      onCountryChange?.(countryCode);

      // Update full phone number when country changes
      if (value && onFullPhoneChange) {
        const fullPhoneNumber = getFullPhoneNumber(value, country);
        onFullPhoneChange(fullPhoneNumber);
      }
    }
  };

  const handlePhoneChange = (phoneValue: string) => {
    // Clean the phone number by removing country codes, leading zeros, etc.
    let cleanedValue = cleanPhoneNumber(phoneValue, selectedCountry);

    // Limit to maxLength digits (apply to raw value, not formatted)
    if (cleanedValue.length > maxLength) {
      cleanedValue = cleanedValue.slice(0, maxLength);
    }

    onChange(cleanedValue);

    // Get full phone number with country code and call callback if provided
    if (onFullPhoneChange) {
      const fullPhoneNumber = getFullPhoneNumber(cleanedValue, selectedCountry);
      onFullPhoneChange(fullPhoneNumber);
    }

    // Validate the cleaned phone number
    const phoneIsValid = isValidPhoneNumber(cleanedValue, selectedCountry);
    setIsValid(phoneIsValid);
    onValidationChange?.(phoneIsValid);
  };

  const getDisplayValue = () => {
    if (!value) return '';
    if (selectedCountry.code === 'IR') return `0${value}`;
    return formatPhoneNumber(value, selectedCountry);
  };

  // Deduplicate country codes to ensure unique keys
  const uniqueCountryCodes = useMemo(() => {
    const seen = new Set<string>();
    return COUNTRY_CODES.filter((country) => {
      if (seen.has(country.code)) {
        return false;
      }
      seen.add(country.code);
      return true;
    });
  }, []);

  return (
    <div className="space-y-2" dir={'rtl'}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Country Code — selector when unlocked, static badge when locked */}
          {lockCountryCode ? (
            <div
              dir="ltr"
              className={`flex items-center gap-2 border border-border bg-muted/50 px-3 ${'rounded-r-none border-r-0'} rounded-md`}
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm font-medium text-muted-foreground">
                {selectedCountry.dialCode}
              </span>
            </div>
          ) : (
            <Select
              value={selectedCountry.code}
              onValueChange={handleCountryChange}
              disabled={disabled || isLoadingCountry}
            >
              <SelectTrigger
                className={`border-r-0'} w-[140px] rounded-r-none focus:ring-0 focus:ring-offset-0`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-sm font-medium">{selectedCountry.dialCode}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {uniqueCountryCodes.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm">{country.name}</span>
                      <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Phone Number Input */}
          <div className="relative flex-1">
            <Input
              id={id}
              type="tel"
              placeholder={placeholder}
              value={getDisplayValue()}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={onBlur}
              className={cn(
                'rounded-l-none border-l-0 ps-10',
                error && 'border-red-500',
                className,
              )}
              disabled={disabled}
              autoComplete="tel"
              dir="ltr"
            />
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!error && value && (
        <p className={cn('text-xs', isValid ? 'text-green-600' : 'text-amber-600')}>
          {isValid ? t('common.validPhoneNumberFormat') : t('common.invalidPhoneNumberFormat')}
        </p>
      )}
    </div>
  );
}
