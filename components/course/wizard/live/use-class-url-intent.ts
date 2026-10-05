'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import { NEW_CLASS_PARAM, REQUEST_PARAM, requestSlots } from './class-url-intent';
import type { LiveClassDraftApi } from './use-live-class-draft';

/** Runs `?new=1` / `?request=<id>` once the classes are loaded, then drops it from the URL. */
export function useClassUrlIntent(live: LiveClassDraftApi, ready: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handled = useRef(false);
  const wantsNew = searchParams.get(NEW_CLASS_PARAM) === '1';
  const requestId = searchParams.get(REQUEST_PARAM);

  useEffect(() => {
    if (!ready || handled.current || (!wantsNew && !requestId)) return;
    handled.current = true;

    const clearParams = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(NEW_CLASS_PARAM);
      params.delete(REQUEST_PARAM);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const apply = async () => {
      try {
        if (!requestId) {
          live.addClass();
          return;
        }
        const pending = await apiClient.getClassRequests({
          course_id: live.courseId,
          status: 'PENDING',
        });
        const request = pending.find((row) => row.id === requestId);
        if (request) live.addClass({ slots: requestSlots(request.windows) }, request.id);
      } catch (error) {
        ErrorHandler.handleApiError(error);
      } finally {
        clearParams();
      }
    };
    void apply();
  }, [ready, wantsNew, requestId, live, pathname, router, searchParams]);
}
