import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Loading } from '@/components/ui/Loading'
import { useAuthStore } from '@/stores/authStore'

const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('@/pages/Register').then(m => ({ default: m.Register })))
const Itineraries = lazy(() => import('@/pages/Itineraries').then(m => ({ default: m.Itineraries })))
const ItineraryPlanner = lazy(() => import('@/pages/ItineraryPlanner').then(m => ({ default: m.ItineraryPlanner })))
const ItineraryDetail = lazy(() => import('@/pages/ItineraryDetail').then(m => ({ default: m.ItineraryDetail })))
const ExpenseManager = lazy(() => import('@/pages/ExpenseManager').then(m => ({ default: m.ExpenseManager })))
const SupabaseTest = lazy(() => import('@/pages/SupabaseTest').then(m => ({ default: m.SupabaseTest })))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loading size="lg" text="加载中..." />
    </div>
  )
}

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
          <Suspense fallback={<PageLoader />}>
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
              <Route
                path="/itineraries/new"
                element={
                  <ProtectedRoute>
                    <ItineraryPlanner />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/itineraries/:id"
                element={
                  <ProtectedRoute>
                    <ItineraryDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/itineraries/:itineraryId/expenses"
                element={
                  <ProtectedRoute>
                    <ExpenseManager />
                  </ProtectedRoute>
                }
              />
              <Route path="/supabase-test" element={<SupabaseTest />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
