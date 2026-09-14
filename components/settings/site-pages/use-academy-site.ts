'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/error-handler';
import type { AcademyPage, ContactLink } from '@/types/academy-site';

type AcademySiteData = {
  pages: AcademyPage[];
  links: ContactLink[];
  isLoading: boolean;
  refresh: () => Promise<void>;
};

/** Loads both halves of the site-pages screen in one pass. */
export function useAcademySite(): AcademySiteData {
  const [pages, setPages] = useState<AcademyPage[]>([]);
  const [links, setLinks] = useState<ContactLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextPages, nextLinks] = await Promise.all([
        apiClient.getAcademyPages(),
        apiClient.getAcademyContactLinks(),
      ]);
      setPages(nextPages);
      setLinks(nextLinks);
    } catch (error) {
      ErrorHandler.handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pages, links, isLoading, refresh };
}
