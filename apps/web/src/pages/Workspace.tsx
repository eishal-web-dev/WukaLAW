import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Calendar, FileText, Edit2, Brain, BookOpen, Gavel, Users, Target,
  CheckCircle, Sparkles, AlertCircle, Award, Lightbulb, Search, Send, Cpu,
} from 'lucide-react'
import { CASES, TIMELINE_EVENTS, INIT_MESSAGES } from '../lib/mock'
import type { MockMessage } from '../lib/mock'
import { useNotifications } from '../lib/notifications'
import { formatRelativeTime } from '../lib/format'
import { Btn, Card, Badge, ProgressBar, G, B, C } from '../components/design'
import PreviewBanner from '../components/PreviewBanner'

const DOCS = [
  { name: 'Johnson_Complaint.pdf', type: 'PDF', size: '2.4 MB', date: 'Feb 28, 2024', tag: 'Pleading' },
  { name: 'Employment_Contract.docx', type: 'DOCX', size: '1.1 MB', date: 'Feb 25, 2024', tag: 'Contract' },
  { name: 'MegaCorp_Response.pdf', type: 'PDF', size: '3.7 MB', date: 'Feb 20, 2024', tag: 'Pleading' },
  { name: 'DataTech_Patent_001.pdf', type: 'PDF', size: '5.2 MB', date: 'Jan 15, 2024', tag: 'Evidence' },
  { name: 'Northfield_Agreement.pdf', type: 'PDF', size: '0.9 MB', date: 'Mar 1, 2024', tag: 'Contract' },
  { name: 'Rivera_SEC_Filing.pdf', type: 'PDF', size: '8.3 MB', date: 'Mar 3, 2024', tag: 'Filing' },
  { name: 'Expert_Witness_Report.docx', type: 'DOCX', size: '1.8 MB', date: 'Feb 18, 2024', tag: 'Report' },
  { name: 'Harrison_Title_Deed.pdf', type: 'PDF', size: '0.6 MB', date: 'Jan 30, 2024', tag: 'Evidence' },
]

