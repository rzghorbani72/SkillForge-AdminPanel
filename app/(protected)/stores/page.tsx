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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Store } from '@/types/api';
import { ErrorHandler } from '@/lib/error-handler';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { SearchBar } from '@/components/shared/SearchBar';
import { StoreCard } from '@/components/stores/StoreCard';
import { StoreForm } from '@/components/stores/StoreForm';
import { useStore } from '@/hooks/useStore';
import { extractDomainPart, formatDomain } from '@/lib/store-utils';
import { useTranslation } from '@/lib/i18n/hooks';
import { useAuthUser } from '@/hooks/useAuthUser';
import { toast } from 'react-toastify';

export default function StoresPage() {
  const { t, language } = useTranslation();
  const { stores, isLoading, error, refreshStores } = useStore();
  const { user } = useAuthUser();
  const role = user?.role;
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disconnectStore, setDisconnectStore] = useState<Store | null>(null);
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

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
    if (formData.private_domain && selectedStore && isEditDialogOpen) {
      validateDomain(formData.private_domain);
    }
  }, [formData.private_domain, selectedStore, isEditDialogOpen]);

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
      const isTaken = stores.some((store) => {
        const storeDomainPart = extractDomainPart(
          store.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(domain);
        return (
          storeDomainPart === inputDomainPart &&
          store.id !== (selectedStore?.id || 0)
        );
      });

      if (
        selectedStore &&
        extractDomainPart(domain) ===
          extractDomainPart(selectedStore.domain?.private_address || '')
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
          message: 'This domain name is already taken by another store'
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

  const handleCreateStore = async () => {
    try {
      if (!formData.name) {
        ErrorHandler.showWarning('Store name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each store must have a unique domain name.'
        );
        return;
      }

      const isDomainTaken = stores.some((store) => {
        const storeDomainPart = extractDomainPart(
          store.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return storeDomainPart === inputDomainPart;
      });

      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another store. Please choose a unique domain name.'
        );
        return;
      }

      setIsSubmitting(true);

      const storeData = {
        name: formData.name,
        private_domain: formatDomain(formData.private_domain),
        description: formData.description
      };

      const response = (await apiClient.createStore(storeData)) as any;
      if (response.data.status === 'fail') {
        ErrorHandler.showWarning(response.message);
        return;
      }
      ErrorHandler.showSuccess('Store created successfully');

      // Refresh stores list
      await refreshStores();

      setIsCreateDialogOpen(false);
      resetFormState();
    } catch (error) {
      console.error('Error creating store:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStore = async () => {
    try {
      if (!selectedStore) {
        console.error('No store selected for update');
        return;
      }

      if (!formData.name) {
        ErrorHandler.showWarning('Store name is required');
        return;
      }

      if (!formData.private_domain) {
        ErrorHandler.showWarning(
          'Domain name is required. Each store must have a unique domain name.'
        );
        return;
      }

      if (!domainAvailability.isAvailable) {
        ErrorHandler.showWarning(
          'Please choose a unique domain name that is not already taken'
        );
        return;
      }

      const isDomainTaken = stores.some((store) => {
        if (!store.domain) return false;
        const storeDomainPart = extractDomainPart(
          store.domain?.private_address || ''
        );
        const inputDomainPart = extractDomainPart(formData.private_domain);
        return (
          storeDomainPart === inputDomainPart && store.id !== selectedStore.id
        );
      });

      if (isDomainTaken) {
        ErrorHandler.showWarning(
          'This domain name is already taken by another store. Please choose a unique domain name.'
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

      const response = (await apiClient.updateStore(updateData)) as any;
      if (response.data.status === 'fail') {
        ErrorHandler.showWarning(response.message);
        return;
      }
      ErrorHandler.showSuccess('Store updated successfully');

      // Refresh stores list
      await refreshStores();

      setIsEditDialogOpen(false);
      resetFormState();
      setSelectedStore(null);
    } catch (error) {
      console.error('Error updating store:', error);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is manager in a store
  // Admins can have separate MANAGER profiles in stores (different from their main ADMIN profile)
  const isManagerInStore = (store: Store): boolean => {
    if (!user || !store.profiles || store.profiles.length === 0) return false;

    // Get user's identifying information (email and phone are unique identifiers)
    const userEmail = (user as any)?.profile?.email || (user as any)?.email;
    const userPhone =
      (user as any)?.profile?.phone_number || (user as any)?.phone_number;

    if (!userEmail && !userPhone) {
      console.warn('User email and phone not available for manager check');
      return false;
    }

    // Check if any profile in the store matches the user's email/phone and is a MANAGER
    const isManager = store.profiles.some((profile: any) => {
      // Match by email or phone (admins have separate MANAGER profiles with same email/phone)
      const emailMatch =
        userEmail && profile.email && profile.email === userEmail;
      const phoneMatch =
        userPhone && profile.phone_number && profile.phone_number === userPhone;

      const isMatch = emailMatch || phoneMatch;

      // Must be MANAGER role and active
      const isManagerRole =
        profile.role?.name === 'MANAGER' && profile.is_active;

      return isMatch && isManagerRole;
    });

    return isManager;
  };

  // Check if store has other managers (for disconnect validation)
  const hasOtherManagers = (store: Store): boolean => {
    if (!store.profiles || store.profiles.length === 0) return false;

    // Get user's identifying information
    const userEmail = (user as any)?.profile?.email || (user as any)?.email;
    const userPhone =
      (user as any)?.profile?.phone_number || (user as any)?.phone_number;

    if (!userEmail && !userPhone) {
      console.warn(
        'User email and phone not available for other managers check'
      );
      return false;
    }

    const otherManagers = store.profiles.filter((profile: any) => {
      // Check if this profile is NOT the current user (match by email or phone)
      const emailMatch =
        userEmail && profile.email && profile.email === userEmail;
      const phoneMatch =
        userPhone && profile.phone_number && profile.phone_number === userPhone;
      const isCurrentUser = emailMatch || phoneMatch;

      // Must be MANAGER role and active, and NOT the current user
      return (
        !isCurrentUser && profile.role?.name === 'MANAGER' && profile.is_active
      );
    });

    return otherManagers.length > 0;
  };

  const handleDisconnect = async () => {
    if (!disconnectStore || !user) return;

    try {
      setIsDisconnecting(true);
      // Use profile ID (user.id is the ADMIN profile ID from /me endpoint)
      // Note: ADMIN profiles are platform-level (store_id = null)
      // This will remove the MANAGER profile from the store, not the ADMIN profile
      const adminId = user.id;
      const response = await apiClient.disconnectFromStore(
        adminId,
        disconnectStore.id
      );

      if ((response as any)?.data?.status === 'ok') {
        toast.success('Disconnected from store successfully');
        await refreshStores();
        setIsDisconnectDialogOpen(false);
        setDisconnectStore(null);
      } else {
        const errorMessage =
          (response as any)?.data?.data ||
          (response as any)?.data?.message ||
          'Failed to disconnect from store';
        toast.error(errorMessage);
        ErrorHandler.handleApiError(new Error(errorMessage));
      }
    } catch (error: any) {
      console.error('Error disconnecting from store:', error);
      const errorMessage =
        error?.response?.data?.data ||
        error?.message ||
        'Failed to disconnect from store';
      toast.error(errorMessage);
      ErrorHandler.handleApiError(error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Filter stores based on search term
  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.domain?.private_address
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
          <Button onClick={refreshStores} variant="outline">
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
        title={t('stores.storesManagement')}
        description={t('stores.manageStoresDescription')}
      >
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="me-2 h-4 w-4" />
              {t('stores.createStore')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('stores.createStore')}</DialogTitle>
              <DialogDescription>
                {t('stores.manageStoresDescription')}
              </DialogDescription>
            </DialogHeader>
            <StoreForm
              formData={formData}
              onFormDataChange={(data) => setFormData(data)}
              domainValidation={domainValidation}
              domainAvailability={domainAvailability}
              isEdit={false}
            />
            <DialogFooter>
              <Button
                onClick={handleCreateStore}
                disabled={
                  !formData.name || !formData.private_domain || isLoading
                }
              >
                {isLoading ? t('common.loading') : t('stores.createStore')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <SearchBar
        placeholder={t('stores.searchStores')}
        value={searchTerm}
        onChange={setSearchTerm}
        className="max-w-sm"
      />

      {/* Show other stores user can access */}
      {user &&
        (user.role === 'MANAGER' || user.role === 'TEACHER') &&
        (() => {
          // Find stores where user has profiles but is not currently logged in
          const otherStores = stores.filter((store) => {
            if (!store.profiles || store.profiles.length === 0) return false;

            const userEmail =
              (user as any)?.profile?.email || (user as any)?.email;
            const userPhone =
              (user as any)?.profile?.phone_number ||
              (user as any)?.phone_number;
            const currentStoreId =
              (user as any)?.storeId || (user as any)?.store_id;

            // Check if user has a profile in this store (by email/phone match)
            const hasProfile = store.profiles.some((profile: any) => {
              const emailMatch =
                userEmail && profile.email && profile.email === userEmail;
              const phoneMatch =
                userPhone &&
                profile.phone_number &&
                profile.phone_number === userPhone;
              const isMatch = emailMatch || phoneMatch;
              const isManagerOrTeacher =
                (profile.role?.name === 'MANAGER' ||
                  profile.role?.name === 'TEACHER') &&
                profile.is_active;
              return isMatch && isManagerOrTeacher;
            });

            // Show if user has profile but is not currently logged into this store
            return hasProfile && store.id !== currentStoreId;
          });

          if (otherStores.length > 0) {
            return (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>You have access to other stores:</strong> You are
                  logged in as {user.role} in the current store, but you also
                  have {user.role} profiles in {otherStores.length} other store
                  {otherStores.length > 1 ? 's' : ''}:{' '}
                  {otherStores.map((s, idx) => (
                    <span key={s.id}>
                      <strong>{s.name}</strong>
                      {idx < otherStores.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  <br />
                  <span className="mt-2 block text-sm text-muted-foreground">
                    To access these stores, please logout and login again. The
                    login page will show all available stores for selection.
                  </span>
                </AlertDescription>
              </Alert>
            );
          }
          return null;
        })()}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => {
          const isManager = isManagerInStore(store);
          const canDisconnect = isManager && hasOtherManagers(store);

          return (
            <StoreCard
              key={store.id}
              store={store}
              isManager={isManager}
              canDisconnect={canDisconnect}
              onEdit={(store) => {
                const newFormData = {
                  name: store?.name || '',
                  private_domain: extractDomainPart(
                    store?.domain?.private_address || ''
                  ),
                  public_domain: store?.domain?.public_address || '',
                  description: store?.description || '',
                  is_active: store?.is_active ?? false
                };

                setSelectedStore(store);
                setFormData(newFormData);
                setIsEditDialogOpen(true);
              }}
              onDisconnect={(store) => {
                setDisconnectStore(store);
                setIsDisconnectDialogOpen(true);
              }}
            />
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <EmptyState
          icon={<Building2 className="h-12 w-12" />}
          title={t('stores.noStoresFound')}
          description={
            searchTerm
              ? t('common.noResults')
              : t('stores.manageStoresDescription')
          }
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('common.edit')}</DialogTitle>
            <DialogDescription>
              {t('stores.manageStoresDescription')}
            </DialogDescription>
          </DialogHeader>
          <StoreForm
            formData={formData}
            onFormDataChange={(data) => setFormData(data)}
            domainValidation={domainValidation}
            domainAvailability={domainAvailability}
            isEdit={true}
          />
          <DialogFooter>
            <Button
              onClick={handleUpdateStore}
              disabled={!formData.name || !formData.private_domain || isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog
        open={isDisconnectDialogOpen}
        onOpenChange={setIsDisconnectDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect from Store</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect from "{disconnectStore?.name}
              "?
              <br />
              <br />
              This will remove your <strong>MANAGER</strong> profile from this
              store. Your <strong>ADMIN</strong> role (platform-level) will
              remain unchanged.
              <br />
              <br />
              <strong>Note:</strong> ADMIN roles are platform-level only and are
              never connected to stores. Only your MANAGER role in this store
              will be removed.
              {!hasOtherManagers(disconnectStore || ({} as Store)) && (
                <span className="mt-2 block text-destructive">
                  <strong>Warning:</strong> This store has no other managers.
                  Please assign a manager before disconnecting.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDisconnecting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={
                isDisconnecting ||
                !hasOtherManagers(disconnectStore || ({} as Store))
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
