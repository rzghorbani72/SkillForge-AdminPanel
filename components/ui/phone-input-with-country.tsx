'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Phone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountryCode, COUNTRY_CODES } from '@/lib/country-codes';
import {
  detectUserCountry,
  getStoredCountry,
  storeCountry
} from '@/lib/geo-location';
import {
  cleanPhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumber,
  getFullPhoneNumber
} from '@/lib/phone-utils';
import { useLanguage } from '@/lib/i18n/hooks';
import { getDefaultCountryByLanguage } from '@/lib/country-codes';

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
  onValidationChange
}: PhoneInputWithCountryProps) {
  const { isRTL, language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    getDefaultCountryByLanguage(language)
  );
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Detect user's country on component mount and when language changes
  useEffect(() => {
    const initializeCountry = async () => {
      setIsLoadingCountry(true);

      // Get language-based default country
      const languageBasedCountry = getDefaultCountryByLanguage(language);
      const languageCountryMap: Record<string, string> = {
        fa: 'IR',
        tr: 'TR',
        en: 'US',
        ar: 'SA'
      };

      // Check if stored country matches the current language preference
      const storedCountry = getStoredCountry();
      if (
        storedCountry &&
        storedCountry.code === languageCountryMap[language]
      ) {
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
        console.warn('Failed to detect country:', error);
      } finally {
        setIsLoadingCountry(false);
      }
    };

    initializeCountry();
  }, [language]);

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
    // Format the phone number for display
    return formatPhoneNumber(value, selectedCountry);
  };

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Country Code Selector */}
          <Select
            value={selectedCountry.code}
            onValueChange={handleCountryChange}
            disabled={disabled || isLoadingCountry}
          >
            <SelectTrigger
              className={`w-[140px] focus:ring-0 focus:ring-offset-0 ${isRTL ? 'rounded-l-none border-l-0' : 'rounded-r-none border-r-0'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">
                  {selectedCountry.dialCode}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                    <span className="text-sm text-gray-500">
                      {country.dialCode}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Phone Number Input */}
          <div className="relative flex-1">
            <Phone
              className={`absolute top-3 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`}
            />
            <Input
              id={id}
              type="tel"
              placeholder={placeholder}
              value={getDisplayValue()}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(
                isRTL
                  ? 'rounded-r-none border-r-0 pe-10 pr-10'
                  : 'rounded-l-none border-l-0 pl-10 ps-10',
                error && 'border-red-500',
                className
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
        <p
          className={cn(
            'text-xs',
            isValid ? 'text-green-600' : 'text-amber-600'
          )}
        >
          {isValid ? '✓ Valid phone number' : '⚠ Invalid phone number format'}
        </p>
      )}
    </div>
  );
}
