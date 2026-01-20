import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { useAuthStore } from './store/authStore'

function HydrateAuth() {
  const { fetchUser, setInitialized } = useAuthStore()
  
  useEffect(() => {
    let mounted = true
    
    const init = async () => {
      try {
        await fetchUser()
      } finally {
        if (mounted) {
          setInitialized(true)
        }
      }
    }
    
    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        setInitialized(true)
      }
    }, 3000)
    
    init()
    
    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [fetchUser, setInitialized])
  
  return null
}

function AppWithAuth() {
  return (
    <>
      <HydrateAuth />
      <App />
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithAuth />
  </StrictMode>,
)
