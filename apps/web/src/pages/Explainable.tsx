import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip,
} from 'recharts'
import { CASE_TYPE_PIE, PIE_COLORS } from '../lib/mock'
import { Card, Badge, SectionHeader, CustomTooltip, G } from '../components/design'
import PreviewBanner from '../components/PreviewBanner'
import Disclaimer from '../components/Disclaimer'

export default function Explainable() {
  const factors = [
    { name: 'Documentary Evidence Quality', value: 94, weight: 28, impact: 'positive' },
    { name: 'Procedural Compliance', value: 90, weight: 22, impact: 'positive' },
    { name: 'Patent Filing Validity', value: 88, weight: 25, impact: 'positive' },
    { name: 'Witness Credibility Index', value: 76, weight: 12, impact: 'positive' },
    { name: 'Precedent Alignment Score', value: 72, weight: 18, impact: 'positive' },
    { name: 'Judge Ruling Pattern Risk', value: 32, weight: 15, impact: 'negative' },
    { name: 'Opposition Strength Factor', value: 29, weight: 10, impact: 'negative' },
  ]

  return (
    <div className="p-8 space-y-7 overflow-y-auto h-full">
      <PreviewBanner />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Explainable AI</h1>
        <p className="text-muted-foreground text-sm mt-1">Transparent AI decision analysis for WL-2024-003 — Model v4.2</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <SectionHeader title="Factor Importance & Impact" action={<Badge label="82% Win Prediction" variant="Active" />} />
            <div className="space-y-4">
              {factors.map((f) => (
                <div key={f.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${f.impact === 'positive' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {f.impact === 'positive' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      </span>
                      <span className="text-xs text-foreground font-medium">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Weight: {f.weight}%</span>
                      <span className="text-xs font-bold" style={{ color: f.impact === 'positive' ? '#34D399' : '#F87171' }}>
                        {f.value}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${f.value}%`, backgroundColor: f.impact === 'positive' ? '#34D399' : '#F87171' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Decision Path Explanation" />
            <div className="space-y-3">
              {[
                { step: '1', title: 'Evidence Assessment', desc: 'AI reviewed 41 documents and classified 6 evidence items. Documentary evidence scored 94/100 — highest confidence tier.', outcome: 'Strong' },
                { step: '2', title: 'Precedent Matching', desc: 'Semantic search matched 5 cases with >70% similarity. Oracle v. Google (91% match) provides direct positive precedent.', outcome: 'Favorable' },
                { step: '3', title: 'Judge Pattern Analysis', desc: 'Judge Wells profile analysis: 7 software patent cases (4 win, 3 loss). Skepticism factor applied as -12% baseline adjustment.', outcome: 'Risk' },
                { step: '4', title: 'Final Probability', desc: 'Bayesian network combining all factors yields 82% win probability. Confidence interval: 74%–89% at 95% CI.', outcome: '82% Win' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4 p-4 rounded-xl border border-white/[0.05]">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-[#0D1117]" style={{ backgroundColor: G }}>
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">{s.title}</span>
                      <Badge label={s.outcome} variant={s.outcome === 'Risk' ? 'High' : 'Active'} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-sm font-semibold text-foreground mb-3">Confidence Breakdown</div>
            <ResponsiveContainer width="100%" height={180}>
              <RPieChart>
                <Pie data={CASE_TYPE_PIE} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {CASE_TYPE_PIE.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index]} opacity={0.85} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {['Evidence', 'Precedent', 'Procedure', 'Witness', 'Judge', 'Other'].map((l, i) => (
                <div key={l} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                  <span className="text-foreground font-medium">{CASE_TYPE_PIE[i].value}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <div className="text-sm font-semibold text-foreground mb-3">Model Info</div>
            <div className="space-y-2 text-xs">
              {[['Model Version', 'wukaLAW v4.2'], ['Training Cases', '50,247'], ['Accuracy', '94.2%'], ['Last Update', 'Mar 1, 2024'], ['Method', 'Bayesian + BERT'], ['Confidence Interval', '74%–89%']].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground font-medium">{v}</span>
                </div>
              ))}
            </div>
          </Card>
          <Disclaimer />
        </div>
      </div>
    </div>
  )
}
