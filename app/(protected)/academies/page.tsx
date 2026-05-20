'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ErrorHandler } from '@/lib/error-handler';
import { apiClient } from '@/lib/api';
import { Loader2, Pencil, Save, X } from 'lucide-react';

type Academy = {
  id: number;
  name: string;
  slug: string;
  domain?: { private_address?: string; public_address?: string } | null;
  is_active?: boolean;
  is_verified?: boolean;
};

type EditState = {
  name: string;
  slug: string;
  public_address: string;
};

export default function AcademiesPage() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EditState>({
    name: '',
    slug: '',
    public_address: ''
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAcademies();
      const list: Academy[] = Array.isArray(data) ? data : (data?.data ?? []);
      setAcademies(list);
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = (a: Academy) => {
    setEditingId(a.id);
    setDraft({
      name: a.name,
      slug: a.slug,
      public_address: a.domain?.public_address ?? ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const save = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      // Backend updateAcademy targets /academies/current; for admins managing
      // multiple academies we POST to the explicit per-id route instead.
      await fetch(`/api/academies/${editingId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: draft.name,
          slug: draft.slug,
          public_address: draft.public_address || null
        })
      }).then(async (r) => {
        if (!r.ok)
          throw new Error((await r.json())?.message ?? 'Update failed');
      });
      ErrorHandler.showSuccess('Academy updated');
      setEditingId(null);
      await load();
    } catch (err) {
      ErrorHandler.handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Academies</h1>
          <p className="text-sm text-muted-foreground">
            Manage academy names, private slugs, and public domains.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : academies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No academies yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {academies.map((a) => {
            const isEditing = editingId === a.id;
            return (
              <Card key={a.id} className="border-border/60">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {isEditing ? (
                        <Input
                          value={draft.name}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, name: e.target.value }))
                          }
                          className="h-9 max-w-md"
                        />
                      ) : (
                        a.name
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      ID {a.id}
                      {a.is_active === false ? ' · inactive' : ''}
                      {a.is_verified ? ' · verified' : ''}
                    </p>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button size="sm" onClick={save} disabled={saving}>
                        {saving ? (
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-1 h-4 w-4" />
                        )}
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(a)}
                    >
                      <Pencil className="mr-1 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Private slug
                    </Label>
                    {isEditing ? (
                      <Input
                        value={draft.slug}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, slug: e.target.value }))
                        }
                        className="h-9 font-mono"
                      />
                    ) : (
                      <p className="font-mono text-sm">{a.slug}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                      Public domain
                    </Label>
                    {isEditing ? (
                      <Input
                        value={draft.public_address}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            public_address: e.target.value
                          }))
                        }
                        className="h-9 font-mono"
                        placeholder="academy.example.com"
                      />
                    ) : (
                      <p className="font-mono text-sm">
                        {a.domain?.public_address ?? (
                          <span className="text-muted-foreground">not set</span>
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
