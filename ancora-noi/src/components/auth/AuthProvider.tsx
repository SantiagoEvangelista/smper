import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, initialized, fetchUser, setInitialized } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        await fetchUser()
      } catch (e) {
        console.error('Auth init error:', e)
      } finally {
        if (isMounted) {
          setInitialized(true)
        }
      }
    }

    // Timeout after 5 seconds - force initialization
    const timeout = setTimeout(() => {
      if (isMounted && !initialized) {
        console.warn('Auth initialization timed out, forcing initialization')
        setInitialized(true)
      }
    }, 5000)

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUser()
      } else if (event === 'SIGNED_OUT') {
        navigate('/login')
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchUser, navigate, initialized, setInitialized])

  useEffect(() => {
    if (initialized && !loading) {
      const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
      
      if (!user && !isAuthPage) {
        navigate('/login', { replace: true })
      } else if (user && isAuthPage) {
        navigate('/', { replace: true })
      }
    }
  }, [user, loading, initialized, location.pathname, navigate])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
