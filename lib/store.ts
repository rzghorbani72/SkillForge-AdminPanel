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
export type CategoriesState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

export type CategoriesActions = {
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: number, category: Partial<Category>) => void;
  removeCategory: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  fetchCategories: () => Promise<void>;
  reset: () => void;
};

export const useCategoriesStore = create<CategoriesState & CategoriesActions>()(
  persist(
    (set, get) => ({
      categories: [],
      isLoading: false,
      error: null,
      setCategories: (categories: Category[]) => set({ categories }),
      addCategory: (category: Category) =>
        set((state) => ({
          categories: [...state.categories, category]
        })),
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
      fetchCategories: async () => {
        const { isLoading } = get();
        if (isLoading) return; // Prevent concurrent fetches

        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.getCategories();
          let categoriesData: Category[] = [];

          if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
              categoriesData = response.data;
            } else if (
              response.data &&
              typeof response.data === 'object' &&
              Array.isArray((response.data as any).data)
            ) {
              categoriesData = (response.data as any).data;
            } else if (
              response.data &&
              typeof response.data === 'object' &&
              Array.isArray((response.data as any).categories)
            ) {
              categoriesData = (response.data as any).categories;
            }
          }

          set({ categories: categoriesData, isLoading: false });
        } catch (error) {
          console.error('Error fetching categories:', error);
          set({
            error: 'Failed to load categories',
            isLoading: false
          });
        }
      },
      reset: () => set({ categories: [], isLoading: false, error: null })
    }),
    { name: 'categories-store', skipHydration: true }
  )
);

// User/Auth Store
export interface AuthUser {
  id: number;
  role: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
  storeId?: number | null;
  isAdminProfile?: boolean;
  platformLevel?: boolean;
  canManageAllStores?: boolean;
  canManagePlatform?: boolean;
  profile?: {
    role?: 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT';
    store_id?: number | null;
    storeId?: number | null;
    store?: {
      id: number;
      name?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  currentStore?: {
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

          const storeId = currentUser?.storeId ?? currentUser?.store_id ?? null;
          const currentStore = currentUser?.currentStore ?? null;

          const isAdminProfile = currentUser?.isAdminProfile ?? false;
          const platformLevel = currentUser?.platformLevel ?? false;
          const canManageAllStores = currentUser?.canManageAllStores ?? false;
          const canManagePlatform = currentUser?.canManagePlatform ?? false;

          const user: AuthUser = {
            id: (currentUser as any)?.id || 0,
            role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
            storeId: storeId,
            isAdminProfile: isAdminProfile,
            platformLevel: platformLevel,
            canManageAllStores: canManageAllStores,
            canManagePlatform: canManagePlatform,
            profile: {
              ...((currentUser as any)?.profile || {}),
              store_id: storeId,
              storeId: storeId,
              store:
                currentStore || (currentUser as any)?.profile?.store || null,
              role: role as 'ADMIN' | 'MANAGER' | 'TEACHER' | 'STUDENT',
              isAdminProfile: isAdminProfile,
              platformLevel: platformLevel
            },
            currentStore: currentStore,
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
