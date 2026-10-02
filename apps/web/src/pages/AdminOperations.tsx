import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Activity, Bot, Briefcase, Database, FileText, HardDrive, HeartPulse, Search, ShieldCheck, Users } from 'lucide-react'
import {
  adminGetStats, adminGetSystem, adminListActivity, adminListCases, adminListDocuments,
  adminListUsers, adminUpdateUserRole, errorMessage,
  type AdminActivity, type AdminCase, type AdminDocument, type AdminStats, type AdminSystem, type AdminUser,
} from '../lib/api'

const titles: Record<string, [string,string]> = {
  users:['User Management','Search accounts, review usage and manage portal access.'],
  lawyers:['Lawyer Management','Real lawyer accounts and their current caseloads.'],
  clients:['Client Management','Real client accounts and uploaded records.'],
  roles:['Roles & Access','Manage lawyer/client portal access without exposing administrator privileges.'],
  'ai-models':['AI Configuration','Current provider and embedding configuration reported by the backend.'],
  datasets:['Dataset Status','Live indexed-content and legal-corpus configuration status.'],
  knowledge:['Knowledge Base','Documents currently available to WukaLAW workflows.'],
  analytics:['Platform Analytics','Live account, case and document distributions.'],
  audit:['Activity Log','Recent account, case and document activity from persisted records.'],
  security:['Security','Access controls and backend configuration safety.'],
  api:['API Status','Backend, database, storage and retrieval service status.'],
  billing:['Billing','Whether a production billing provider is configured.'],
  support:['Support','Whether a support channel is configured for this deployment.'],
  cms:['Content Management','Whether an external CMS is connected.'],
  settings:['Platform Settings','Read-only operational configuration with secrets hidden.'],
  backup:['Backup','Whether an external backup destination is configured.'],
  health:['System Health','Live health indicators from the WukaLAW backend.'],
  reports:['Platform Reports','Live cases and workload information for operational review.'],
}
const card='rounded-xl border border-border bg-card p-5'