export default function Workspace() {
  const navigate = useNavigate()
  const { notifications, markRead } = useNotifications()
  const [leftTab, setLeftTab] = useState('cases')
  const [centerTab, setCenterTab] = useState('overview')
  const [rightTab, setRightTab] = useState('chat')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<MockMessage[]>(INIT_MESSAGES)
  const selectedCase = CASES[2] // DataTech LLC

  const sendMsg = () => {
    if (!chatInput.trim()) return
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { id: prev.length + 1, role: 'user', text: chatInput, time: now }])
    setChatInput('')
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'ai',
          text: 'Based on my analysis of the case documents and current legal precedents, I recommend focusing on the functional novelty argument. The patent filing timestamp creates a 14-day window that can be leveraged as a technical differentiator.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 1000)
  }

  const leftTabs = [{ id: 'cases', label: 'Cases' }, { id: 'docs', label: 'Docs' }, { id: 'evidence', label: 'Evidence' }, { id: 'timeline', label: 'Timeline' }]
  const centerTabs = [{ id: 'overview', label: 'Overview' }, { id: 'ai-summary', label: 'AI Summary' }, { id: 'prediction', label: 'Prediction' }, { id: 'strategy', label: 'Strategy' }, { id: 'similar', label: 'Similar' }]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-3 flex-shrink-0">
        <PreviewBanner />
      </div>
      <div className="flex flex-1 overflow-hidden mt-3">
        {/* Left panel */}
        <div className="w-[240px] border-r border-white/[0.06] flex flex-col flex-shrink-0" style={{ backgroundColor: '#0D1117' }}>
          <div className="flex border-b border-white/[0.06] p-1.5 gap-1">
            {leftTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setLeftTab(t.id)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${leftTab === t.id ? 'text-[#0D1117]' : 'text-[#B3B3B3] hover:text-white'}`}
                style={leftTab === t.id ? { backgroundColor: G } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {leftTab === 'cases' &&
              CASES.map((c) => (
                <div
                  key={c.id}
                  className={`p-2.5 rounded-lg cursor-pointer transition-all ${c.id === selectedCase.id ? 'border border-white/10' : 'hover:bg-white/[0.04]'}`}
                  style={c.id === selectedCase.id ? { backgroundColor: 'rgba(212,175,55,0.08)', borderColor: `${G}30` } : {}}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${c.status === 'Active' ? 'bg-emerald-400' : c.status === 'Review' ? 'bg-blue-400' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-white leading-tight truncate">{c.title}</div>
                      <div className="text-[10px] text-[#B3B3B3] mt-0.5">{c.id}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge label={c.priority} />
                        <span className="text-[10px]" style={{ color: c.prediction >= 75 ? '#34D399' : G }}>{c.prediction}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            {leftTab === 'docs' &&
              DOCS.slice(0, 8).map((d) => (
                <div key={d.name} className="p-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all flex items-start gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: d.type === 'PDF' ? 'rgba(239,68,68,0.15)' : 'rgba(79,142,247,0.15)' }}>
                    <FileText size={11} className={d.type === 'PDF' ? 'text-red-400' : 'text-blue-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-medium text-white truncate">{d.name}</div>
                    <div className="text-[10px] text-[#B3B3B3]">{d.size} · {d.date}</div>
                    <Badge label={d.tag} />
                  </div>
                </div>
              ))}

            {leftTab === 'evidence' &&
              [
                { title: 'Patent Filing Record', conf: 94, type: 'Documentary' },
                { title: 'Competitor Product Launch Date', conf: 88, type: 'Digital' },
                { title: 'Expert Witness Statement', conf: 76, type: 'Testimonial' },
                { title: 'Source Code Repository', conf: 91, type: 'Digital' },
                { title: 'Industry Standards Doc', conf: 83, type: 'Documentary' },
              ].map((e) => (
                <div key={e.title} className="p-2.5 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-all">
                  <div className="text-[11px] font-medium text-white mb-1">{e.title}</div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-[#B3B3B3]">{e.type}</span>
                    <span className="text-[10px] font-semibold" style={{ color: e.conf >= 85 ? '#34D399' : G }}>{e.conf}%</span>
                  </div>
                  <ProgressBar value={e.conf} color={e.conf >= 85 ? '#34D399' : G} />
                </div>
              ))}

            {leftTab === 'timeline' &&
              TIMELINE_EVENTS.slice(0, 5).map((e, i) => (
                <div key={i} className="flex gap-2 p-2">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: e.type === 'hearing' ? '#A78BFA' : e.type === 'filing' ? B : e.type === 'ruling' ? '#F97316' : G }} />
                    {i < 4 && <div className="flex-1 w-px bg-white/10 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <div className="text-[11px] font-medium text-white leading-tight">{e.event}</div>
                    <div className="text-[10px] text-[#B3B3B3] mt-0.5">{e.date}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Center panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Case header */}
          <div className="border-b border-white/[0.06] p-5 flex-shrink-0" style={{ backgroundColor: 'rgba(30,37,48,0.5)' }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono" style={{ color: G }}>{selectedCase.id}</span>
                  <Badge label={selectedCase.status} />
                  <Badge label={selectedCase.priority} />
                </div>
                <h2 className="text-lg font-bold text-foreground">{selectedCase.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User size={11} /> {selectedCase.attorney}</span>
                  <span className="flex items-center gap-1"><Calendar size={11} /> {selectedCase.deadline}</span>
                  <span className="flex items-center gap-1"><FileText size={11} /> {selectedCase.docs} documents</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Win Probability</div>
                  <div className="text-2xl font-bold" style={{ color: G }}>{selectedCase.prediction}%</div>
                </div>
                <div className="flex gap-1">
                  <Btn variant="secondary" size="sm" icon={<Edit2 size={12} />}>Edit</Btn>
                  <Btn size="sm" icon={<Brain size={12} />}>Analyze</Btn>
                </div>
              </div>
            </div>
          </div>

          {/* Center tabs */}
          <div className="flex border-b border-white/[0.06] px-5 gap-1 flex-shrink-0" style={{ backgroundColor: 'rgba(13,17,23,0.5)' }}>
            {centerTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setCenterTab(t.id)}
                className={`py-3 px-3 text-xs font-medium border-b-2 transition-all ${centerTab === t.id ? 'text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                style={centerTab === t.id ? { borderColor: G } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {centerTab === 'overview' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    ['Case Type', selectedCase.type, <BookOpen key="i" size={14} />],
                    ['Filed', 'Jan 15, 2024', <Calendar key="i" size={14} />],
                    ['Court', 'Superior Court, CA', <Gavel key="i" size={14} />],
                  ].map(([l, v, ic]) => (
                    <Card key={String(l)} className="p-4">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        {ic as React.ReactNode}
                        <span className="text-xs">{String(l)}</span>
                      </div>
                      <div className="text-sm font-semibold text-foreground">{String(v)}</div>
                    </Card>
                  ))}
                </div>
                <Card className="p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Case Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    DataTech LLC alleges patent infringement against a competitor for unauthorized use of their proprietary data compression algorithm (US Patent 11,234,567). The defendant claims prior art and challenges the patent's novelty. Filed in the Northern District of California, this case involves complex technical evidence and requires expert witness testimony on software patents.
                  </p>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Users size={14} style={{ color: G }} /> Parties
                    </h4>
                    <div className="space-y-3">
                      {[{ role: 'Plaintiff', name: 'DataTech LLC', rep: 'Sarah Chen, WakuLaw' }, { role: 'Defendant', name: 'NovaTech Systems Inc.', rep: 'Robert Hayes, Hayes & Partners' }].map((p) => (
                        <div key={p.role} className="p-3 rounded-lg border border-white/[0.05]">
                          <div className="text-[10px] text-muted-foreground mb-1">{p.role}</div>
                          <div className="text-xs font-semibold text-foreground">{p.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{p.rep}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Target size={14} style={{ color: G }} /> Key Objectives
                    </h4>
                    <div className="space-y-2">
                      {['Establish patent validity and novelty', 'Prove willful infringement by defendant', 'Secure injunctive relief + damages $12M', 'Protect IP portfolio for future licensing'].map((o) => (
                        <div key={o} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" /> {o}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {centerTab === 'ai-summary' && (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} style={{ color: G }} />
                  <span className="text-sm font-semibold text-foreground">AI Case Analysis</span>
                  <span className="text-xs text-muted-foreground">Generated March 2, 2024 · Based on 41 documents</span>
                </div>
                {[
                  { title: 'Case Strengths', icon: <Award size={14} />, color: '#34D399', items: ['Strong patent filing with 14-day precedent advantage', 'Expert witness (Dr. Morse) has published peer-reviewed work on compression algorithms', 'Digital forensics confirm defendant accessed plaintiff code repository in 2022', 'Clear damages calculation supported by licensing market data'] },
                  { title: 'Risk Factors', icon: <AlertCircle size={14} />, color: '#F87171', items: ['Prior art challenge from defendant is substantive and requires rebuttal', 'Judge Wells ruled against software patent novelty claims in 3 of 7 recent cases', '14-day filing window is narrow — defendant will argue independent development', 'Expert witness availability may delay timeline'] },
                  { title: 'AI Recommendations', icon: <Lightbulb size={14} />, color: G, items: ['Lead with functional novelty argument, not temporal novelty', 'Request bench trial to avoid jury complexity on technical evidence', "File Daubert motion to limit defendant's expert testimony scope", 'Prepare strong damages expert to quantify lost licensing revenue'] },
                ].map((section) => (
                  <Card key={section.title} className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: section.color }}>{section.icon}</span>
                      <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
                    </div>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: section.color }} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </>
            )}

            {centerTab === 'prediction' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-5 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-2">Overall Win Probability</div>
                    <div className="text-6xl font-extrabold mb-2" style={{ color: G }}>82%</div>
                    <div className="text-xs text-emerald-400 flex items-center gap-1">+6% since last week</div>
                    <div className="w-full mt-4"><ProgressBar value={82} color={G} /></div>
                  </Card>
                  <Card className="p-5">
                    <div className="text-xs font-semibold text-foreground mb-4">Factor Breakdown</div>
                    <div className="space-y-3">
                      {[['Evidence Strength', 85, '#34D399'], ['Precedent Match', 72, B], ['Judge Alignment', 68, '#A78BFA'], ['Procedure Compliance', 90, '#34D399'], ['Witness Credibility', 78, G]].map(([l, v, c]) => (
                        <div key={String(l)}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{l}</span>
                            <span className="font-semibold" style={{ color: String(c) }}>{v}%</span>
                          </div>
                          <ProgressBar value={Number(v)} color={String(c)} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                <Card className="p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-4">Outcome Scenarios</h4>
                  <div className="space-y-3">
                    {[
                      { outcome: 'Full Win — Patent Upheld + Damages', prob: 48, color: '#34D399' },
                      { outcome: 'Partial Win — Patent Upheld, Reduced Damages', prob: 34, color: G },
                      { outcome: 'Settlement Before Trial', prob: 12, color: B },
                      { outcome: 'Loss — Patent Invalidated', prob: 6, color: '#F87171' },
                    ].map((s) => (
                      <div key={s.outcome} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground">{s.outcome}</span>
                            <span className="font-semibold" style={{ color: s.color }}>{s.prob}%</span>
                          </div>
                          <ProgressBar value={s.prob} max={60} color={s.color} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {centerTab === 'strategy' && (
              <div className="space-y-4">
                {[
                  { phase: 'Phase 1 — Pre-Trial', icon: <BookOpen size={14} />, steps: ['File comprehensive brief on patent validity with USPTO records', 'Engage Dr. Alan Morse as primary expert witness', 'Request defendant source code via Rule 34 discovery', "File motion to exclude defendant's expert Dr. Kovacs (Daubert)"] },
                  { phase: 'Phase 2 — Discovery', icon: <Search size={14} />, steps: ["Depose defendant's engineering team on development timeline", 'Obtain all internal communications from 2021–2022', 'Commission independent technical analysis of both codebases', 'Request financial records to establish damages baseline'] },
                  { phase: 'Phase 3 — Trial', icon: <Gavel size={14} />, steps: ['Lead with functional novelty — demonstrate unique algorithm architecture', 'Present side-by-side code comparison with expert commentary', 'Establish willfulness via internal memo (Exhibit 23)', 'Quantify damages: $12M lost licensing + $3.4M reasonable royalty'] },
                ].map((phase) => (
                  <Card key={phase.phase} className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: G }}>{phase.icon}</span>
                      <h4 className="text-sm font-semibold text-foreground">{phase.phase}</h4>
                    </div>
                    <div className="space-y-2">
                      {phase.steps.map((s, i) => (
                        <div key={s} className="flex items-start gap-3 text-xs text-muted-foreground">
                          <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-bold text-foreground flex-shrink-0">{i + 1}</div>
                          {s}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {centerTab === 'similar' && (
              <div className="space-y-3">
                {[
                  { title: 'Oracle America, Inc. v. Google LLC', court: 'Fed. Circuit 2021', similarity: 91, outcome: 'Win', relevance: 'Software patent functional novelty — closely mirrors argument structure' },
                  { title: 'Enfish LLC v. Microsoft Corp.', court: 'Fed. Circuit 2016', similarity: 84, outcome: 'Win', relevance: 'Abstract idea exception in Alice — favorable precedent for software claims' },
                  { title: 'Amdocs (Israel) Ltd. v. Openet Telecom', court: 'Fed. Circuit 2016', similarity: 79, outcome: 'Win', relevance: 'Network-specific data processing patent upheld — analogous technical domain' },
                  { title: "Alice Corp. v. CLS Bank Int'l", court: 'SCOTUS 2014', similarity: 67, outcome: 'Loss', relevance: 'Abstract idea doctrine risk — distinguish by emphasizing concrete implementation' },
                ].map((c) => (
                  <Card key={c.title} className="p-4 hover:border-white/10 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground mb-1">{c.title}</div>
                        <div className="text-xs text-muted-foreground mb-2">{c.court}</div>
                        <div className="text-xs text-muted-foreground leading-relaxed">{c.relevance}</div>
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className="text-xl font-bold mb-1" style={{ color: c.similarity >= 80 ? G : B }}>{c.similarity}%</div>
                        <div className="text-[10px] text-muted-foreground">match</div>
                        <Badge label={c.outcome} variant={c.outcome === 'Win' ? 'Active' : 'Critical'} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[300px] border-l border-white/[0.06] flex flex-col flex-shrink-0" style={{ backgroundColor: '#0D1117' }}>
          <div className="flex border-b border-white/[0.06] p-1.5 gap-1">
            {[{ id: 'chat', label: 'AI Chat' }, { id: 'memory', label: 'Memory' }, { id: 'notifs', label: 'Alerts' }].map((t) => (
              <button
                key={t.id}
                onClick={() => setRightTab(t.id)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${rightTab === t.id ? 'text-[#0D1117]' : 'text-[#B3B3B3] hover:text-white'}`}
                style={rightTab === t.id ? { backgroundColor: G } : {}}
              >
                {t.label}
              </button>
            ))}
          </div>

          {rightTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user' ? 'text-[#0D1117]' : 'text-[#B3B3B3]'}`}
                      style={m.role === 'user' ? { backgroundColor: G } : { backgroundColor: C, border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {m.role === 'ai' && (
                        <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-semibold" style={{ color: G }}>
                          <Sparkles size={10} /> WakuLaw AI
                        </div>
                      )}
                      <div className="whitespace-pre-line">{m.text}</div>
                      <div className={`text-[9px] mt-1.5 ${m.role === 'user' ? 'text-[#0D1117]/60' : 'text-[#B3B3B3]/50'}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/[0.06] p-3">
                <div className="flex gap-2 mb-2">
                  {['Risk factors?', 'Key precedents?', 'Next steps?'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="text-[10px] px-2 py-1 rounded-lg border border-white/10 text-[#B3B3B3] hover:text-white hover:border-white/20 transition-colors whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
                    placeholder="Ask AI about this case..."
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-[#B3B3B3] focus:outline-none focus:border-[#D4AF37]/50"
                  />
                  <button onClick={sendMsg} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: G }}>
                    <Send size={13} color="#0D1117" />
                  </button>
                </div>
              </div>
            </>
          )}

          {rightTab === 'memory' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-xs text-[#B3B3B3] mb-2 flex items-center gap-2">
                <Cpu size={12} style={{ color: G }} /> AI Memory for WL-2024-003
              </div>
              {[
                { key: 'Judge', value: 'Hon. Patricia Wells, N.D. Cal. — software patent skeptic (3/7 loss rate)' },
                { key: 'Key Risk', value: '14-day novelty window — defendant will argue independent development' },
                { key: 'Damages', value: '$12M lost licensing + $3.4M reasonable royalty calculated' },
                { key: 'Expert', value: 'Dr. Alan Morse confirmed — deposition scheduled Mar 5, 2024' },
                { key: 'Strategy', value: 'Lead with functional novelty, not temporal — avoid Alice challenge' },
              ].map((m) => (
                <div key={m.key} className="p-3 rounded-xl border border-white/[0.06]" style={{ backgroundColor: C }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color: G }}>{m.key}</div>
                  <div className="text-xs text-[#B3B3B3] leading-relaxed">{m.value}</div>
                </div>
              ))}
            </div>
          )}

          {rightTab === 'notifs' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifications.length === 0 && (
                <div className="text-xs text-[#B3B3B3] text-center py-8">No notifications yet.</div>
              )}
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!n.read) void markRead(n.id)
                    if (n.action_url) navigate(n.action_url)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      if (!n.read) void markRead(n.id)
                      if (n.action_url) navigate(n.action_url)
                    }
                  }}
                  className={`p-3 rounded-xl border transition-colors ${!n.read ? 'border-white/10' : 'border-white/[0.04]'}`}
                  style={{ backgroundColor: !n.read ? 'rgba(212,175,55,0.05)' : 'rgba(30,37,48,0.5)' }}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: G }} />}
                    <div>
                      <div className="text-xs font-medium text-white">{n.title}</div>
                      <div className="text-[10px] text-[#B3B3B3] mt-0.5 leading-relaxed">{n.body}</div>
                      <div className="text-[10px] text-[#B3B3B3]/60 mt-1">{formatRelativeTime(n.created_at)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
