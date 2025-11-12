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
import { Switch } from '@/components/ui/switch';
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

interface ThemeFormState {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  darkMode: boolean;
  logoUrl: string;
}

const DEFAULT_THEME: ThemeFormState = {
  primary: DEFAULT_THEME_CONFIG.primary_color,
  secondary: DEFAULT_THEME_CONFIG.secondary_color,
  accent: DEFAULT_THEME_CONFIG.accent_color,
  background: DEFAULT_THEME_CONFIG.background_color,
  darkMode: DEFAULT_THEME_CONFIG.dark_mode,
  logoUrl: ''
};

export default function ThemeSettingsPage() {
  const { setTheme: setNextTheme } = useTheme();
  const [theme, setTheme] = useState<ThemeFormState>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [themeId, setThemeId] = useState<number | undefined>(undefined);

  const applyLivePreview = (nextState: ThemeFormState) => {
    const payload = buildConfigPayload(nextState);
    applyThemeVariables(payload);
    setNextTheme(nextState.darkMode ? 'dark' : 'light');
    dispatchThemeUpdate(payload);
  };

  const buildConfigPayload = (state: ThemeFormState) => ({
    themeId,
    name: 'Custom Theme',
    primary_color: state.primary,
    secondary_color: state.secondary,
    accent_color: state.accent,
    background_color: state.darkMode ? '#0f172a' : state.background,
    dark_mode: state.darkMode
  });

  const previewStyles = useMemo(
    () => ({
      '--preview-primary': theme.primary,
      '--preview-secondary': theme.secondary,
      '--preview-accent': theme.accent,
      '--preview-background': theme.darkMode ? '#0f172a' : theme.background,
      '--preview-surface': theme.darkMode ? '#0f172a' : theme.background,
      '--preview-text': theme.darkMode ? '#f8fafc' : '#0f172a'
    }),
    [theme]
  );

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const response = await apiClient.getCurrentThemeConfig();
        if (!mounted) return;
        const config = parseThemeResponse(response);
        setTheme({
          primary: config.primary_color,
          secondary: config.secondary_color,
          accent: config.accent_color,
          background: config.background_color,
          darkMode: config.dark_mode,
          logoUrl: ''
        });
        setThemeId(config.themeId);
        applyThemeVariables(config);
        setNextTheme(config.dark_mode ? 'dark' : 'light');
      } catch (error) {
        console.error('Failed to load theme configuration', error);
        if (!mounted) return;
        setTheme(DEFAULT_THEME);
        applyThemeVariables(DEFAULT_THEME_CONFIG);
        setNextTheme(DEFAULT_THEME_CONFIG.dark_mode ? 'dark' : 'light');
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
        primary: updatedConfig.primary_color,
        secondary: updatedConfig.secondary_color,
        accent: updatedConfig.accent_color,
        background: updatedConfig.background_color,
        darkMode: updatedConfig.dark_mode,
        logoUrl: theme.logoUrl
      });
      setThemeId(updatedConfig.themeId);

      applyThemeVariables(updatedConfig);
      setNextTheme(updatedConfig.dark_mode ? 'dark' : 'light');
      dispatchThemeUpdate(updatedConfig);

      ErrorHandler.showSuccess('Theme preferences saved');
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
        <h1 className="text-3xl font-bold tracking-tight">Theme & Branding</h1>
        <p className="text-muted-foreground">
          Customize the look and feel of your SkillForge schools for students.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Colours</CardTitle>
            <CardDescription>
              Choose the palette students will see across the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: 'primary',
                  label: 'Primary colour',
                  helper: 'Buttons, highlights, and key actions.'
                },
                {
                  key: 'secondary',
                  label: 'Secondary colour',
                  helper: 'Navigation elements and accents.'
                },
                {
                  key: 'accent',
                  label: 'Accent colour',
                  helper: 'Badges, tags, and supporting highlights.'
                },
                {
                  key: 'background',
                  label: 'Background colour',
                  helper: 'Dashboard and content areas.'
                }
              ].map(({ key, label, helper }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`${key}-color`}>{label}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`${key}-color`}
                      type="color"
                      value={theme[key as keyof ThemeFormState] as string}
                      onChange={(event) =>
                        setTheme((prev) => {
                          const nextState = {
                            ...prev,
                            [key]: event.target.value
                          } as ThemeFormState;
                          applyLivePreview(nextState);
                          return nextState;
                        })
                      }
                      className="h-10 w-16"
                    />
                    <Input
                      value={theme[key as keyof ThemeFormState] as string}
                      onChange={(event) =>
                        setTheme((prev) => {
                          const nextState = {
                            ...prev,
                            [key]: event.target.value
                          } as ThemeFormState;
                          applyLivePreview(nextState);
                          return nextState;
                        })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{helper}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <Label>Dark mode</Label>
                <p className="text-sm text-muted-foreground">
                  Render the student experience using the dark theme.
                </p>
              </div>
              <Switch
                checked={theme.darkMode}
                onCheckedChange={(checked) =>
                  setTheme((prev) => {
                    const nextState = {
                      ...prev,
                      darkMode: checked,
                      background: checked
                        ? prev.background === DEFAULT_THEME.background
                          ? '#0f172a'
                          : prev.background
                        : prev.background === '#0f172a'
                          ? DEFAULT_THEME.background
                          : prev.background
                    } as ThemeFormState;
                    applyLivePreview(nextState);
                    return nextState;
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="h-4 w-4" /> Live preview
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
                Preview badge
              </span>
              <h3 className="text-lg font-semibold">Welcome to your school</h3>
              <p className="text-sm opacity-80">
                Primary buttons, highlights, and accents will use your selected
                palette. Toggle dark mode to preview the student experience.
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
                Primary action
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand assets</CardTitle>
          <CardDescription>
            Upload logos and set branding resources for certificates and emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              placeholder="https://cdn.yourschool.com/logo.png"
              value={theme.logoUrl}
              onChange={(event) =>
                setTheme((prev) => ({ ...prev, logoUrl: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Provide a publicly accessible image URL. SVG is recommended for
              crisp results.
            </p>
          </div>
          <div className="rounded-lg border p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-foreground">
              <Image className="h-4 w-4" /> Preview
            </div>
            {theme.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={theme.logoUrl}
                alt="School logo preview"
                className="h-16"
              />
            ) : (
              <p>No logo provided yet. Paste a URL to preview.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving…' : 'Save theme'}
        </Button>
      </div>
    </div>
  );
}
