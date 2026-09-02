import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import { ProtectedRoute, GuestRoute } from './components/RouteGuards'

// Public marketing pages
import Landing from './pages/Landing'
import About from './pages/About'
import PracticeAreas from './pages/PracticeAreas'
import CaseStudies from './pages/CaseStudies'
import Contact from './pages/Contact'
import FindLawyer from './pages/FindLawyer'
import LawyerProfile from './pages/LawyerProfile'

// Auth
import Login from './pages/Login'
import Register from './pages/Register'

// App screens (live)
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import CaseDetail from './pages/CaseDetail'
import Documents from './pages/Documents'
import DocumentDetail from './pages/DocumentDetail'
import Evidence from './pages/Evidence'
import AIChat from './pages/AIChat'
import SimilarCases from './pages/SimilarCases'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'

// App screens (preview — sample data)
import Workspace from './pages/Workspace'
import Prediction from './pages/Prediction'
import Explainable from './pages/Explainable'
import Timeline from './pages/Timeline'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      {/* Public marketing */}
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/practice-areas" element={<PracticeAreas />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/find-lawyer" element={<FindLawyer />} />
      <Route path="/lawyer-profile" element={<LawyerProfile />} />

      {/* Auth (redirect to /dashboard when already signed in) */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/similar-cases" element={<SimilarCases />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* Preview screens */}
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/explainable" element={<Explainable />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
