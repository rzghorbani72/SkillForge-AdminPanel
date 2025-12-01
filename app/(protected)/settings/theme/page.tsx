'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Palette, Image, Save } from 'lucide-react';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import {
  applyThemeVariables,
  DEFAULT_THEME_CONFIG,
  dispatchThemeUpdate,
  parseThemeResponse
} from '@/lib/theme';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/hooks';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeFormState {
  primaryLight: string;
  primaryDark: string;
  secondaryLight: string;
  secondaryDark: string;
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  darkMode: ThemeMode;
  logoUrl: string;
}

const getThemeMode = (darkMode: boolean | null): ThemeMode => {
  if (darkMode === null) return 'system';
  return darkMode ? 'dark' : 'light';
};

const getDarkModeValue = (mode: ThemeMode): boolean | null => {
  if (mode === 'system') return null;
  return mode === 'dark';
};

const DEFAULT_THEME: ThemeFormState = {
  primaryLight:
    DEFAULT_THEME_CONFIG.primary_color_light ??
    DEFAULT_THEME_CONFIG.primary_color,
  primaryDark: DEFAULT_THEME_CONFIG.primary_color_dark ?? '#60a5fa',
  secondaryLight:
    DEFAULT_THEME_CONFIG.secondary_color_light ??
    DEFAULT_THEME_CONFIG.secondary_color,
  secondaryDark: DEFAULT_THEME_CONFIG.secondary_color_dark ?? '#818cf8',
  accent: DEFAULT_THEME_CONFIG.accent_color,
  backgroundLight:
    DEFAULT_THEME_CONFIG.background_color_light ??
    DEFAULT_THEME_CONFIG.background_color,
  backgroundDark: DEFAULT_THEME_CONFIG.background_color_dark ?? '#0f172a',
  darkMode: getThemeMode(DEFAULT_THEME_CONFIG.dark_mode),
  logoUrl: ''
};

