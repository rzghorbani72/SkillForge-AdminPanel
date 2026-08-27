import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category } from '@/types/api';
import { apiClient } from './api';

// Categories Store
function parseCategoriesPayload(payload: unknown): Category[] {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Category =>
        !!item &&
        typeof item === 'object' &&
        typeof (item as Category).name === 'string'
    );
  }
  if (typeof payload !== 'object') return [];

  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.data)) return parseCategoriesPayload(obj.data);
  if (Array.isArray(obj.categories))
    return parseCategoriesPayload(obj.categories);
  if (obj.data && typeof obj.data === 'object') {
    return parseCategoriesPayload(obj.data);
  }
  return [];
}

export function parseCategoryFromApi(payload: unknown): Category | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  if (typeof obj.name === 'string') return obj as unknown as Category;
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    return parseCategoryFromApi(obj.data);
  }
  return null;
}

export type CategoriesState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
};

export type CategoriesActions = {
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  removeCategory: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  fetchCategories: (options?: { force?: boolean }) => Promise<void>;
  reset: () => void;
};

let categoriesFetchPromise: Promise<void> | null = null;
const CATEGORIES_FETCH_COOLDOWN_MS = 30_000;

export const useCategoriesStore = create<CategoriesState & CategoriesActions>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      lastFetchedAt: null,
      setCategories: (categories: Category[]) => set({ categories }),
      addCategory: (category: Category) =>
        set((state) => {
          if (!category?.name) return state;
          return { categories: [...state.categories, category] };
        }),
      updateCategory: (id: number, category: Partial<Category>) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...category } : cat
          )
        })),
      removeCategory: (id: number) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id)
        })),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      fetchCategories: async (options?: { force?: boolean }) => {
        if (categoriesFetchPromise) return categoriesFetchPromise;

        const { categories, error, lastFetchedAt } = get();
        const now = Date.now();

        if (!options?.force) {
          if (categories.length > 0) return;
          if (
            error &&
            lastFetchedAt &&
            now - lastFetchedAt < CATEGORIES_FETCH_COOLDOWN_MS
          ) {
            return;
          }
        }

        categoriesFetchPromise = (async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await apiClient.getCategories();
            const categoriesData = parseCategoriesPayload(response);

            set({
              categories: categoriesData,
              isLoading: false,
              error: null,
              lastFetchedAt: Date.now()
            });
          } catch (fetchError) {
            console.error('Error fetching categories:', fetchError);
            set({
              error: 'Failed to load categories',
              isLoading: false,
              lastFetchedAt: Date.now()
            });
          } finally {
            categoriesFetchPromise = null;
          }
        })();

        return categoriesFetchPromise;
      },
      reset: () => {
        categoriesFetchPromise = null;
        set({
          categories: [],
          isLoading: false,
          error: null,
          lastFetchedAt: null
        });
      }
    }),
    { name: 'categories-store', skipHydration: true }
  )
);

// User/Auth Store
export interface AuthUser {
  id: number;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  academyId?: string | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllAcademies?: boolean;
  canManagePlatform?: boolean;
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    academy_id?: string | null;
    academyId?: string | null;
    academy?: {
      id: number;
      name?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  currentAcademy?: {
    id: number;
    name: string;
    slug?: string;
    domain?: string | null;
  } | null;
  permissions?: string[];
  [key: string]: any;
}

export type UserState = {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
};

export type UserActions = {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUser: () => Promise<void>;
  reset: () => void;
};

export const useUserStore = create<UserState & UserActions>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  setUser: (user: AuthUser | null) => set({ user, isInitialized: true }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  fetchUser: async () => {
    const { isLoading } = get();
    if (isLoading) return; // Prevent concurrent fetches

    set({ isLoading: true, error: null });
    try {
      const userData = (await apiClient.getCurrentUser()) as any;
      const currentUser = userData?.data as any;

      if (!currentUser) {
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }

      const role =
        currentUser?.role ||
        currentUser?.profile?.role?.name ||
        currentUser?.profile?.role_name ||
        currentUser?.profile?.role ||
        null;

      if (!role) {
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }

      const academyId =
        currentUser?.academyId ?? currentUser?.academy_id ?? null;
      const currentAcademy = currentUser?.currentAcademy ?? null;

      const isAdminProfile = currentUser?.isAdminProfile ?? false;
      const platformLevel = currentUser?.platformLevel ?? false;
      const canManageAllAcademies = currentUser?.canManageAllAcademies ?? false;
      const canManagePlatform = currentUser?.canManagePlatform ?? false;

      const user: AuthUser = {
        id: (currentUser as any)?.id || 0,
        role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
        academyId: academyId,
        isAdminProfile: isAdminProfile,
        platformLevel: platformLevel,
        canManageAllAcademies: canManageAllAcademies,
        canManagePlatform: canManagePlatform,
        profile: {
          ...((currentUser as any)?.profile || {}),
          academy_id: academyId,
          academyId: academyId,
          academy:
            currentAcademy ||
            (currentUser as any)?.profile?.academy ||
            (currentUser as any)?.profile?.store ||
            null,
          role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
          isAdminProfile: isAdminProfile,
          platformLevel: platformLevel
        },
        currentAcademy: currentAcademy,
        permissions: currentUser?.permissions || []
      };

      set({ user, isLoading: false, isInitialized: true });
    } catch (error: any) {
      console.error('Error fetching user:', error);
      set({
        error: error?.message || 'Failed to fetch user',
        isLoading: false,
        isInitialized: true
      });
    }
  },
  reset: () =>
    set({
      user: null,
      isLoading: false,
      error: null,
      isInitialized: false
    })
}));

// Branding store — holds logo URL resolved from the theme config API
export const useBrandingStore = create<{
  logoUrl: string | null;
  setLogoUrl: (url: string | null) => void;
}>()((set) => ({
  logoUrl: null,
  setLogoUrl: (url) => set({ logoUrl: url })
}));
