import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Itineraries } from '@/pages/Itineraries'
import { SupabaseTest } from '@/pages/SupabaseTest'
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return () => {
      unsubscribe?.()
    }
  }, [initializeAuth])

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/itineraries"
              element={
                <ProtectedRoute>
                  <Itineraries />
                </ProtectedRoute>
              }
            />
            <Route path="/supabase-test" element={<SupabaseTest />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
