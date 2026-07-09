'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ErrorHandler } from '@/lib/error-handler';
import { userPrefsApi } from '@/lib/api-extra';
import { useStore } from '@/hooks/useStore';
import { Loader2, Save } from 'lucide-react';
import { MESSAGES } from '@/constants/messages';

// Lets a multi-academy user pin their default academy. Backend uses this to
// decide which academy to load first on next sign-in (Mig 1).

export function DefaultAcademyCard() {
  const { academies, isLoading } = useStore();
  const [selected, setSelected] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);

  const options = academies.map((a) => ({ id: a.id, name: a.name }));

  const save = async () => {
    setSaving(true);
    try {
      await userPrefsApi.setDefaultAcademy(selected === '' ? null : selected);
      ErrorHandler.showSuccess(MESSAGES.academy.defaultSaved);
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{MESSAGES.academy.defaultAcademy}</CardTitle>
        <CardDescription>{MESSAGES.academy.defaultAcademyDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />{' '}
            {MESSAGES.academy.loadingAcademies}
          </div>
        ) : options.length <= 1 ? (
          <p className="text-sm text-muted-foreground">
            {MESSAGES.academy.singleAcademy}
          </p>
        ) : (
          <>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              {MESSAGES.common.pickOne}
            </Label>
            <div className="flex gap-2">
              <select
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                value={selected}
                onChange={(e) =>
                  setSelected(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">{MESSAGES.common.noDefault}</option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1 h-4 w-4" />
                )}
                {MESSAGES.common.save}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
