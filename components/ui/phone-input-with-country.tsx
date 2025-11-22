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
  formatPhoneNumber
} from '@/lib/phone-utils';

interface PhoneInputWithCountryProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (countryCode: string) => void;
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
  error,
  disabled = false,
  className,
  maxLength = 10,
  onValidationChange
}: PhoneInputWithCountryProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES[0]
  );
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const [isValid, setIsValid] = useState(false);

  // Detect user's country on component mount
  useEffect(() => {
    const initializeCountry = async () => {
      setIsLoadingCountry(true);

      // First try to get stored country
      const storedCountry = getStoredCountry();
      if (storedCountry) {
        setSelectedCountry(storedCountry);
        setIsLoadingCountry(false);
        return;
      }

      // If no stored country, detect from IP
      try {
        const detectedCountry = await detectUserCountry();
        setSelectedCountry(detectedCountry);
        storeCountry(detectedCountry);
      } catch (error) {
        console.warn('Failed to detect country:', error);
      } finally {
        setIsLoadingCountry(false);
      }
    };

    initializeCountry();
  }, []);

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRY_CODES.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      storeCountry(country);
      onCountryChange?.(countryCode);
    }
  };

  const handlePhoneChange = (phoneValue: string) => {
    // Clean the phone number by removing country codes, leading zeros, etc.
    const cleanedValue = cleanPhoneNumber(phoneValue, selectedCountry);
    onChange(cleanedValue);

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
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <div className="flex">
          {/* Country Code Selector */}
          <Select
            value={selectedCountry.code}
            onValueChange={handleCountryChange}
            disabled={disabled || isLoadingCountry}
          >
            <SelectTrigger className="w-[140px] rounded-r-none border-r-0 focus:ring-0 focus:ring-offset-0">
              <div className="flex items-center space-x-2">
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
                  <div className="flex items-center space-x-2">
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
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id={id}
              type="tel"
              placeholder={placeholder}
              value={getDisplayValue()}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className={cn(
                'rounded-l-none border-l-0 pl-10',
                error && 'border-red-500',
                className
              )}
              disabled={disabled}
              maxLength={maxLength}
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
      {isLoadingCountry && (
        <p className="text-xs text-gray-500">Detecting your country...</p>
      )}
    </div>
  );
}
