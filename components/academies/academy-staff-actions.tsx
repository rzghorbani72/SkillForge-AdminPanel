'use client';

import { useState } from 'react';
import { Eye, EyeOff, ImageIcon, MoreHorizontal, Trash2 } from 'lucide-react';
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
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { useTranslation } from '@/lib/i18n/hooks';
import type { Academy } from '@/types/api';

type AcademyStaffActionsProps = {
  academy: Pick<
    Academy,
    'id' | 'name' | 'listed_publicly' | 'showcase_desktop' | 'showcase_mobile'
  >;
  onChanged: () => void;
};

export function AcademyStaffActions({
  academy,
  onChanged
}: AcademyStaffActionsProps) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const listed = academy.listed_publicly !== false;

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
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmRemove(true)}
          >
            <Trash2 className="me-2 h-4 w-4" />
            {t('stores.removeAcademy')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AcademyShowcaseModal
        academy={academy}
        open={showcaseOpen}
        onClose={() => setShowcaseOpen(false)}
        onSaved={onChanged}
      />
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
