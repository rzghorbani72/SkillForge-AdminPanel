'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Save, Webhook, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/lib/i18n/hooks';
import Link from 'next/link';

export default function WebhooksPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const academyId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [academyName, setAcademyName] = useState('');

  useEffect(() => {
    async function loadAcademyName() {
      try {
        const academy = await apiClient.getStore(academyId);
        setAcademyName(typeof academy?.name === 'string' ? academy.name : '');
      } catch {
        /* the description falls back to a name-less label */
      }
    }
    if (academyId) loadAcademyName();
  }, [academyId]);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getStoreSettings(academyId);
        const map: Record<string, string> = {};
        if (Array.isArray(data))
          data.forEach((s: any) => {
            map[s.key] = s.value;
          });
        else if (data && typeof data === 'object') Object.assign(map, data);
        setWebhookUrl(map['webhook_url'] ?? '');
        setWebhookSecret(map['webhook_secret'] ?? '');
      } catch {
        /* settings may not exist yet */
      } finally {
        setLoading(false);
      }
    }
    if (academyId) load();
  }, [academyId]);

  async function saveSettings() {
    setSaving(true);
    try {
      await Promise.all([
        apiClient.setStoreSetting(academyId, 'webhook_url', webhookUrl),
        webhookSecret
          ? apiClient.setStoreSetting(academyId, 'webhook_secret', webhookSecret)
          : Promise.resolve(),
      ]);
      toast.success(t('common.success'));
    } catch (err: any) {
      toast.error(err?.message ?? t('common.error'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href={`/academies/${academyId}`}>
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('webhooks.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {academyName
              ? t('webhooks.description', { academy: academyName })
              : t('webhooks.descriptionFallback')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            {t('webhooks.endpointSettings')}
          </CardTitle>
          <CardDescription>{t('webhooks.endpointDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook_url">{t('webhooks.webhookUrl')}</Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://your-app.com/webhooks/academy"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_secret">{t('webhooks.secretLabel')}</Label>
            <div className="relative">
              <Input
                id="webhook_secret"
                type={showSecret ? 'text' : 'password'}
                placeholder={t('webhooks.secretPlaceholder')}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                className="pe-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={showSecret ? t('common.inactive') : t('common.active')}
                className="absolute end-1 top-1 h-7 w-7"
                onClick={() => setShowSecret((v) => !v)}
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t('webhooks.secretHint')}</p>
          </div>

          <Separator />

          <div className="space-y-2 rounded-md bg-muted/50 p-4 text-sm">
            <p className="font-semibold">{t('webhooks.hmacTitle')}</p>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">{`const signature = req.headers['x-webhook-signature']; // "sha256=..."
const expected = 'sha256=' + crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature), Buffer.from(expected)
);`}</pre>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? t('common.saving') : t('webhooks.saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