export default function ThemeSettingsPage() {
  const { t } = useTranslation();
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useState<ThemeFormState>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<number | undefined>(undefined);

  const applyLivePreview = (nextState: ThemeFormState) => {
    const payload = buildConfigPayload(nextState);
    applyThemeVariables(payload);
    const darkModeValue = getDarkModeValue(nextState.darkMode);
    if (darkModeValue === null) {
      setNextTheme('system');
    } else {
      setNextTheme(darkModeValue ? 'dark' : 'light');
    }
    dispatchThemeUpdate(payload);
  };

  const buildConfigPayload = (state: ThemeFormState) => ({
    themeId,
    name: 'Custom Theme',
    primary_color: state.primaryLight,
    primary_color_light: state.primaryLight,
    primary_color_dark: state.primaryDark,
    secondary_color: state.secondaryLight,
    secondary_color_light: state.secondaryLight,
    secondary_color_dark: state.secondaryDark,
    accent_color: state.accent,
    background_color: state.backgroundLight,
    background_color_light: state.backgroundLight,
    background_color_dark: state.backgroundDark,
    dark_mode: getDarkModeValue(state.darkMode)
  });

  const getEffectiveDarkMode = (mode: ThemeMode): boolean => {
    if (mode === 'system') {
      return (
        typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return mode === 'dark';
  };

  const previewStyles = useMemo(() => {
    const isDark = getEffectiveDarkMode(theme.darkMode);
    return {
      '--preview-primary': isDark ? theme.primaryDark : theme.primaryLight,
      '--preview-secondary': isDark
        ? theme.secondaryDark
        : theme.secondaryLight,
      '--preview-accent': theme.accent,
      '--preview-background': isDark
        ? theme.backgroundDark
        : theme.backgroundLight,
      '--preview-surface': isDark
        ? theme.backgroundDark
        : theme.backgroundLight,
      '--preview-text': isDark ? '#f8fafc' : '#0f172a'
    };
  }, [theme]);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!mounted) return;
        const config = parseThemeResponse(response);
        setTheme({
          primaryLight: config.primary_color_light ?? config.primary_color,
          primaryDark: config.primary_color_dark ?? config.primary_color,
          secondaryLight:
            config.secondary_color_light ?? config.secondary_color,
          secondaryDark: config.secondary_color_dark ?? config.secondary_color,
          accent: config.accent_color,
          backgroundLight:
            config.background_color_light ?? config.background_color,
          backgroundDark:
            config.background_color_dark ?? config.background_color,
          darkMode: getThemeMode(config.dark_mode),
          logoUrl: ''
        });
        setThemeId(config.themeId);
        applyThemeVariables(config);
        const darkModeValue = config.dark_mode;
        if (darkModeValue === null) {
          setNextTheme('system');
        } else {
          setNextTheme(darkModeValue ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Failed to load theme configuration', error);
        if (!mounted) return;
        setTheme(DEFAULT_THEME);
        applyThemeVariables(DEFAULT_THEME_CONFIG);
        const defaultDarkMode = DEFAULT_THEME_CONFIG.dark_mode;
        if (defaultDarkMode === null) {
          setNextTheme('system');
        } else {
          setNextTheme(defaultDarkMode ? 'dark' : 'light');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, [setNextTheme]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await apiClient.updateCurrentThemeConfig(
        buildConfigPayload(theme)
      );

      const updatedConfig = parseThemeResponse(response);
      setTheme({
        primaryLight:
          updatedConfig.primary_color_light ?? updatedConfig.primary_color,
        primaryDark:
          updatedConfig.primary_color_dark ?? updatedConfig.primary_color,
        secondaryLight:
          updatedConfig.secondary_color_light ?? updatedConfig.secondary_color,
        secondaryDark:
          updatedConfig.secondary_color_dark ?? updatedConfig.secondary_color,
        accent: updatedConfig.accent_color,
        backgroundLight:
          updatedConfig.background_color_light ??
          updatedConfig.background_color,
        backgroundDark:
          updatedConfig.background_color_dark ?? updatedConfig.background_color,
        darkMode: getThemeMode(updatedConfig.dark_mode),
        logoUrl: theme.logoUrl
      });
      setThemeId(updatedConfig.themeId);

      applyThemeVariables(updatedConfig);
      const darkModeValue = updatedConfig.dark_mode;
      if (darkModeValue === null) {
        setNextTheme('system');
      } else {
        setNextTheme(darkModeValue ? 'dark' : 'light');
      }
      dispatchThemeUpdate(updatedConfig);

      ErrorHandler.showSuccess(t('settings.themePreferencesSaved'));
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[220px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('settings.themeBrandingTitle')}
        </h1>
        <p className="text-muted-foreground">
          {t('settings.themeBrandingSubtitle')}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.colours')}</CardTitle>
            <CardDescription>
              {t('settings.coloursDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              {[
                {
                  key: 'primary',
                  label: t('settings.primaryColour'),
                  helper: t('settings.primaryColourHelper'),
                  lightKey: 'primaryLight' as const,
                  darkKey: 'primaryDark' as const
                },
                {
                  key: 'secondary',
                  label: t('settings.secondaryColour'),
                  helper: t('settings.secondaryColourHelper'),
                  lightKey: 'secondaryLight' as const,
                  darkKey: 'secondaryDark' as const
                },
                {
                  key: 'background',
                  label: t('settings.backgroundColour'),
                  helper: t('settings.backgroundColourHelper'),
                  lightKey: 'backgroundLight' as const,
                  darkKey: 'backgroundDark' as const
                }
              ].map(({ key, label, helper, lightKey, darkKey }) => (
                <div key={key} className="space-y-3">
                  <Label>{label}</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`${key}-light`}
                        className="text-xs text-muted-foreground"
                      >
                        {t('settings.lightTheme')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${key}-light`}
                          type="color"
                          value={theme[lightKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [lightKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                          className="h-10 w-16"
                        />
                        <Input
                          value={theme[lightKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [lightKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`${key}-dark`}
                        className="text-xs text-muted-foreground"
                      >
                        {t('settings.darkTheme')}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`${key}-dark`}
                          type="color"
                          value={theme[darkKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [darkKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                          className="h-10 w-16"
                        />
                        <Input
                          value={theme[darkKey]}
                          onChange={(event) =>
                            setTheme((prev) => {
                              const nextState = {
                                ...prev,
                                [darkKey]: event.target.value
                              } as ThemeFormState;
                              applyLivePreview(nextState);
                              return nextState;
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{helper}</p>
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="accent-color">
                  {t('settings.accentColour')}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={theme.accent}
                    onChange={(event) =>
                      setTheme((prev) => {
                        const nextState = {
                          ...prev,
                          accent: event.target.value
                        } as ThemeFormState;
                        applyLivePreview(nextState);
                        return nextState;
                      })
                    }
                    className="h-10 w-16"
                  />
                  <Input
                    value={theme.accent}
                    onChange={(event) =>
                      setTheme((prev) => {
                        const nextState = {
                          ...prev,
                          accent: event.target.value
                        } as ThemeFormState;
                        applyLivePreview(nextState);
                        return nextState;
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('settings.accentColourHelper')}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('settings.themeMode')}</Label>
              <Select
                value={theme.darkMode}
                onValueChange={(value: ThemeMode) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      darkMode: value
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.system')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {theme.darkMode === 'system'
                  ? t('settings.systemModeDescription')
                  : theme.darkMode === 'dark'
                    ? t('settings.darkModeDescription')
                    : t('settings.lightModeDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="h-4 w-4" /> {t('settings.livePreview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="space-y-3 rounded-lg border p-4 text-sm"
              style={{
                backgroundColor: previewStyles[
                  '--preview-background' as keyof typeof previewStyles
                ] as string,
                color: previewStyles[
                  '--preview-text' as keyof typeof previewStyles
                ] as string,
                borderColor: previewStyles[
                  '--preview-primary' as keyof typeof previewStyles
                ] as string
              }}
            >
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: previewStyles[
                    '--preview-secondary' as keyof typeof previewStyles
                  ] as string,
                  color: '#fff'
                }}
              >
                {t('settings.previewBadge')}
              </span>
              <h3 className="text-lg font-semibold">
                {t('settings.welcomeToYourSchool')}
              </h3>
              <p className="text-sm opacity-80">
                {t('settings.previewDescription')}
              </p>
              <Button
                size="sm"
                style={{
                  backgroundColor: previewStyles[
                    '--preview-primary' as keyof typeof previewStyles
                  ] as string,
                  color: '#fff'
                }}
              >
                {t('settings.primaryAction')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.brandAssets')}</CardTitle>
          <CardDescription>
            {t('settings.brandAssetsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">{t('settings.logoUrl')}</Label>
            <Input
              id="logoUrl"
              placeholder={t('settings.logoUrlPlaceholder')}
              value={theme.logoUrl}
              onChange={(event) =>
                setTheme((prev) => ({ ...prev, logoUrl: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.logoUrlHint')}
            </p>
          </div>
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <Image className="h-4 w-4" /> {t('settings.preview')}
            </div>
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt={t('settings.schoolLogoPreview')}
                className="h-16"
              />
            ) : (
              <p>{t('settings.noLogoProvided')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? t('settings.savingTheme') : t('settings.saveTheme')}
        </Button>
      </div>
    </div>
  );
}
