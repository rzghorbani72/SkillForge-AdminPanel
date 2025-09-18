'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { School } from '@/types/api';
import { apiClient } from '@/lib/api';

interface SchoolContextType {
  selectedSchool: School | null;
  schools: School[];
  isLoading: boolean;
  error: string | null;
  setSelectedSchool: (school: School | null) => void;
  refreshSchools: () => Promise<void>;
  updateSchoolsList: (newSchools: School[]) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  SCHOOLS: 'skillforge_schools',
  SELECTED_SCHOOL: 'skillforge_selected_school',
  LAST_FETCH: 'skillforge_schools_last_fetch'
};

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load schools from cache on mount
  useEffect(() => {
    loadSchoolsFromCache();
  }, []);

  // Set first school as default when schools are loaded
  useEffect(() => {
    if (schools.length > 0 && !selectedSchool) {
      const firstSchool = schools[0];
      setSelectedSchool(firstSchool);
      saveSelectedSchoolToCache(firstSchool);
    }
  }, [schools, selectedSchool]);

  // Load schools from localStorage cache
  const loadSchoolsFromCache = () => {
    try {
      const cachedSchools = localStorage.getItem(STORAGE_KEYS.SCHOOLS);
      const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      const cachedSelectedSchool = localStorage.getItem(
        STORAGE_KEYS.SELECTED_SCHOOL
      );

      if (cachedSchools && lastFetch) {
        const schoolsData = JSON.parse(cachedSchools);
        const lastFetchTime = parseInt(lastFetch);
        const now = Date.now();

        // Check if cache is still valid (less than 1 hour old)
        if (now - lastFetchTime < CACHE_DURATION) {
          console.log('Loading schools from cache:', schoolsData);
          setSchools(schoolsData);

          // Restore selected school if it exists
          if (cachedSelectedSchool) {
            const selectedSchoolData = JSON.parse(cachedSelectedSchool);
            const foundSchool = schoolsData.find(
              (s: School) => s.id === selectedSchoolData.id
            );
            if (foundSchool) {
              setSelectedSchool(foundSchool);
            }
          }

          setIsLoading(false);
          return;
        }
      }

      // Cache expired or doesn't exist, fetch fresh data
      fetchSchools();
    } catch (error) {
      console.error('Error loading from cache:', error);
      fetchSchools();
    }
  };

  // Save schools to localStorage cache
  const saveSchoolsToCache = (schoolsData: School[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schoolsData));
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
      console.log('Schools saved to cache:', schoolsData);
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  // Save selected school to localStorage
  const saveSelectedSchoolToCache = (school: School) => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_SCHOOL,
        JSON.stringify(school)
      );
    } catch (error) {
      console.error('Error saving selected school to cache:', error);
    }
  };

  // Fetch schools from API (only when needed)
  const fetchSchools = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching schools from API...');
      const response = await apiClient.getMySchools();
      console.log('Schools API response:', response);

      if (response.status === 200 && response.data) {
        let schoolsData: School[] = [];

        // Handle response structure - data is now directly available
        if (Array.isArray(response.data)) {
          schoolsData = response.data;
        } else if (response.data.status === 'ok' && response.data.data) {
          // Fallback for legacy response structure
          schoolsData = response.data.data;
        } else {
          console.error('Unexpected response structure:', response.data);
          setError('Invalid response structure from server');
          return;
        }

        setSchools(schoolsData);
        saveSchoolsToCache(schoolsData);
        console.log('Schools fetched and cached:', schoolsData);
      } else {
        console.error('Unexpected response:', response);
        setError('Failed to fetch schools');
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch schools'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh schools (force fetch from API)
  const refreshSchools = async () => {
    await fetchSchools();
  };

  // Update schools list (called after CRUD operations)
  const updateSchoolsList = (newSchools: School[]) => {
    setSchools(newSchools);
    saveSchoolsToCache(newSchools);

    // Update selected school if it was deleted
    if (selectedSchool && !newSchools.find((s) => s.id === selectedSchool.id)) {
      const newSelectedSchool = newSchools[0] || null;
      setSelectedSchool(newSelectedSchool);
      if (newSelectedSchool) {
        saveSelectedSchoolToCache(newSelectedSchool);
      }
    }
  };

  // Handle selected school change
  const handleSelectedSchoolChange = (school: School | null) => {
    setSelectedSchool(school);
    if (school) {
      saveSelectedSchoolToCache(school);
    }
  };

  const value = {
    selectedSchool,
    schools,
    isLoading,
    error,
    setSelectedSchool: handleSelectedSchoolChange,
    refreshSchools,
    updateSchoolsList
  };

  return (
    <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
