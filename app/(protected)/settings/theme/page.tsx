'use client';

import { useMemo, useState } from 'react';
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

interface ThemeFormState {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  darkMode: boolean;
  logoUrl: string;
}

const DEFAULT_THEME: ThemeFormState = {
  primary: '#3b82f6',
  secondary: '#6366f1',
  accent: '#f59e0b',
  background: '#f8fafc',
  darkMode: false,
  logoUrl: ''
};

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState<ThemeFormState>(DEFAULT_THEME);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const previewStyles = useMemo(
    () => ({
      '--preview-primary': theme.primary,
      '--preview-secondary': theme.secondary,
      '--preview-accent': theme.accent,
      '--preview-background': theme.background,
      '--preview-text': theme.darkMode ? '#f8fafc' : '#0f172a'
    }),
    [theme]
  );

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // TODO: Hook up to theme API when available
      ErrorHandler.showSuccess('Theme preferences saved');
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

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
                        setTheme((prev) => ({
                          ...prev,
                          [key]: event.target.value
                        }))
                      }
                      className="h-10 w-16"
                    />
                    <Input
                      value={theme[key as keyof ThemeFormState] as string}
                      onChange={(event) =>
                        setTheme((prev) => ({
                          ...prev,
                          [key]: event.target.value
                        }))
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
                  setTheme((prev) => ({ ...prev, darkMode: checked }))
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
