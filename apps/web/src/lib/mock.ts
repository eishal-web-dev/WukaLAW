/**
 * Sample data used by PREVIEW screens (Prediction, Explainable AI, Timeline,
 * Reports, Analytics, Admin, Workspace) and by decorative
 * charts. Screens rendering this data carry a visible "Preview" banner.
 */

export interface MockMessage {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
}

export const CASES = [
  { id: 'WL-2024-001', title: 'Johnson v. MegaCorp Industries', type: 'Employment', status: 'Active', priority: 'High', prediction: 78, attorney: 'Sarah Chen', deadline: 'Mar 15, 2024', docs: 24, activity: '2h ago' },
  { id: 'WL-2024-002', title: 'Estate of Williams Trust', type: 'Probate', status: 'Review', priority: 'Medium', prediction: 65, attorney: 'Michael Torres', deadline: 'Apr 20, 2024', docs: 18, activity: '5h ago' },
  { id: 'WL-2024-003', title: 'DataTech LLC IP Dispute', type: 'IP', status: 'Active', priority: 'Critical', prediction: 82, attorney: 'Sarah Chen', deadline: 'Mar 1, 2024', docs: 41, activity: '1h ago' },
  { id: 'WL-2024-004', title: 'Harrison Property Dispute', type: 'Real Estate', status: 'Closed', priority: 'Low', prediction: 91, attorney: 'James Park', deadline: 'Feb 28, 2024', docs: 12, activity: '2d ago' },
  { id: 'WL-2024-005', title: 'Northfield Contract Breach', type: 'Commercial', status: 'Active', priority: 'High', prediction: 71, attorney: 'Lisa Wong', deadline: 'Mar 30, 2024', docs: 33, activity: '3h ago' },
  { id: 'WL-2024-006', title: 'Rivera Securities Fraud', type: 'Securities', status: 'Active', priority: 'Critical', prediction: 59, attorney: 'David Kim', deadline: 'Apr 5, 2024', docs: 67, activity: '45m ago' },
]

export const AREA_DATA = [
  { month: 'Jan', filed: 38, closed: 29, pending: 14 },
  { month: 'Feb', filed: 45, closed: 33, pending: 18 },
  { month: 'Mar', filed: 52, closed: 40, pending: 22 },
  { month: 'Apr', filed: 48, closed: 44, pending: 19 },
  { month: 'May', filed: 61, closed: 49, pending: 26 },
  { month: 'Jun', filed: 55, closed: 52, pending: 21 },
  { month: 'Jul', filed: 67, closed: 58, pending: 28 },
  { month: 'Aug', filed: 72, closed: 61, pending: 31 },
  { month: 'Sep', filed: 69, closed: 65, pending: 27 },
  { month: 'Oct', filed: 78, closed: 70, pending: 33 },
  { month: 'Nov', filed: 83, closed: 74, pending: 36 },
  { month: 'Dec', filed: 91, closed: 82, pending: 41 },
]

export const WIN_RATE_DATA = [
  { type: 'Employment', win: 82, loss: 18 },
  { type: 'IP', win: 76, loss: 24 },
  { type: 'Commercial', win: 71, loss: 29 },
  { type: 'Real Estate', win: 88, loss: 12 },
  { type: 'Securities', win: 64, loss: 36 },
  { type: 'Probate', win: 79, loss: 21 },
]

export const CASE_TYPE_PIE = [
  { name: 'Commercial', value: 31 },
  { name: 'IP', value: 24 },
  { name: 'Employment', value: 19 },
  { name: 'Real Estate', value: 14 },
  { name: 'Securities', value: 8 },
  { name: 'Probate', value: 4 },
]

export const PIE_COLORS = ['#D4AF37', '#4F8EF7', '#34D399', '#F87171', '#A78BFA', '#FB923C']

export const TIMELINE_EVENTS = [
  { date: 'Mar 15, 2024', event: 'Trial Date', desc: 'Scheduled trial commencement — Hon. Judge Patricia Wells presiding', type: 'hearing', case: 'WL-2024-001' },
  { date: 'Mar 10, 2024', event: 'Discovery Deadline', desc: 'Final submission deadline for all discovery materials', type: 'deadline', case: 'WL-2024-003' },
  { date: 'Mar 5, 2024', event: 'Expert Witness Deposition', desc: 'Dr. Alan Morse deposition — DataTech patent validity', type: 'deposition', case: 'WL-2024-003' },
  { date: 'Feb 28, 2024', event: 'Complaint Filed', desc: 'Johnson v. MegaCorp complaint submitted to Superior Court', type: 'filing', case: 'WL-2024-001' },
  { date: 'Feb 20, 2024', event: 'Preliminary Injunction Denied', desc: 'Court denied DataTech preliminary injunction motion', type: 'ruling', case: 'WL-2024-003' },
  { date: 'Feb 15, 2024', event: 'Case Opened', desc: 'WL-2024-006 Rivera Securities Fraud case initiated', type: 'filing', case: 'WL-2024-006' },
  { date: 'Feb 10, 2024', event: 'Settlement Conference', desc: 'Northfield Contract Breach mediation session — no agreement', type: 'hearing', case: 'WL-2024-005' },
]

export const RADAR_DATA = [
  { factor: 'Evidence', value: 85 },
  { factor: 'Precedent', value: 72 },
  { factor: 'Procedure', value: 90 },
  { factor: 'Judge Align.', value: 68 },
  { factor: 'Witness', value: 78 },
  { factor: 'Documentation', value: 94 },
]

export const INIT_MESSAGES: MockMessage[] = [
  { id: 1, role: 'ai', text: 'Hello, I am WakuLaw AI. I have analyzed all documents and evidence for WL-2024-003 DataTech LLC IP Dispute. How can I assist you today?', time: '10:32 AM' },
  { id: 2, role: 'user', text: 'What is the current win probability and what are the main risk factors?', time: '10:33 AM' },
  { id: 3, role: 'ai', text: 'Based on my analysis, the current win probability stands at **82%** — up from 76% after the expert witness report was filed.\n\nThe primary risk factors are:\n1. Prior art challenge from defendant (medium risk)\n2. Judge Wells has ruled against software patents in 3 of last 7 similar cases\n3. DataTech patent filing date predates the industry standard by only 14 days\n\nI recommend focusing on the functional uniqueness argument rather than novelty alone.', time: '10:33 AM' },
]
