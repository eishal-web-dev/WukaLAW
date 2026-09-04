import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/FigmaAppShell'
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/RouteGuards'

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
import AdminDashboard from './pages/AdminDashboard'

// App screens (preview — sample data)
import Workspace from './pages/Workspace'
import Prediction from './pages/Prediction'
import Explainable from './pages/Explainable'
import Timeline from './pages/Timeline'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const FigmaPublicPage = lazy(() => import('./figma/FigmaPublicPage'))
const FigmaPortalPage = lazy(() => import('./figma/FigmaPortalPage'))

function FigmaPublicRoute({ page }: { page: 'landing' | 'about' | 'practice-areas' | 'case-studies' | 'contact' | 'find-lawyer' | 'lawyer-profile' | 'pricing' | 'features' | 'solutions' | 'blog' | 'faq' | 'careers' | 'privacy' | 'terms' }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FigmaPublicPage page={page} />
    </Suspense>
  )
}

function FigmaPortalRoute({ page }: { page: string }) {
  return (
    <Suspense fallback={<div className="h-full bg-background" />}>
      <FigmaPortalPage page={page} />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public marketing */}
      <Route path="/" element={<FigmaPublicRoute page="landing" />} />
      <Route path="/about" element={<FigmaPublicRoute page="about" />} />
      <Route path="/practice-areas" element={<FigmaPublicRoute page="practice-areas" />} />
      <Route path="/case-studies" element={<FigmaPublicRoute page="case-studies" />} />
      <Route path="/contact" element={<FigmaPublicRoute page="contact" />} />
      <Route path="/find-lawyer" element={<FigmaPublicRoute page="find-lawyer" />} />
      <Route path="/lawyer-profile" element={<FigmaPublicRoute page="lawyer-profile" />} />
      <Route path="/pricing" element={<FigmaPublicRoute page="pricing" />} />
      <Route path="/features" element={<FigmaPublicRoute page="features" />} />
      <Route path="/solutions" element={<FigmaPublicRoute page="solutions" />} />
      <Route path="/blog" element={<FigmaPublicRoute page="blog" />} />
      <Route path="/faq" element={<FigmaPublicRoute page="faq" />} />
      <Route path="/careers" element={<FigmaPublicRoute page="careers" />} />
      <Route path="/privacy" element={<FigmaPublicRoute page="privacy" />} />
      <Route path="/terms" element={<FigmaPublicRoute page="terms" />} />

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
          {/* Complete Figma Make lawyer portal */}
          <Route path="/clients" element={<FigmaPortalRoute page="lp-clients" />} />
          <Route path="/clients/detail" element={<FigmaPortalRoute page="lp-client-detail" />} />
          <Route path="/hearings" element={<FigmaPortalRoute page="lp-hearings" />} />
          <Route path="/calendar" element={<FigmaPortalRoute page="lp-calendar" />} />
          <Route path="/tasks" element={<FigmaPortalRoute page="lp-tasks" />} />
          <Route path="/ai-strategy" element={<FigmaPortalRoute page="lp-ai-strategy" />} />
          <Route path="/research" element={<FigmaPortalRoute page="lp-research" />} />
          <Route path="/strategy" element={<FigmaPortalRoute page="lp-strategy" />} />
          <Route path="/report-generator" element={<FigmaPortalRoute page="lp-report-gen" />} />
          <Route path="/messages" element={<FigmaPortalRoute page="lp-messages" />} />
          <Route path="/team" element={<FigmaPortalRoute page="lp-team" />} />
          <Route path="/billing" element={<FigmaPortalRoute page="lp-billing" />} />
          {/* Complete Figma Make client portal */}
          <Route path="/client" element={<FigmaPortalRoute page="cp-dashboard" />} />
          <Route path="/client/cases" element={<FigmaPortalRoute page="cp-cases" />} />
          <Route path="/client/search" element={<FigmaPortalRoute page="cp-search" />} />
          <Route path="/client/workspace" element={<FigmaPortalRoute page="cp-workspace" />} />
          <Route path="/client/upload" element={<FigmaPortalRoute page="cp-upload" />} />
          <Route path="/client/evidence" element={<FigmaPortalRoute page="cp-evidence" />} />
          <Route path="/client/ai-summary" element={<FigmaPortalRoute page="cp-ai-summary" />} />
          <Route path="/client/similar-cases" element={<FigmaPortalRoute page="cp-similar" />} />
          <Route path="/client/predictions" element={<FigmaPortalRoute page="cp-predictions" />} />
          <Route path="/client/explainable" element={<FigmaPortalRoute page="cp-explainable" />} />
          <Route path="/client/report-generator" element={<FigmaPortalRoute page="cp-report-gen" />} />
          <Route path="/client/downloads" element={<FigmaPortalRoute page="cp-downloads" />} />
          {/* Admin routes require the server-assigned role. */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminDashboard />} />
            <Route path="/admin/lawyers" element={<FigmaPortalRoute page="ap-lawyers" />} />
            <Route path="/admin/clients" element={<FigmaPortalRoute page="ap-clients" />} />
            <Route path="/admin/roles" element={<FigmaPortalRoute page="ap-roles" />} />
            <Route path="/admin/ai-models" element={<FigmaPortalRoute page="ap-ai-model" />} />
            <Route path="/admin/datasets" element={<FigmaPortalRoute page="ap-datasets" />} />
            <Route path="/admin/knowledge" element={<FigmaPortalRoute page="ap-knowledge" />} />
            <Route path="/admin/analytics" element={<FigmaPortalRoute page="ap-analytics" />} />
            <Route path="/admin/audit" element={<FigmaPortalRoute page="ap-audit" />} />
            <Route path="/admin/security" element={<FigmaPortalRoute page="ap-security" />} />
            <Route path="/admin/api" element={<FigmaPortalRoute page="ap-api" />} />
            <Route path="/admin/billing" element={<FigmaPortalRoute page="ap-billing" />} />
            <Route path="/admin/support" element={<FigmaPortalRoute page="ap-support" />} />
            <Route path="/admin/cms" element={<FigmaPortalRoute page="ap-cms" />} />
            <Route path="/admin/settings" element={<FigmaPortalRoute page="ap-settings" />} />
            <Route path="/admin/backup" element={<FigmaPortalRoute page="ap-backup" />} />
            <Route path="/admin/health" element={<FigmaPortalRoute page="ap-health" />} />
            <Route path="/admin/reports" element={<FigmaPortalRoute page="ap-reports" />} />
          </Route>
          {/* Preview screens */}
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/explainable" element={<Explainable />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
