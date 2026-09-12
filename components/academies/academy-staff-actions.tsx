'use client';

import { useState } from 'react';
import {
  Eye,
  EyeOff,
  ImageIcon,
  MoreHorizontal,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ConfirmDeleteModal from '@/components/modal/confirm-delete-modal';
import { AcademyShowcaseModal } from '@/components/academies/academy-showcase-modal';
import { ReasonDialog } from '@/components/platform/reason-dialog';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Academy } from '@/types/api';

type AcademyStaffActionsProps = {
  academy: Pick<
    Academy,
    | 'id'
    | 'name'
    | 'listed_publicly'
    | 'suspended_at'
    | 'showcase_desktop'
    | 'showcase_mobile'
    | 'has_transactions'
  >;
  onChanged: () => void;
  platformControls?: boolean;
};

export function AcademyStaffActions({
  academy,
  onChanged,
  platformControls = false
}: AcademyStaffActionsProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const listed = academy.listed_publicly !== false;
  const suspended = Boolean(academy.suspended_at);
  const deletable = !academy.has_transactions;

  async function liftSuspension() {
    setBusy(true);
    try {
      await apiClient.unsuspendAcademy(academy.id);
      toast.success(t('accountActions.unsuspended_ok'));
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function setListed(listedPublicly: boolean) {
    setBusy(true);
    try {
      await apiClient.setAcademyPublicListing(academy.id, listedPublicly);
      toast.success(
        listedPublicly ? t('stores.listedToast') : t('stores.hiddenToast')
      );
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      await apiClient.removeAcademyById(academy.id);
      toast.success(t('stores.storeDeleted'));
      setConfirmRemove(false);
      onChanged();
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 w-9 shrink-0 p-0"
            disabled={busy}
            aria-label={t('common.actions')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {platformControls && (
            <>
              <DropdownMenuItem
                disabled={busy}
                onSelect={() => setShowcaseOpen(true)}
              >
                <ImageIcon className="me-2 h-4 w-4" />
                {t('stores.landingScreenshots')}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={busy}
                onSelect={() => void setListed(!listed)}
              >
                {listed ? (
                  <EyeOff className="me-2 h-4 w-4" />
                ) : (
                  <Eye className="me-2 h-4 w-4" />
                )}
                {listed ? t('stores.hideFromPublic') : t('stores.showOnPublic')}
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={busy}
                onSelect={() =>
                  suspended ? void liftSuspension() : setSuspendOpen(true)
                }
              >
                {suspended ? (
                  <Play className="me-2 h-4 w-4" />
                ) : (
                  <Pause className="me-2 h-4 w-4" />
                )}
                {suspended
                  ? t('accountActions.unsuspend')
                  : t('accountActions.suspend')}
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem
            disabled={busy || !deletable}
            title={
              deletable
                ? undefined
                : t(
                    platformControls
                      ? 'stores.removeAcademyLocked'
                      : 'stores.removeAcademyLockedManager'
                  )
            }
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmRemove(true)}
          >
            <Trash2 className="me-2 h-4 w-4" />
            {t('stores.removeAcademy')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {platformControls && (
        <>
          <AcademyShowcaseModal
            academy={academy}
            open={showcaseOpen}
            onClose={() => setShowcaseOpen(false)}
            onSaved={onChanged}
          />
          <ReasonDialog
            open={suspendOpen}
            onOpenChange={setSuspendOpen}
            title={t('accountActions.suspendTitle')}
            description={t('accountActions.suspendDescription')}
            subject={academy.name}
            confirmLabel={t('accountActions.suspend')}
            onConfirm={async (reason) => {
              await apiClient.suspendAcademy(academy.id, reason);
              toast.success(t('accountActions.suspended_ok'));
            }}
            onDone={onChanged}
          />
        </>
      )}
      <ConfirmDeleteModal
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={academy.name}
        description={t('stores.removeAcademyConfirm')}
        confirmText={t('stores.removeAcademy')}
        onConfirm={() => void remove()}
        isLoading={busy}
      />
    </>
  );
}
