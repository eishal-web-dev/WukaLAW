import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/FigmaAppShell'
import { ProtectedRoute, GuestRoute, AdminRoute, PortalRoute } from './components/RouteGuards'

// Auth
import Login from './pages/Login'
import Register from './pages/Register'

// App screens (live)
import Dashboard from './pages/Dashboard'
import ClientDashboard from './pages/ClientDashboard'
import ClientCases from './pages/ClientCases'
import ClientWorkspace from './pages/ClientWorkspace'
import ClientUpload from './pages/ClientUpload'
import ClientEvidence from './pages/ClientEvidence'
import ClientTimeline from './pages/ClientTimeline'
import ClientAISummary from './pages/ClientAISummary'
import ClientRequestCase from './pages/ClientRequestCase'
import ClientCourtPrediction from './pages/ClientCourtPrediction'
import ClientExplainableAI from './pages/ClientExplainableAI'
import ClientReportGenerator from './pages/ClientReportGenerator'
import ClientDownloads from './pages/ClientDownloads'
import ClientBilling from './pages/ClientBilling'
import ClientSimilarCases from './pages/ClientSimilarCases'
import ClientSearch from './pages/ClientSearch'
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
import AdminOperations from './pages/AdminOperations'

// App screens (preview — sample data)
import LawyerWorkspace from './pages/LawyerWorkspace'
import LawyerCalendar from './pages/LawyerCalendar'
import LawyerTasks from './pages/LawyerTasks'
import LawyerHearings from './pages/LawyerHearings'
import LawyerResearch from './pages/LawyerResearch'
import LawyerStrategy from './pages/LawyerStrategy'
import LawyerMessages from './pages/LawyerMessages'
import LawyerTeam from './pages/LawyerTeam'
import LawyerBilling from './pages/LawyerBilling'
import LawyerClients from './pages/LawyerClients'
import Prediction from './pages/Prediction'
import Explainable from './pages/Explainable'
import Timeline from './pages/Timeline'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

const FigmaPublicPage = lazy(() => import('./figma/FigmaPublicPage'))

function FigmaPublicRoute({ page }: { page: 'landing' | 'about' | 'practice-areas' | 'case-studies' | 'contact' | 'find-lawyer' | 'lawyer-profile' | 'pricing' | 'features' | 'solutions' | 'blog' | 'faq' | 'careers' | 'privacy' | 'terms' }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <FigmaPublicPage page={page} />
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

      {/* Signed-in users return to their own portal. */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/signup" element={<Navigate to="/register" replace />} />
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/cases" element={<Cases />} />
          <Route path="/cases/:id" element={<CaseDetail />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/evidence" element={<Evidence />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/similar-cases" element={<SimilarCases />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          {/* Lawyer-only screens */}
          <Route element={<PortalRoute portal="lawyer" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/billing" element={<LawyerBilling />} />
            <Route path="/clients" element={<LawyerClients />} />
            <Route path="/clients/:clientId" element={<LawyerClients />} />
            <Route path="/hearings" element={<LawyerHearings />} />
            <Route path="/calendar" element={<LawyerCalendar />} />
            <Route path="/tasks" element={<LawyerTasks />} />
            <Route path="/ai-strategy" element={<LawyerStrategy />} />
            <Route path="/research" element={<LawyerResearch />} />
            <Route path="/strategy" element={<LawyerStrategy />} />
            <Route path="/report-generator" element={<Reports generatorOnly />} />
            <Route path="/messages" element={<LawyerMessages />} />
            <Route path="/team" element={<LawyerTeam />} />
            <Route path="/workspace" element={<LawyerWorkspace />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/explainable" element={<Explainable />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
          {/* Client-only screens */}
          <Route element={<PortalRoute portal="client" />}>
            <Route path="/client" element={<ClientDashboard />} />
            <Route path="/client/cases" element={<ClientCases />} />
            <Route path="/client/cases/:caseId/workspace" element={<ClientWorkspace />} />
            <Route path="/client/search" element={<ClientSearch />} />
            <Route path="/client/workspace" element={<Navigate to="/client/cases" replace />} />
            <Route path="/client/upload" element={<ClientUpload />} />
            <Route path="/client/evidence" element={<ClientEvidence />} />
            <Route path="/client/timeline" element={<ClientTimeline />} />
            <Route path="/client/ai-summary" element={<ClientAISummary />} />
            <Route path="/client/request-case" element={<ClientRequestCase />} />
            <Route path="/client/similar-cases" element={<ClientSimilarCases />} />
            <Route path="/client/predictions" element={<ClientCourtPrediction />} />
            <Route path="/client/explainable" element={<ClientExplainableAI />} />
            <Route path="/client/report-generator" element={<ClientReportGenerator />} />
            <Route path="/client/downloads" element={<ClientDownloads />} />
            <Route path="/client/billing" element={<ClientBilling />} />
          </Route>
          {/* Admin routes require the server-assigned role. */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminOperations />} />
            <Route path="/admin/lawyers" element={<AdminOperations />} />
            <Route path="/admin/clients" element={<AdminOperations />} />
            <Route path="/admin/roles" element={<AdminOperations />} />
            <Route path="/admin/ai-models" element={<AdminOperations />} />
            <Route path="/admin/datasets" element={<AdminOperations />} />
            <Route path="/admin/knowledge" element={<AdminOperations />} />
            <Route path="/admin/analytics" element={<AdminOperations />} />
            <Route path="/admin/audit" element={<AdminOperations />} />
            <Route path="/admin/security" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/admin/api" element={<Navigate to="/admin/settings" replace />} />
            <Route path="/admin/billing" element={<AdminOperations />} />
            <Route path="/admin/support" element={<AdminOperations />} />
            <Route path="/admin/cms" element={<AdminOperations />} />
            <Route path="/admin/settings" element={<AdminOperations />} />
            <Route path="/admin/backup" element={<AdminOperations />} />
            <Route path="/admin/health" element={<AdminOperations />} />
            <Route path="/admin/reports" element={<AdminOperations />} />
          </Route>
          {/* Shared timeline and preferences keep the account portal shell. */}
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
