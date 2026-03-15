import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Home } from '@/pages/Home'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { SupabaseTest } from '@/pages/SupabaseTest'

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/supabase-test" element={<SupabaseTest />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App
