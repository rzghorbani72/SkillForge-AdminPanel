'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Search, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { School } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import { SchoolCard } from '@/components/schools/SchoolCard';
import { SchoolForm } from '@/components/schools/SchoolForm';
import { useSchool } from '@/hooks/useSchool';
import { extractDomainPart, formatDomain } from '@/lib/school-utils';
import { useTranslation } from '@/lib/i18n/hooks';

export default function SchoolsPage() {
  const { t, language } = useTranslation();
  const { schools, isLoading, error, refreshSchools } = useSchool();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    private_domain: '',
    public_domain: '',
    description: '',
    is_active: false
  });

  // Domain validation state
  const [domainValidation, setDomainValidation] = useState({
    isValid: false,
    message: ''
  });

  // Domain availability state
  const [domainAvailability, setDomainAvailability] = useState({
    isChecking: false,
    isAvailable: false,
    message: ''
  });

  // Reset form state
  const resetFormState = () => {
    setFormData({
      name: '',
      private_domain: '',
      public_domain: '',
      description: '',
      is_active: false
    });
    setDomainValidation({ isValid: false, message: '' });
    setDomainAvailability({
      isChecking: false,
      isAvailable: false,
      message: ''
    });
  };

  // Monitor formData changes for validation
  useEffect(() => {
    if (formData.private_domain && selectedSchool && isEditDialogOpen) {
      validateDomain(formData.private_domain);
    }
  }, [formData.private_domain, selectedSchool, isEditDialogOpen]);

  // Validate domain format and length
  const validateDomain = (domain: string) => {
    const formattedDomain = formatDomain(domain);

    if (formattedDomain.length < 5) {
      setDomainValidation({
        isValid: false,
        message: 'Domain must be at least 5 characters long'
      });
      setDomainAvailability({
        isChecking: false,
        isAvailable: false,
        message: ''
      });
      return;
    }

    checkDomainAvailability(formattedDomain);
  };

  // Check if domain is available and unique
  const checkDomainAvailability = (domain: string) => {
    if (!domain) return;

    setDomainAvailability({
      isChecking: true,
      isAvailable: false,
      message: 'Checking domain availability...'
    });

    setTimeout(() => {
      const isTaken = schools.some((school) => {
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(domain);
        return (
          schoolDomainPart === inputDomainPart &&
          school.id !== (selectedSchool?.id || 0)
        );
      });

      if (
        selectedSchool &&
        extractDomainPart(domain) ===
          extractDomainPart(selectedSchool.domain?.private_address || '')
      ) {
        setDomainAvailability({
          isChecking: false,
          isAvailable: true,
          message: 'This is your current domain name'
        });
      } else if (isTaken) {
        setDomainAvailability({
          isChecking: false,
          isAvailable: false,
          message: 'This domain name is already taken by another school'
        });
      } else {
        setDomainAvailability({
          isChecking: false,
          isAvailable: true,
          message: 'Domain name is available and unique'
        });
      }
    }, 500);
  };

  const handleCreateSchool = async () => {
    try {
      if (!formData.name) {
        ErrorHandler.showWarning('School name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each school must have a unique domain name.'
        );
        return;
      }

      const isDomainTaken = schools.some((school) => {
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return schoolDomainPart === inputDomainPart;
      });

      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another school. Please choose a unique domain name.'
        );
        return;
      }

      setIsSubmitting(true);

      const schoolData = {
        name: formData.name,
        private_domain: formatDomain(formData.private_domain),
        description: formData.description
      };

      const response = (await apiClient.createSchool(schoolData)) as any;
      if (response.data.status === 'fail') {
        ErrorHandler.showWarning(response.message);
        return;
      }
      ErrorHandler.showSuccess('School updated successfully');

      // Refresh schools list
      await refreshSchools();

      setIsCreateDialogOpen(false);
      resetFormState();
    } catch (error) {
      console.error('Error creating school:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSchool = async () => {
    try {
      if (!selectedSchool) {
        console.error('No school selected for update');
        return;
      }

      if (!formData.name) {
        ErrorHandler.showWarning('School name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each school must have a unique domain name.'
        );
        return;
      }

      if (!domainAvailability.isAvailable) {
        ErrorHandler.showWarning(
          'Please choose a unique domain name that is not already taken'
        );
        return;
      }

      const isDomainTaken = schools.some((school) => {
        if (!school.domain) return false;
        const schoolDomainPart = extractDomainPart(
          school.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return (
          schoolDomainPart === inputDomainPart &&
          school.id !== selectedSchool.id
        );
      });

      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another school. Please choose a unique domain name.'
        );
        return;
      }

      setIsSubmitting(true);

      const updateData: any = {};
      if (formData.name) updateData.name = formData.name;
      if (formData.private_domain)
        updateData.private_domain = formatDomain(formData.private_domain);
      if (formData.description !== undefined)
        updateData.description = formData.description;
      if (typeof formData.is_active === 'boolean')
        updateData.is_active = formData.is_active;

      const response = (await apiClient.updateSchool(updateData)) as any;
      if (response.data.status === 'fail') {
        ErrorHandler.showWarning(response.message);
        return;
      }
      ErrorHandler.showSuccess('School updated successfully');

      // Refresh schools list
      await refreshSchools();

      setIsEditDialogOpen(false);
      resetFormState();
      setSelectedSchool(null);
    } catch (error) {
      console.error('Error updating school:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter schools based on search term
  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.domain?.private_address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner message={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">
            {t('common.error')}
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <Button onClick={refreshSchools} variant="outline">
            {t('common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 space-y-6 p-6"
      dir={language === 'fa' || language === 'ar' ? 'rtl' : 'ltr'}
    >
      <PageHeader
        title={t('schools.schoolsManagement')}
        description={t('schools.manageSchoolsDescription')}
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t('schools.createSchool')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('schools.createSchool')}</DialogTitle>
              <DialogDescription>
                {t('schools.manageSchoolsDescription')}
              </DialogDescription>
            </DialogHeader>
            <SchoolForm
              formData={formData}
              onFormDataChange={(data) => setFormData(data)}
              domainValidation={domainValidation}
              domainAvailability={domainAvailability}
              isEdit={false}
            />
            <DialogFooter>
              <Button
                onClick={handleCreateSchool}
                disabled={
                  !formData.name || !formData.private_domain || isLoading
                }
              >
                {isLoading ? t('common.loading') : t('schools.createSchool')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <SearchBar
        placeholder={t('schools.searchSchools')}
        value={searchTerm}
        onChange={setSearchTerm}
        className="max-w-sm"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSchools.map((school) => (
          <SchoolCard
            key={school.id}
            school={school}
            onEdit={(school) => {
              const newFormData = {
                name: school?.name || '',
                private_domain: extractDomainPart(
                  school?.domain?.private_address || ''
                ),
                public_domain: school?.domain?.public_address || '',
                description: school?.description || '',
                is_active: school?.is_active ?? false
              };

              setSelectedSchool(school);
              setFormData(newFormData);
              setIsEditDialogOpen(true);
            }}
          />
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title={t('schools.noSchoolsFound')}
          description={
            searchTerm
              ? t('common.noResults')
              : t('schools.manageSchoolsDescription')
          }
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.edit')}</DialogTitle>
            <DialogDescription>
              {t('schools.manageSchoolsDescription')}
            </DialogDescription>
          </DialogHeader>
          <SchoolForm
            formData={formData}
            onFormDataChange={(data) => setFormData(data)}
            domainValidation={domainValidation}
            domainAvailability={domainAvailability}
            isEdit={true}
          />
          <DialogFooter>
            <Button
              onClick={handleUpdateSchool}
              disabled={!formData.name || !formData.private_domain || isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
