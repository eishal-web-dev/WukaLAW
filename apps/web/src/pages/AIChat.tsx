import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Brain, Send, RefreshCw, FileText, ChevronDown, ChevronRight,
} from 'lucide-react'
import { askQuestion, errorMessage } from '../lib/api'
import type { AskResponse, Confidence, Source } from '../lib/api'
import { groupSources, passageSummary } from '../lib/sources'
import { formatScore, excerpt } from '../lib/format'
import { useAuth } from '../lib/auth'
import { Avatar, Badge, Btn, G, C } from '../components/design'
import Disclaimer from '../components/Disclaimer'
import ErrorAlert from '../components/ErrorAlert'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  text: string
  time: string
  confidence?: Confidence
  sources?: Source[]
  model?: string
}

function modelLabel(model: string): string {
  if (model === 'none') return 'No retrieval'
  if (model === 'library') return 'Answer library'
  if (model === 'lookup') return 'Direct lookup'
  if (model === 'extractive-fallback') return 'Extractive (fallback)'
  if (model.startsWith('ollama')) {
    const rest = model.replace(/^ollama[:/]?/, '')
    return rest ? `Ollama · ${rest}` : 'Ollama'
  }
  return model
}

function SourcesBlock({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false)
  const groups = groupSources(sources)
  if (sources.length === 0) return null
  return (
    <div className="mt-3 border-t border-white/[0.08] pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
        style={{ color: G }}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Sources — {passageSummary(sources)}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {groups.map((g) => (
            <div key={g.documentId} className="rounded-xl border border-white/[0.08] p-3" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={12} style={{ color: G }} />
                <span className="text-[11px] font-semibold text-foreground truncate">{g.documentTitle}</span>
                <span className="text-[10px] text-muted-foreground ml-auto flex-shrink-0">
                  {g.passages.length} passage{g.passages.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="space-y-2">
                {g.passages.map((p) => (
                  <div key={p.chunk_id} className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-semibold mr-1.5" style={{ color: '#34D399' }}>{formatScore(p.score)}</span>
                    {excerpt(p.text, 260)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ConfidenceLine({ confidence, model }: { confidence: Confidence; model?: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Badge label={`${confidence.level} confidence`} variant={confidence.level} />
      {model && <Badge label={modelLabel(model)} />}
      <span className="text-[10px] text-muted-foreground leading-relaxed w-full">{confidence.reason}</span>
    </div>
  )
}

export default function AIChat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, busy])

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  const send = async () => {
    const question = input.trim()
    if (!question || busy) return
    setError(null)
    setInput('')
    const history = messages.map((m) => ({ role: m.role, content: m.text }))
    setMessages((prev) => [...prev, { id: nextId.current++, role: 'user', text: question, time: now() }])
    setBusy(true)
    try {
      const res: AskResponse = await askQuestion(question, history)
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'ai',
          text: res.answer,
          time: now(),
          confidence: res.confidence,
          sources: res.sources,
          model: res.model,
        },
      ])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const quickPrompts = [
    'What is the main issue in my uploaded documents?',
    'Summarize the key facts across my case files',
    'What legal points appear in my documents?',
    'What was the outcome described in my documents?',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${G}20` }}>
            <Sparkles size={16} style={{ color: G }} />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">WakuLaw AI Assistant</div>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Answers from your document library
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" size="sm" icon={<RefreshCw size={13} />} onClick={() => setMessages([])}>
            New Chat
          </Btn>
          <Btn variant="secondary" size="sm" icon={<FileText size={13} />} onClick={() => navigate('/documents')}>
            Documents
          </Btn>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${G}20` }}>
              <Brain size={24} style={{ color: G }} />
            </div>
            <div className="text-foreground font-semibold mb-2">Ask WakuLaw AI anything</div>
            <div className="text-muted-foreground text-sm mb-6">
              Questions are answered from your uploaded documents, with sources and confidence.
            </div>
            <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => setInput(p)}
                  className="p-3 rounded-xl border border-white/[0.08] text-xs text-muted-foreground hover:text-foreground hover:border-white/20 hover:bg-white/[0.04] transition-all text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'ai' ? (
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${G}20` }}>
                <Sparkles size={14} style={{ color: G }} />
              </div>
            ) : (
              <Avatar name={user?.name || 'You'} size="sm" />
            )}
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'text-[#0D1117]' : 'text-muted-foreground'}`}
              style={m.role === 'user' ? { backgroundColor: G } : { backgroundColor: C, border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              {m.role === 'ai' && m.confidence && <ConfidenceLine confidence={m.confidence} model={m.model} />}
              {m.role === 'ai' && m.sources && <SourcesBlock sources={m.sources} />}
              <div className={`text-[10px] mt-2 ${m.role === 'user' ? 'text-[#0D1117]/60 text-right' : 'text-muted-foreground/50'}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {busy && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${G}20` }}>
              <Sparkles size={14} style={{ color: G }} />
            </div>
            <div className="rounded-2xl px-4 py-3 text-sm text-muted-foreground" style={{ backgroundColor: C, border: '1px solid rgba(255,255,255,0.06)' }}>
              Analyzing your documents… <span style={{ color: G }}>●●●</span>
            </div>
          </div>
        )}

        {error && <ErrorAlert message={error} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/[0.06] p-4 flex-shrink-0">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) void send()
              }}
              placeholder="Ask about your uploaded documents..."
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#D4AF37]/50 pr-12"
            />
          </div>
          <button
            onClick={() => void send()}
            disabled={busy}
            className="px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium text-[#0D1117] transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: G }}
          >
            <Send size={15} />
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-3">
          <Disclaimer />
        </div>
      </div>
    </div>
  )
}
