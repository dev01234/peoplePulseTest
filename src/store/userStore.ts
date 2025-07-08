import { create } from "zustand";
import { User } from "@/types";
import { persist } from 'zustand/middleware'

interface UserStore {
  user: User | null;
  update: (user: User | null) => void;
  // Optionally, you can still have a logout helper:
  logout: () => void;
  getToken: () => string | undefined;
  
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      update: (user: User | null) => set(() => ({ user })),
      logout: () => set({ user: null }),
      getToken: () => get().user?.token,
    }),
    {
      name: "user-storage", // Unique name for localStorage key
    }
  )
);