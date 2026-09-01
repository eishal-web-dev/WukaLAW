import { BookOpen } from 'lucide-react'
import { PublicNav, PublicFooter, usePublicTokens } from '../components/PublicShell'

export default function Blog() {
  const { dark, BG, TX, TX2, GA, BD } = usePublicTokens()
  const CARD = dark ? "#0F1521" : "#FFFFFF";
  const posts = [
    { tag: "AI & Law", title: "How AI is Transforming Courtroom Strategy in Pakistan", excerpt: "A deep dive into how predictive analytics is changing how advocates approach Supreme Court hearings.", date: "Jul 28, 2024", read: "8 min", img: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=600&h=340&fit=crop&auto=format" },
    { tag: "Case Studies", title: "94% Accuracy: How WukaLAW Predicted 47 Consecutive Outcomes", excerpt: "Our AI model's performance analysis across a full quarter of real Pakistani court cases.", date: "Jul 15, 2024", read: "12 min", img: "https://images.unsplash.com/photo-1453945619913-79ec89a82c51?w=600&h=340&fit=crop&auto=format" },
    { tag: "Legal Tech", title: "The Rise of LegalTech in South Asia: Trends for 2024-2025", excerpt: "How Pakistan, India and Bangladesh are embracing AI tools to modernize their legal systems.", date: "Jul 8, 2024", read: "6 min", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop&auto=format" },
    { tag: "Product", title: "Introducing AI Strategy Assistant: Your AI Co-Counsel", excerpt: "Today we're launching our most powerful feature yet — a real-time strategic advisor trained on Pakistani case law.", date: "Jun 30, 2024", read: "5 min", img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop&auto=format" },
    { tag: "Research", title: "Understanding Judicial Bias: Patterns Across Pakistan's High Courts", excerpt: "An empirical analysis of 50,000 decisions reveals significant patterns in judicial decision-making across provinces.", date: "Jun 22, 2024", read: "15 min", img: "https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=600&h=340&fit=crop&auto=format" },
    { tag: "Tutorial", title: "Getting Started with WukaLAW: A 10-Minute Walkthrough", excerpt: "From case creation to your first AI prediction — everything you need to know to hit the ground running.", date: "Jun 18, 2024", read: "10 min", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=340&fit=crop&auto=format" },
  ];
  return (
    <div style={{ backgroundColor: BG, fontFamily: "Inter, sans-serif", minHeight: "100vh" }}>
      <PublicNav current="/blog" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 40px" }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 99, border: `1px solid ${GA}40`, background: `${GA}10`, marginBottom: 20 }}>
            <BookOpen size={12} color={GA} /><span style={{ fontSize: 11, color: GA, fontWeight: 700, letterSpacing: "0.06em" }}>BLOG & RESOURCES</span>
          </div>
          <h1 style={{ fontSize: "clamp(32px,4.5vw,56px)", fontWeight: 900, color: TX, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 16 }}>Legal AI Insights</h1>
          <p style={{ fontSize: 16, color: TX2, maxWidth: 480, lineHeight: 1.7 }}>Research, tutorials and product updates from the WukaLAW team.</p>
        </div>
        {/* Featured */}
        <div style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 20, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: 32 }}>
          <img src={posts[0].img} alt={posts[0].title} style={{ width: "100%", height: 300, objectFit: "cover" }} />
          <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: GA, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Featured · {posts[0].tag}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: TX, lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 14 }}>{posts[0].title}</h2>
            <p style={{ fontSize: 14, color: TX2, lineHeight: 1.7, marginBottom: 20 }}>{posts[0].excerpt}</p>
            <div style={{ fontSize: 12, color: TX2 }}>{posts[0].date} · {posts[0].read} read</div>
          </div>
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingBottom: 80 }}>
          {posts.slice(1).map((p, i) => (
            <div key={i} style={{ background: CARD, border: `1px solid ${BD}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 24px 60px rgba(0,0,0,0.2)`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}>
              <img src={p.img} alt={p.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />
              <div style={{ padding: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: GA, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{p.tag}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TX, lineHeight: 1.4, letterSpacing: "-0.01em", marginBottom: 10 }}>{p.title}</div>
                <p style={{ fontSize: 12.5, color: TX2, lineHeight: 1.65, marginBottom: 12 }}>{p.excerpt}</p>
                <div style={{ fontSize: 11, color: TX2 }}>{p.date} · {p.read} read</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}

