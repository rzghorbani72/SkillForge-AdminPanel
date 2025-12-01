'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/provider';
import { LANGUAGES } from '@/lib/i18n/config';
import type { LanguageCode } from '@/lib/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

// Only show these 4 languages in the switcher
const AVAILABLE_LANGUAGES: LanguageCode[] = ['en', 'ar', 'fa', 'tr'];

export function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useI18n();
  const [isChanging, setIsChanging] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    if (newLanguage === language || isChanging) return;

    setIsChanging(true);
    // setLanguage will handle localStorage, cookie, and reload
    setLanguage(newLanguage);
  };

  const currentLanguage = LANGUAGES[language];

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 dark:text-gray-100"
        disabled
      >
        <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        <span className="font-medium">...</span>
      </Button>
    );
  }

  // Filter languages to only show the 4 available ones
  const availableLanguagesList = AVAILABLE_LANGUAGES.map(
    (code) => LANGUAGES[code]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 dark:bg-gray-500 dark:text-gray-100"
          disabled={isChanging}
        >
          <Globe className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {currentLanguage.nativeName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isRTL ? 'start' : 'end'}
        className="z-[100] max-h-[300px] w-56 overflow-y-auto"
      >
        {availableLanguagesList.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLanguageChange(lang.code);
            }}
            className={language === lang.code ? 'bg-accent font-medium' : ''}
          >
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  ({lang.name})
                </span>
              </div>
              {language === lang.code && <span className="text-xs">✓</span>}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
