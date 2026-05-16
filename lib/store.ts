import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { persist } from 'zustand/middleware';
import { Column } from '@/sections/kanban/board-column';
import { UniqueIdentifier } from '@dnd-kit/core';
import { Category } from '@/types/api';
import { apiClient } from './api';

export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

const defaultCols = [
  {
    id: 'TODO' as const,
    title: 'Todo'
  }
] satisfies Column[];

export type ColumnId = (typeof defaultCols)[number]['id'];

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
};

export type State = {
  tasks: Task[];
  columns: Column[];
  draggedTask: string | null;
};

const initialTasks: Task[] = [
  {
    id: 'task1',
    status: 'TODO',
    title: 'Project initiation and planning'
  },
  {
    id: 'task2',
    status: 'TODO',
    title: 'Gather requirements from stakeholders'
  }
];

export type Actions = {
  addTask: (title: string, description?: string) => void;
  addCol: (title: string) => void;
  dragTask: (id: string | null) => void;
  removeTask: (title: string) => void;
  removeCol: (id: UniqueIdentifier) => void;
  setTasks: (updatedTask: Task[]) => void;
  setCols: (cols: Column[]) => void;
  updateCol: (id: UniqueIdentifier, newName: string) => void;
};

export const useTaskStore = create<State & Actions>()(
  persist(
    (set) => ({
      tasks: initialTasks,
      columns: defaultCols,
      draggedTask: null,
      addTask: (title: string, description?: string) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id: uuid(), title, description, status: 'TODO' }
          ]
        })),
      updateCol: (id: UniqueIdentifier, newName: string) =>
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, title: newName } : col
          )
        })),
      addCol: (title: string) =>
        set((state) => ({
          columns: [
            ...state.columns,
            { title, id: state.columns.length ? title.toUpperCase() : 'TODO' }
          ]
        })),
      dragTask: (id: string | null) => set({ draggedTask: id }),
      removeTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),
      removeCol: (id: UniqueIdentifier) =>
        set((state) => ({
          columns: state.columns.filter((col) => col.id !== id)
        })),
      setTasks: (newTasks: Task[]) => set({ tasks: newTasks }),
      setCols: (newCols: Column[]) => set({ columns: newCols })
    }),
    { name: 'task-store', skipHydration: true }
  )
);

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
  const candidate = (
    obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)
      ? obj.data
      : obj
  ) as Category;
  return typeof candidate.name === 'string' ? candidate : null;
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
  academyId?: number | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllAcademies?: boolean;
  canManagePlatform?: boolean;
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    academy_id?: number | null;
    academyId?: number | null;
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
    slug: string;
    domain?: string | null;
    currency?: string;
    currency_symbol?: string;
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

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
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
          const canManageAllAcademies =
            currentUser?.canManageAllAcademies ??
            currentUser?.canManageAllStores ??
            false;
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
    }),
    {
      name: 'user-store',
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isInitialized: state.isInitialized
      })
    }
  )
);
