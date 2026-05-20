'use client';

import { useEffect, useState } from 'react';
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
import { apiClient } from '@/lib/api';
import { userPrefsApi } from '@/lib/api-extra';
import { Loader2, Save } from 'lucide-react';

// Lets a multi-academy user pin their default academy. Backend uses this to
// decide which academy to load first on next sign-in (Mig 1).

type AcademyOpt = { id: number; name: string };

export function DefaultAcademyCard() {
  const [options, setOptions] = useState<AcademyOpt[]>([]);
  const [selected, setSelected] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiClient.getMyAcademies();
        const list = (resp as any)?.data?.data ?? (resp as any)?.data ?? [];
        const opts: AcademyOpt[] = Array.isArray(list)
          ? list.map((x: any) => ({ id: x.id, name: x.name }))
          : [];
        setOptions(opts);
      } catch (e) {
        ErrorHandler.handleApiError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await userPrefsApi.setDefaultAcademy(selected === '' ? null : selected);
      ErrorHandler.showSuccess('Default academy saved');
    } catch (e) {
      ErrorHandler.handleApiError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default academy</CardTitle>
        <CardDescription>
          When you have a profile in multiple academies, sign-in lands on this
          one by default.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading academies…
          </div>
        ) : options.length <= 1 ? (
          <p className="text-sm text-muted-foreground">
            You only have one academy — no need to pick a default.
          </p>
        ) : (
          <>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Pick one
            </Label>
            <div className="flex gap-2">
              <select
                className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                value={selected}
                onChange={(e) =>
                  setSelected(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">— no default —</option>
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
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
