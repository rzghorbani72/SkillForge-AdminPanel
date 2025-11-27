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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Building2, Globe, Info } from 'lucide-react';
import { useSettingsData } from '../_hooks/use-settings-data';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { extractDomainPart, formatDomain } from '@/lib/school-utils';

interface SchoolFormState {
  name: string;
  description: string;
  domain: string;
}

const DEFAULT_FORM: SchoolFormState = {
  name: '',
  description: '',
  domain: ''
};

export default function SchoolSettingsPage() {
  const { school, isLoading } = useSettingsData();
  const [form, setForm] = useState<SchoolFormState>(DEFAULT_FORM);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!school) {
      setForm(DEFAULT_FORM);
      return;
    }

    setForm({
      name: school.name ?? '',
      description: school.description ?? '',
      domain: school.private_address ?? ''
    });
  }, [school]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updateData: {
        name?: string;
        description?: string;
        private_domain?: string;
      } = {};

      if (form.name) updateData.name = form.name;
      if (form.description !== undefined)
        updateData.description = form.description;

      if (form.domain && form.domain.trim()) {
        const domainPart = extractDomainPart(form.domain);
        const formattedDomain = formatDomain(domainPart);
        if (formattedDomain) {
          updateData.private_domain = formattedDomain;
        }
      }

      await apiClient.updateSchool(updateData);
      ErrorHandler.showSuccess('School settings updated successfully');
    } catch (error) {
      console.error('Error updating school settings', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
        <p className="text-muted-foreground">
          Manage how your school appears across the SkillForge ecosystem.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
              Update the name, description, and domain for your school.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="schoolName">School name</Label>
                <Input
                  id="schoolName"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="SkillForge Academy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Custom domain</Label>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(event) =>
                    setForm({ ...form, domain: event.target.value })
                  }
                  placeholder="academy"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe your school for prospective students"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Building2 className="h-4 w-4" /> Current overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Students</span>
                <span className="font-medium text-foreground">
                  {school?.students_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Teachers</span>
                <span className="font-medium text-foreground">
                  {school?.teachers_count ?? '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Managers</span>
                <span className="font-medium text-foreground">
                  {school?.managers_count ?? '—'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Globe className="h-4 w-4" /> Domain tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Use a subdomain you control (e.g. academy.yourschool.com) for
                the best branding experience.
              </p>
              <p>
                You can request SSL certificates and custom DNS support by
                contacting SkillForge support.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                <Info className="h-4 w-4" /> Need help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Visit the documentation to learn how to configure single
                sign-on, custom domains, and more.
              </p>
              <Button variant="outline" size="sm">
                Open documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
