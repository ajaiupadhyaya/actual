import { create } from "zustand";

type AuthState = {
  token: string | null;
  email: string | null;
  setAuth: (token: string, email: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  setAuth: (token, email) => set({ token, email }),
  clearAuth: () => set({ token: null, email: null })
}));