export default function AdminOperations(){
 const section=useLocation().pathname.split('/').filter(Boolean).pop()||'users'
 const [stats,setStats]=useState<AdminStats|null>(null),[users,setUsers]=useState<AdminUser[]>([]),[cases,setCases]=useState<AdminCase[]>([]),[documents,setDocuments]=useState<AdminDocument[]>([]),[activity,setActivity]=useState<AdminActivity[]>([]),[system,setSystem]=useState<AdminSystem|null>(null),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const load=async()=>{setLoading(true);try{const[s,u,c,d,a,y]=await Promise.all([adminGetStats(),adminListUsers(),adminListCases(),adminListDocuments(),adminListActivity(),adminGetSystem()]);setStats(s);setUsers(u);setCases(c);setDocuments(d);setActivity(a);setSystem(y);setError('')}catch(e){setError(errorMessage(e))}finally{setLoading(false)}}
 useEffect(()=>{void load()},[])
 const meta=titles[section]||['Admin Operations','Live platform administration.']
 const isAccounts=['users','lawyers','clients','roles'].includes(section)
 const isAnalytics=['analytics','reports'].includes(section)
 const isAudit=section==='audit'
 const isKnowledge=section==='knowledge'
 const filteredUsers=useMemo(()=>users.filter(u=>{
   if(section==='lawyers'&&u.role!=='lawyer')return false;if(section==='clients'&&u.role!=='client')return false
   const q=query.toLowerCase();return !q||`${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q)
 }),[users,query,section])
 const status=(ok:boolean,yes='Configured',no='Not configured')=><span className={`rounded-full px-2 py-1 text-xs font-semibold ${ok?'bg-emerald-500/15 text-emerald-300':'bg-amber-500/15 text-amber-300'}`}>{ok?yes:no}</span>
 if(loading)return <div className="h-full grid place-items-center text-muted-foreground">Loading live administration data…</div>
 return <div className="p-6 space-y-5 overflow-auto h-full"><header><h1 className="text-2xl font-bold">{meta[0]}</h1><p className="text-sm text-muted-foreground mt-1">{meta[1]}</p></header>{error&&<div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
 {isAccounts&&<><div className="relative max-w-xl"><Search size={15} className="absolute left-3 top-3 text-muted-foreground"/><input className="w-full rounded-lg border border-border bg-card py-2.5 pl-9 pr-3 text-sm" placeholder="Search name, email or role" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground">{['Account','Role','Cases','Documents','Joined','Access'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{filteredUsers.map(u=><tr key={u.id} className="border-b border-border/60"><td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></td><td className="px-4 py-3 capitalize">{u.role}</td><td className="px-4 py-3">{u.case_count}</td><td className="px-4 py-3">{u.document_count}</td><td className="px-4 py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td><td className="px-4 py-3">{u.role==='admin'?<span className="text-xs text-muted-foreground">Protected admin</span>:<select aria-label={`Role for ${u.name}`} className="rounded border border-border bg-background px-2 py-1 text-xs" value={u.role} onChange={async e=>{try{await adminUpdateUserRole(u.id,e.target.value as 'client'|'lawyer');await load()}catch(err){setError(errorMessage(err))}}}><option value="lawyer">Lawyer</option><option value="client">Client</option></select>}</td></tr>)}</tbody></table>{!filteredUsers.length&&<p className="p-8 text-center text-muted-foreground">No matching accounts.</p>}</div></>}
 {isAnalytics&&<><div className="grid md:grid-cols-4 gap-4">{[[Users,'Users',stats?.total_users||0],[Briefcase,'Cases',stats?.total_cases||0],[Activity,'Active cases',stats?.active_cases||0],[FileText,'Documents',stats?.total_documents||0]].map(([Icon,label,value])=>{const I=Icon as typeof Users;return <div className={card} key={String(label)}><I className="text-[#D4AF37]" size={18}/><p className="text-3xl font-bold mt-3">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p></div>})}</div><div className="grid lg:grid-cols-2 gap-4"><section className={card}><h2 className="font-bold mb-3">Case status</h2>{Array.from(new Set(cases.map(c=>c.status))).map(s=>{const n=cases.filter(c=>c.status===s).length;return <div key={s} className="mb-3"><div className="flex justify-between text-sm"><span>{s}</span><span>{n}</span></div><div className="h-2 rounded bg-white/10 mt-1"><div className="h-full bg-[#D4AF37] rounded" style={{width:`${cases.length?n/cases.length*100:0}%`}}/></div></div>})}</section><section className={card}><h2 className="font-bold mb-3">Recent cases</h2>{cases.slice(0,10).map(c=><div key={c.id} className="border-b border-border py-2"><div className="flex justify-between gap-3"><p className="text-sm font-semibold">{c.case_number} · {c.title}</p><span className="text-xs">{c.status}</span></div><p className="text-xs text-muted-foreground">{c.lawyer_name||'Unassigned'} · {c.document_count} document(s)</p></div>)}</section></div></>}
 {isAudit&&<div className="space-y-3">{activity.map(a=><div key={a.id} className={`${card} flex gap-3`}><div className="rounded-lg bg-[#D4AF37]/15 p-2 h-fit">{a.kind==='user'?<Users size={16}/>:a.kind==='case'?<Briefcase size={16}/>:<FileText size={16}/>}</div><div><p className="font-semibold text-sm">{a.title}</p><p className="text-sm text-muted-foreground">{a.detail}</p><p className="text-[10px] text-muted-foreground mt-1">{new Date(a.created_at).toLocaleString()}</p></div></div>)}</div>}
 {isKnowledge&&<div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-xs text-muted-foreground">{['Document','Owner','Case','OCR','Summary','Uploaded'].map(h=><th key={h} className="px-4 py-3">{h}</th>)}</tr></thead><tbody>{documents.map(d=><tr key={d.id} className="border-b border-border/60"><td className="px-4 py-3"><p className="font-semibold">{d.title}</p><p className="text-xs text-muted-foreground">{d.filename}</p></td><td className="px-4 py-3">{d.owner_name}</td><td className="px-4 py-3">{d.case_number||'Unlinked'}</td><td className="px-4 py-3">{d.ocr_used?'Yes':'No'}</td><td className="px-4 py-3">{d.has_summary?'Ready':'Not generated'}</td><td className="px-4 py-3 text-xs">{new Date(d.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
 {!isAccounts&&!isAnalytics&&!isAudit&&!isKnowledge&&system&&<SystemSection section={section} system={system} stats={stats} documents={documents} status={status}/>} </div>
}

function SystemSection({section,system,stats,documents,status}:{section:string,system:AdminSystem,stats:AdminStats|null,documents:AdminDocument[],status:(ok:boolean,yes?:string,no?:string)=>React.ReactNode}){
 const operational=[['API',system.api_status==='healthy',system.api_status],['Database',true,system.database_backend],['Storage',true,system.storage_backend],['AI provider',system.ai_configured,system.ai_provider],['Legal corpus',system.legal_corpus_configured,system.legal_retrieval_backend]] as const
 if(section==='billing'||section==='support'||section==='cms'||section==='backup'){
  const configured={billing:system.billing_configured,support:system.support_configured,cms:system.cms_configured,backup:system.backup_configured}[section]
  const env={billing:'STRIPE_SECRET_KEY or PADDLE_API_KEY',support:'SUPPORT_EMAIL',cms:'CMS_API_URL',backup:'BACKUP_BUCKET'}[section]
  return <div className={card}><h2 className="font-bold mb-3">Current deployment</h2>{status(Boolean(configured))}<p className="text-sm text-muted-foreground mt-4">{configured?'This integration is configured on the backend.':'No real integration is configured, so WukaLAW will not display fabricated data or pretend actions succeeded.'}</p>{!configured&&<p className="mt-3 rounded-lg bg-background p-3 text-xs">Configure <code>{env}</code> on the backend deployment, then restart the API.</p>}</div>
 }
 if(section==='ai-models')return <div className="grid md:grid-cols-3 gap-4"><div className={card}><Bot className="text-[#D4AF37]"/><h2 className="font-bold mt-3">Answer provider</h2><p className="mt-2">{system.ai_provider}</p>{status(system.ai_configured)}</div><div className={card}><Database className="text-[#D4AF37]"/><h2 className="font-bold mt-3">Embedding model</h2><p className="text-sm mt-2 break-words">{system.embedding_model}</p></div><div className={card}><ShieldCheck className="text-[#D4AF37]"/><h2 className="font-bold mt-3">Secrets</h2><p className="text-sm text-muted-foreground mt-2">Keys are checked server-side and never returned to this page.</p></div></div>
 if(section==='datasets')return <div className="grid md:grid-cols-3 gap-4"><div className={card}><Database/><p className="text-3xl font-bold mt-3">{system.total_chunks}</p><p className="text-xs text-muted-foreground">User-document chunks</p></div><div className={card}><FileText/><p className="text-3xl font-bold mt-3">{documents.length}</p><p className="text-xs text-muted-foreground">Recent documents inspected</p></div><div className={card}><HardDrive/><h2 className="font-bold mt-3">Pakistani judgments</h2>{status(system.legal_corpus_configured)}<p className="text-xs text-muted-foreground mt-2">Backend: {system.legal_retrieval_backend}</p></div></div>
 return <><div className="grid md:grid-cols-3 gap-4">{operational.map(([label,ok,detail])=><div key={label} className={card}><HeartPulse className={ok?'text-emerald-400':'text-amber-400'}/><h2 className="font-bold mt-3">{label}</h2><p className="text-sm text-muted-foreground mt-1 break-words">{detail}</p><div className="mt-3">{status(ok,ok?'Healthy':'Configured')}</div></div>)}</div>{section==='security'&&<div className={card}><h2 className="font-bold">Security controls active</h2><ul className="mt-3 text-sm text-muted-foreground space-y-2"><li>• Admin routes require the server-assigned administrator role.</li><li>• Administrator privilege cannot be granted or removed from this UI.</li><li>• API keys and connection secrets are never returned to the browser.</li><li>• Role changes are restricted to client and lawyer access.</li></ul></div>}<div className={card}><p className="text-sm text-muted-foreground">{stats?.total_users||0} users · {system.notifications_enabled_users} with in-app notifications enabled · {system.total_chunks} searchable user-document chunks.</p></div></>
}
