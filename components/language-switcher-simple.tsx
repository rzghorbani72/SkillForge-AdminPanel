'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { LANGUAGES } from '@/lib/i18n/config';
import type { LanguageCode } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export function LanguageSwitcherSimple() {
  const { language, setLanguage, isRTL } = useI18n();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    if (newLanguage === language || isChanging) return;

    setIsChanging(true);
    localStorage.setItem('preferred_language', newLanguage);
    setLanguage(newLanguage);
    // The setLanguage function will reload the page
  };

  const currentLanguage = LANGUAGES[language];

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <Select
        value={language}
        onValueChange={handleLanguageChange}
        disabled={isChanging}
      >
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage.nativeName}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.values(LANGUAGES).map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  ({lang.name})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
