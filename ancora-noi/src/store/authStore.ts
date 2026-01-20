import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: (initialized: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  fetchUser: () => Promise<void>
}

// Safe storage without functions
const storage = {
  getItem: (name: string): string | null => {
    try {
      const item = localStorage.getItem(name)
      // If item contains functions, return null to reset
      if (item && (item.includes('function') || item.includes('=>'))) {
        return null
      }
      return item
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value)
    } catch (e) {
      console.warn('Storage error:', e)
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name)
    } catch (e) {
      console.warn('Storage error:', e)
    }
  },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signIn: async (email, password) => {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          if (!error) {
            await get().fetchUser()
          }
          return { error: error ? new Error(error.message) : null }
        } catch (e) {
          return { error: e as Error }
        }
      },

      signUp: async (email, password, fullName) => {
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          })
          return { error: error ? new Error(error.message) : null }
        } catch (e) {
          return { error: e as Error }
        }
      },

      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },

      fetchUser: async () => {
        set({ loading: true })
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            // Get profile from database
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              set({ user: profile })
            }
          }
        } catch (e) {
          console.error('Error fetching user:', e)
        } finally {
          set({ loading: false, initialized: true })
        }
      },
    }),
    {
      name: 'ancora-auth',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    }
  )
)
