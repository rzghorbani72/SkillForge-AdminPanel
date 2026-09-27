'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getBrowserApiBaseUrl } from '@/lib/api-base-url';
import { useTranslation } from '@/lib/i18n/hooks';
import { useNumberFormat } from '@/lib/i18n/use-number-format';

interface Props {
  submissionId: string;
  imageIds: readonly string[];
}

/** Answer photos are private: the route checks the viewer is the student or the course staff. */
function answerImageUrl(submissionId: string, imageId: string): string {
  return `${getBrowserApiBaseUrl()}/assignments/submissions/${encodeURIComponent(submissionId)}/images/${encodeURIComponent(imageId)}`;
}

export function AnswerImageGallery({ submissionId, imageIds }: Props) {
  const { t } = useTranslation();
  const formatNumber = useNumberFormat();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (imageIds.length === 0) return null;
  const total = imageIds.length;
  const step = (delta: number) =>
    setOpenIndex((index) => (index == null ? index : (index + delta + total) % total));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {imageIds.map((imageId, index) => (
          <button
            key={imageId}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={t('media.imagePreview')}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={answerImageUrl(submissionId, imageId)}
              alt=""
              className="h-20 w-20 rounded-md border object-cover transition-opacity hover:opacity-80"
            />
          </button>
        ))}
      </div>

      <Dialog open={openIndex != null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-h-[90dvh] max-w-[min(90vw,56rem)] overflow-hidden p-2 sm:p-3">
          <DialogTitle className="sr-only">{t('media.imagePreview')}</DialogTitle>
          {openIndex != null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={answerImageUrl(submissionId, imageIds[openIndex])}
              alt=""
              className="mx-auto max-h-[calc(90dvh-5rem)] w-auto max-w-full rounded-md object-contain"
            />
          ) : null}
          {total > 1 && openIndex != null ? (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => step(-1)}
                aria-label={t('assignmentsPage.previousImage')}
              >
                <ChevronRight className="h-4 w-4 ltr:rotate-180" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('assignmentsPage.imageCounter', {
                  current: formatNumber(openIndex + 1),
                  total: formatNumber(total),
                })}
              </span>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => step(1)}
                aria-label={t('assignmentsPage.nextImage')}
              >
                <ChevronLeft className="h-4 w-4 ltr:rotate-180" />
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
