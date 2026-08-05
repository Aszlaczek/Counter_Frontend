import { create } from "zustand";
import type { User, Person, UserProfile } from "./type";

// ===== Auth Store =====
type AuthStoreSchema = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStoreSchema>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));

// ===== Local User Store (for form state) =====
type UserStoreSchema = {
  user: User;
  editUser: (option: string, state: string) => void;
  removeInfo: () => void;
  setUser: (user: User) => void;
};

export const useUserStore = create<UserStoreSchema>((set, get) => ({
  user: { id: null, name: "", surname: "", hours: "", date: "" },
  editUser: (option, state) =>
    set({ user: { ...get().user, [option]: state } }),
  removeInfo: () =>
    set({ user: { id: null, name: "", surname: "", hours: "", date: "" } }),
  setUser: (user) => set({ user: user }),
}));

// ===== Local Hours Store (counter) =====
type HoursStoreSchema = {
  min: number;
  hours: number;
  allHours: string;
  setMin: (minutes: number) => void;
  convert: () => void;
};

export const useHoursStore = create<HoursStoreSchema>((set, get) => ({
  min: 0,
  hours: 0,
  setMin: (minutes: number) => set({ min: minutes }),
  convert: () => {
    const { min } = get();
    const hours = Math.floor(min / 60);
    const remainingMin = min % 60;
    const allHours = `${hours}h ${remainingMin}min`;
    set({ hours, allHours });
  },
  allHours: "",
}));

// ===== Persons Store (synced with API) =====
type PersonListSchema = {
  list: Person[];
  setList: (list: Person[]) => void;
  addToList: (person: Person) => void;
  removeFromList: (id: number) => void;
  updateInList: (id: number, person: Person) => void;
};

export const usePersonListStore = create<PersonListSchema>((set, get) => ({
  list: [],
  setList: (list) => set({ list }),
  addToList: (person) => set({ list: [...get().list, person] }),
  removeFromList: (id) => set({ list: get().list.filter((p) => p.id !== id) }),
  updateInList: (id, person) =>
    set({ list: get().list.map((p) => (p.id === id ? person : p)) }),
}));

// ===== Extra Hours Store =====
import type { ExtraHours } from "./type";

type ExtraHoursListSchema = {
  list: ExtraHours[];
  setList: (list: ExtraHours[]) => void;
  addToList: (item: ExtraHours) => void;
  removeFromList: (id: number) => void;
  updateInList: (id: number, item: ExtraHours) => void;
};

export const useExtraHoursListStore = create<ExtraHoursListSchema>(
  (set, get) => ({
    list: [],
    setList: (list) => set({ list }),
    addToList: (item) => set({ list: [...get().list, item] }),
    removeFromList: (id) =>
      set({ list: get().list.filter((e) => e.id !== id) }),
    updateInList: (id, item) =>
      set({ list: get().list.map((e) => (e.id === id ? item : e)) }),
  }),
);

// ===== State Store (for loading/disabled states) =====
type StateSchema = {
  isDone: boolean;
  setStateFalse: () => void;
  setStateTrue: () => void;
};

export const useStateStore = create<StateSchema>((set) => ({
  isDone: true,
  setStateFalse: () => set({ isDone: false }),
  setStateTrue: () => set({ isDone: true }),
}));

// ===== PopUp Store (edit form visibility) =====
type EditFormSchema = {
  visible: boolean;
  show: () => void;
  hide: () => void;
};

export const usePopUpStore = create<EditFormSchema>((set) => ({
  visible: false,
  show: () => {
    set({ visible: true });
  },
  hide: () => set({ visible: false }),
}));

// ===== Toast Store (global notifications) =====
export type ToastType = "success" | "error" | "info";

export type ToastItem = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastStoreSchema = {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: number) => void;
};

let toastIdCounter = 0;

export const useToastStore = create<ToastStoreSchema>((set) => ({
  toasts: [],
  showToast: (message, type = "info") => {
    const id = ++toastIdCounter;
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Convenience helpers so components don't need to call getState() directly.
export const toast = {
  success: (message: string) =>
    useToastStore.getState().showToast(message, "success"),
  error: (message: string) =>
    useToastStore.getState().showToast(message, "error"),
  info: (message: string) =>
    useToastStore.getState().showToast(message, "info"),
};
