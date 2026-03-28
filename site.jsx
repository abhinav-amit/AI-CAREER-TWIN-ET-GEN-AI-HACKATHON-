import { useState, useRef, useEffect, useCallback } from "react";

/* ─────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --bg: #050508; --bg2: #0a0a12; --bg3: #0f0f1a;
  --card: rgba(255,255,255,0.03);
  --border: rgba(255,255,255,0.07);
  --border-glow: rgba(139,92,246,0.3);
  --purple: #8b5cf6; --purple-bright: #a78bfa;
  --cyan: #22d3ee; --green: #34d399;
  --amber: #fbbf24; --red: #f87171;
  --text: #f0f0f8; --text-muted: #6b6b8a; --text-dim: #3d3d5c;
  --glow-purple: 0 0 40px rgba(139,92,246,0.25);
}
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
html, body, #root { height:100%; width:100%; overflow:hidden; }
body {
  background:var(--bg); color:var(--text);
  font-family:'Instrument Sans',sans-serif;
}
#root {
  background:var(--bg); color:var(--text);
}
::-webkit-scrollbar { width:4px; height:4px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
::-webkit-scrollbar-thumb:hover { background:var(--border-glow); }

@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse-green {
  0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,0.4)}
  50%{opacity:0.8;box-shadow:0 0 0 4px rgba(52,211,153,0)}
}
@keyframes ping {
  0%{transform:scale(1);opacity:1} 100%{transform:scale(1.4);opacity:0}
}
@keyframes wave {
  0%,100%{height:6px} 50%{height:24px}
}
@keyframes bounce {
  0%,100%{transform:translateY(0);opacity:0.4}
  50%{transform:translateY(-6px);opacity:1}
}
@keyframes slideInLeft  { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
@keyframes slideInRight { from{opacity:0;transform:translateX(16px)}  to{opacity:1;transform:translateX(0)} }

.screen-enter { animation: fadeUp 0.3s ease both; }
.slide-left   { animation: slideInLeft  0.35s ease both; }
.slide-right  { animation: slideInRight 0.35s ease both; }
`;

function injectGlobalStyles() {
  if (document.getElementById("act-global")) return;
  const s = document.createElement("style");
  s.id = "act-global";
  s.textContent = GLOBAL_CSS;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────
   DESIGN TOKENS (inline style helpers)
───────────────────────────────────────── */
const t = {
  card:   { background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:20 },
  cardSm: { background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:16 },
  glowCard: {
    background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.04))",
    border:"1px solid var(--border-glow)", borderRadius:14, padding:20
  },
  btnPrimary: {
    padding:"10px 22px", background:"linear-gradient(135deg,#8b5cf6,#6366f1)",
    border:"none", borderRadius:10, color:"#fff", fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif",
    boxShadow:"0 0 30px rgba(139,92,246,0.3)", transition:"all 0.2s"
  },
  btnSecondary: {
    padding:"10px 22px", background:"var(--card)", border:"1px solid var(--border)",
    borderRadius:10, color:"var(--text-muted)", fontSize:13, fontWeight:500,
    cursor:"pointer", fontFamily:"'Instrument Sans',sans-serif", transition:"all 0.2s"
  },
  mono: { fontFamily:"'DM Mono',monospace" },
  syne: { fontFamily:"'Syne',sans-serif" },
  gradText: {
    background:"linear-gradient(135deg,#a78bfa,#22d3ee)",
    WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text"
  },
};

/* ─────────────────────────────────────────
   SHARED SMALL COMPONENTS
───────────────────────────────────────── */
const Tag = ({ children, color = "purple" }) => {
  const colors = {
    purple: { background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", color:"var(--purple-bright)" },
    cyan:   { background:"rgba(34,211,238,0.1)",  border:"1px solid rgba(34,211,238,0.25)",  color:"var(--cyan)" },
    green:  { background:"rgba(52,211,153,0.1)",  border:"1px solid rgba(52,211,153,0.25)",  color:"var(--green)" },
    red:    { background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.25)", color:"var(--red)" },
    amber:  { background:"rgba(251,191,36,0.1)",  border:"1px solid rgba(251,191,36,0.25)",  color:"var(--amber)" },
  };
  return (
    <span style={{ ...colors[color], fontSize:11, padding:"3px 10px", borderRadius:20, ...t.mono }}>
      {children}
    </span>
  );
};

const SkillBar = ({ label, pct, variant = "purple" }) => {
  const fills = {
    purple: "linear-gradient(90deg,#8b5cf6,#22d3ee)",
    green:  "linear-gradient(90deg,#34d399,#22d3ee)",
    red:    "linear-gradient(90deg,#f87171,#fbbf24)",
  };
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6, color:"var(--text-muted)" }}>
        <span>{label}</span>
        <span style={{ color:"var(--text)", fontWeight:500 }}>{pct}%</span>
      </div>
      <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${pct}%`, borderRadius:10,
          background: fills[variant],
          boxShadow: variant === "purple" ? "0 0 8px rgba(139,92,246,0.5)" : variant === "green" ? "0 0 8px rgba(52,211,153,0.3)" : "0 0 8px rgba(248,113,113,0.3)",
          transition:"width 1s cubic-bezier(0.4,0,0.2,1)"
        }} />
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, change, changeDown }) => (
  <div style={{ ...t.cardSm, transition:"border-color 0.2s" }}>
    <div style={{ fontSize:11, color:"var(--text-muted)", ...t.mono, letterSpacing:"0.06em", marginBottom:8 }}>{label}</div>
    <div style={{ ...t.syne, fontSize:28, fontWeight:700, lineHeight:1, marginBottom:4, ...t.gradText }}>{value}</div>
    <div style={{ fontSize:11, color: changeDown ? "var(--red)" : "var(--green)" }}>{change}</div>
  </div>
);

const CardTitle = ({ children, badge }) => (
  <div style={{ ...t.syne, fontSize:13, fontWeight:700, letterSpacing:"-0.01em", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
    <span>{children}</span>
    {badge && (
      <span style={{ fontSize:10, ...t.mono, color:"var(--purple-bright)", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", padding:"2px 8px", borderRadius:20 }}>
        {badge}
      </span>
    )}
  </div>
);

/* ─────────────────────────────────────────
   NAV
───────────────────────────────────────── */
const TABS = [
  { id:"landing",   label:"Home" },
  { id:"dashboard", label:"Dashboard" },
  { id:"resume",    label:"Resume" },
  { id:"skills",    label:"Skills" },
  { id:"gaps",      label:"Gaps" },
  { id:"roadmap",   label:"Roadmap" },
  { id:"interview", label:"Interview" },
  { id:"feedback",  label:"Feedback" },
  { id:"mentor",    label:"AI Mentor" },
  { id:"arch",      label:"Architecture" },
];

const Nav = ({ active, onNav }) => (
  <nav style={{
    position:"fixed", top:0, left:0, right:0, zIndex:100, height:56,
    display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px",
    background:"rgba(5,5,8,0.92)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)"
  }}>
    {/* Logo */}
    <div style={{ display:"flex", alignItems:"center", gap:10, ...t.syne, fontWeight:800, fontSize:15, letterSpacing:"-0.02em" }}>
      <div style={{ width:28, height:28, background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>✦</div>
      <span>AI Career<span style={{ color:"var(--purple-bright)" }}>Twin</span></span>
    </div>

    {/* Tabs */}
    <div style={{ display:"flex", gap:2, background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:3 }}>
      {TABS.map(tab => (
        <button key={tab.id} onClick={() => onNav(tab.id)} style={{
          padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:500, cursor:"pointer",
          fontFamily:"'Instrument Sans',sans-serif", whiteSpace:"nowrap", border:"none",
          transition:"all 0.2s",
          background: active === tab.id ? "linear-gradient(135deg,rgba(139,92,246,0.3),rgba(34,211,238,0.15))" : "transparent",
          color: active === tab.id ? "var(--text)" : "var(--text-muted)",
          ...(active === tab.id ? { border:"1px solid var(--border-glow)" } : {}),
        }}>{tab.label}</button>
      ))}
    </div>

    {/* Right */}
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:20, padding:"4px 10px", fontSize:11, color:"var(--green)", ...t.mono }}>
        <div style={{ width:6, height:6, background:"var(--green)", borderRadius:"50%", animation:"pulse-green 2s infinite" }} />
        TWIN ACTIVE
      </div>
      <div style={{ width:30, height:30, background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, cursor:"pointer" }}>AK</div>
    </div>
  </nav>
);

/* ─────────────────────────────────────────
   SCREEN WRAPPER
───────────────────────────────────────── */
const Screen = ({ children, style = {} }) => (
  <div className="screen-enter" style={{
    position:"fixed", top:56, left:0, right:0, bottom:0,
    overflowY:"auto", ...style
  }}>
    {children}
  </div>
);

/* ─────────────────────────────────────────
   SCREEN 1 — LANDING
───────────────────────────────────────── */
const LandingScreen = ({ onNav }) => (
  <Screen style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100%", padding:"60px 24px", textAlign:"center", overflowY:"hidden" }}>
    {/* Grid bg */}
    <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px)", backgroundSize:"40px 40px", maskImage:"radial-gradient(ellipse at center,black 20%,transparent 80%)" }} />
    {/* Orbs */}
    <div style={{ position:"absolute", width:500, height:500, background:"radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)", top:-100, left:"50%", transform:"translateX(-50%)", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none" }} />
    <div style={{ position:"absolute", width:300, height:300, background:"radial-gradient(circle,rgba(34,211,238,0.15) 0%,transparent 70%)", bottom:50, right:"10%", borderRadius:"50%", filter:"blur(80px)", pointerEvents:"none" }} />

    <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:20, padding:"6px 16px", fontSize:11, ...t.mono, color:"var(--purple-bright)", marginBottom:32, letterSpacing:"0.05em", animation:"fadeIn 0.5s ease" }}>
        ✦ GENERATIVE AI · CAREER INTELLIGENCE PLATFORM
      </div>

      <h1 style={{ ...t.syne, fontSize:"clamp(36px,6vw,68px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-0.03em", marginBottom:20, animation:"fadeUp 0.6s ease 0.1s both" }}>
        Meet Your<br />
        <span style={t.gradText}>AI Career Twin</span>
      </h1>

      <p style={{ fontSize:16, color:"var(--text-muted)", maxWidth:520, lineHeight:1.7, marginBottom:40, animation:"fadeUp 0.6s ease 0.2s both" }}>
        A personalized GenAI mentor that mirrors your unique skills, detects gaps, builds your roadmap, and coaches you through every interview — all in real time.
      </p>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", marginBottom:56, animation:"fadeUp 0.6s ease 0.3s both" }}>
        <button style={t.btnPrimary} onClick={() => onNav("resume")}>↑ Upload Resume & Start</button>
        <button style={t.btnSecondary} onClick={() => onNav("dashboard")}>View Dashboard →</button>
      </div>

      <div style={{ display:"flex", gap:40, animation:"fadeUp 0.6s ease 0.4s both" }}>
        {[["94%","ATS Pass Rate"],["3.2×","Interview Success"],["12 wk","Avg Time to Offer"],["50K+","Careers Unlocked"]].map(([num, label]) => (
          <div key={label} style={{ textAlign:"center" }}>
            <div style={{ ...t.syne, fontSize:28, fontWeight:800, ...t.gradText }}>{num}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Features strip */}
    <div style={{ position:"absolute", bottom:0, left:0, right:0, borderTop:"1px solid var(--border)", display:"flex", background:"rgba(5,5,8,0.8)", backdropFilter:"blur(20px)" }}>
      {[["🧠","AI Skill Profiling"],["🎯","Gap Detection"],["🗺️","Adaptive Roadmaps"],["📄","ATS Optimizer"],["🎤","Mock Interviews"],["✦","Continuous Mentoring"]].map(([icon, label]) => (
        <div key={label} style={{ flex:1, padding:"16px 20px", borderRight:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, fontSize:12, color:"var(--text-muted)" }}>
          <span style={{ fontSize:16 }}>{icon}</span>{label}
        </div>
      ))}
    </div>
  </Screen>
);

/* ─────────────────────────────────────────
   SCREEN 2 — DASHBOARD
───────────────────────────────────────── */
const DashboardScreen = ({ onNav }) => (
  <Screen style={{ display:"grid", gridTemplateColumns:"220px 1fr", overflow:"hidden" }}>
    {/* Sidebar */}
    <div style={{ background:"var(--bg2)", borderRight:"1px solid var(--border)", padding:"20px 12px", overflowY:"auto", display:"flex", flexDirection:"column", gap:4 }}>
      {[
        { section:"Overview" },
        { id:"dashboard", icon:"⊞", label:"Dashboard", active:true },
        { id:"resume",    icon:"📄", label:"Resume" },
        { section:"Analysis" },
        { id:"skills",   icon:"⬡",  label:"Skill Profile" },
        { id:"gaps",     icon:"△",  label:"Gap Analysis" },
        { id:"roadmap",  icon:"◈",  label:"Roadmap" },
        { section:"Practice" },
        { id:"interview",icon:"🎤", label:"Mock Interview" },
        { id:"feedback", icon:"★",  label:"Performance" },
        { section:"Mentor" },
        { id:"mentor",   icon:"✦",  label:"AI Mentor Chat" },
      ].map((item, i) =>
        item.section ? (
          <div key={i} style={{ fontSize:10, ...t.mono, color:"var(--text-dim)", letterSpacing:"0.1em", padding:"12px 10px 6px", textTransform:"uppercase" }}>{item.section}</div>
        ) : (
          <div key={item.id} onClick={() => onNav(item.id)} style={{
            display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8,
            fontSize:13, cursor:"pointer", transition:"all 0.15s",
            background: item.active ? "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(34,211,238,0.08))" : "transparent",
            border: item.active ? "1px solid var(--border-glow)" : "1px solid transparent",
            color: item.active ? "var(--text)" : "var(--text-muted)",
          }}>
            <span style={{ fontSize:15, width:18, textAlign:"center" }}>{item.icon}</span>
            {item.label}
          </div>
        )
      )}

      {/* Score widget */}
      <div style={{ marginTop:"auto", background:"linear-gradient(135deg,rgba(139,92,246,0.1),rgba(34,211,238,0.05))", border:"1px solid var(--border-glow)", borderRadius:12, padding:16 }}>
        <div style={{ fontSize:10, color:"var(--text-muted)", ...t.mono, letterSpacing:"0.08em", marginBottom:6 }}>CAREER TWIN SCORE</div>
        <div style={{ ...t.syne, fontSize:36, fontWeight:800, lineHeight:1, ...t.gradText }}>73</div>
        <div style={{ fontSize:11, color:"var(--green)", marginTop:4 }}>↑ +8 this week</div>
        <div style={{ marginTop:10 }}>
          <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Progress to target</div>
          <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
            <div style={{ height:"100%", width:"73%", background:"linear-gradient(90deg,#8b5cf6,#22d3ee)", borderRadius:10 }} />
          </div>
        </div>
      </div>
    </div>

    {/* Main panel */}
    <div style={{ overflowY:"auto", padding:24, background:"var(--bg)" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Good morning, Arjun ✦</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>Your twin is tracking 6 skill gaps · Next interview in 2 days</div>
        </div>
        <button style={{ ...t.btnPrimary, fontSize:12, padding:"8px 16px" }} onClick={() => onNav("mentor")}>Ask AI Mentor</button>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
        <MetricCard label="MATCH SCORE"     value="78%"  change="↑ 12% from last week" />
        <MetricCard label="SKILLS VERIFIED" value="14/22" change="↑ 3 this week" />
        <MetricCard label="ATS SCORE"       value="82"   change="↑ Optimized" />
        <MetricCard label="INTERVIEWS"      value="7"    change="Avg score: 68%" changeDown />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={t.card}>
            <CardTitle badge="LIVE">Skill Strength Overview</CardTitle>
            <SkillBar label="Python / Data Science"  pct={88} variant="green" />
            <SkillBar label="Machine Learning"        pct={72} />
            <SkillBar label="System Design"           pct={41} variant="red" />
            <SkillBar label="SQL & Databases"         pct={65} />
            <SkillBar label="Communication"           pct={55} variant="red" />
          </div>
          <div style={t.card}>
            <CardTitle>Active Roadmap · Phase 2 of 4</CardTitle>
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {["var(--green)","var(--purple)","var(--border)","var(--border)"].map((c, i) => (
                <div key={i} style={{ flex:1, height:5, borderRadius:3, background:c }} />
              ))}
            </div>
            <div style={{ fontSize:13, color:"var(--text-muted)" }}>Current: <strong style={{ color:"var(--text)" }}>Machine Learning Foundations</strong> · Week 3</div>
            <div style={{ fontSize:12, color:"var(--text-muted)", marginTop:4 }}>Next: System Design Bootcamp → SQL Advanced</div>
            <button style={{ ...t.btnSecondary, marginTop:12, fontSize:12, padding:"7px 14px" }} onClick={() => onNav("roadmap")}>View Full Roadmap →</button>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ ...t.card, flex:1 }}>
            <CardTitle>Recent Activity</CardTitle>
            {[
              { color:"var(--green)",  text:<><strong>Resume optimized</strong> — ATS score improved to 82</>,  time:"2 min ago" },
              { color:"var(--purple)", text:<><strong>ML skill validated</strong> — Neural Networks module complete</>, time:"1 hr ago" },
              { color:"var(--cyan)",   text:<><strong>Mock interview</strong> — Scored 74% (Technical: 80, Communication: 65)</>, time:"Yesterday" },
              { color:"var(--amber)",  text:<><strong>Gap detected</strong> — System Design added to roadmap</>, time:"2 days ago" },
            ].map((a, i) => (
              <div key={i} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:a.color, marginTop:4, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.5 }}>{a.text}</div>
                  <div style={{ fontSize:10, color:"var(--text-dim)", marginTop:2, ...t.mono }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={t.glowCard}>
            <div style={{ fontSize:10, color:"var(--purple-bright)", ...t.mono, letterSpacing:"0.1em", marginBottom:8 }}>✦ TWIN INSIGHT</div>
            <div style={{ fontSize:13, lineHeight:1.6, color:"var(--text-muted)" }}>
              You're 3 skills away from a <strong style={{ color:"var(--text)" }}>Senior ML Engineer</strong> match at top companies. Focus on System Design this week to jump from 41% → 70%+.
            </div>
            <button style={{ ...t.btnPrimary, fontSize:11, padding:"7px 14px", marginTop:12 }} onClick={() => onNav("gaps")}>See Gaps →</button>
          </div>
        </div>
      </div>
    </div>
  </Screen>
);

/* ─────────────────────────────────────────
   SCREEN 3 — RESUME UPLOAD
───────────────────────────────────────── */
const ResumeScreen = ({ onNav }) => {
  const [processing, setProcessing] = useState(false);
  const [stepsDone, setStepsDone] = useState(2);

  const allSteps = [
    "Resume parsed successfully",
    "20 skills extracted",
    "Generating skill profile...",
    "Detecting skill gaps",
    "Building roadmap",
    "Optimizing resume for ATS",
  ];

  const startProcessing = useCallback(() => {
    setProcessing(true);
    let i = 2;
    const iv = setInterval(() => {
      setStepsDone(prev => prev + 1);
      i++;
      if (i >= allSteps.length) {
        clearInterval(iv);
        setTimeout(() => onNav("skills"), 700);
      }
    }, 700);
  }, [onNav]);

  return (
    <Screen>
      <div style={{ maxWidth:760, margin:"0 auto", padding:"36px 24px" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ ...t.syne, fontSize:28, fontWeight:800, letterSpacing:"-0.02em", marginBottom:6 }}>Resume Intelligence</div>
          <div style={{ fontSize:14, color:"var(--text-muted)", lineHeight:1.6 }}>Upload your resume and select a target role. Your AI twin will parse, analyze, and optimize it in seconds.</div>
        </div>

        {!processing ? (
          <>
            {/* Upload zone */}
            <div onClick={startProcessing} style={{ border:"2px dashed rgba(139,92,246,0.3)", borderRadius:16, padding:"60px 40px", textAlign:"center", cursor:"pointer", background:"rgba(139,92,246,0.03)", marginBottom:24, transition:"all 0.3s" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📄</div>
              <div style={{ ...t.syne, fontSize:18, fontWeight:700, marginBottom:8 }}>Drop your resume here</div>
              <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:16 }}>Supports PDF, DOCX · Max 5MB</div>
              <div style={{ display:"inline-block", background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:8, padding:"8px 20px", fontSize:13, color:"var(--purple-bright)" }}>Browse Files</div>
            </div>

            {/* Form */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              {[
                { label:"Target Role", type:"select", opts:["Senior ML Engineer","Data Scientist","Product Manager","Full Stack Developer","AI/ML Research Scientist"] },
                { label:"Target Companies", type:"input", placeholder:"e.g. Google, OpenAI, Meta", defaultValue:"Google, OpenAI, Anthropic" },
              ].map(f => (
                <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500 }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input defaultValue={f.defaultValue} placeholder={f.placeholder} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {[
                { label:"Experience Level", type:"select", opts:["Fresher (0–1 yr)","Mid-level (2–4 yr)","Senior (5+ yr)"] },
                { label:"Current Skills (optional)", type:"input", placeholder:"Python, ML, SQL...", defaultValue:"Python, TensorFlow, SQL, Git" },
              ].map(f => (
                <div key={f.label} style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <label style={{ fontSize:12, color:"var(--text-muted)", fontWeight:500 }}>{f.label}</label>
                  {f.type === "select" ? (
                    <select style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }}>
                      {f.opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input defaultValue={f.defaultValue} placeholder={f.placeholder} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", color:"var(--text)", fontSize:13, outline:"none", fontFamily:"'Instrument Sans',sans-serif" }} />
                  )}
                </div>
              ))}
            </div>

            <button style={{ ...t.btnPrimary, width:"100%", padding:14 }} onClick={startProcessing}>✦ Analyze with AI Twin</button>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:20 }}>
              {[["🔍","Deep Parse"],["⬡","Skill Extract"],["📊","ATS Score"],["✦","Twin Profile"]].map(([icon, label]) => (
                <div key={label} style={{ ...t.cardSm, textAlign:"center", padding:14 }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)" }}>{label}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 0", textAlign:"center" }}>
            {/* Spinner */}
            <div style={{ width:80, height:80, position:"relative", marginBottom:24 }}>
              {[
                { inset:0,  border:"2px solid transparent", borderTopColor:"var(--purple)", animation:"spin 1s linear infinite" },
                { inset:8,  border:"2px solid transparent", borderRightColor:"var(--cyan)",  animation:"spin 1.5s linear infinite reverse" },
                { inset:16, border:"2px solid transparent", borderBottomColor:"var(--green)", animation:"spin 2s linear infinite" },
              ].map((s, i) => (
                <div key={i} style={{ position:"absolute", borderRadius:"50%", ...s }} />
              ))}
            </div>
            <div style={{ ...t.syne, fontSize:18, fontWeight:700, marginBottom:4 }}>Generating your AI Twin</div>
            <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:24 }}>Processing resume with LLM pipeline...</div>
            <div style={{ textAlign:"left", width:"100%", maxWidth:300 }}>
              {allSteps.map((step, i) => {
                const done = i < stepsDone;
                const active = i === stepsDone;
                return (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", fontSize:13, color: done ? "var(--green)" : active ? "var(--purple-bright)" : "var(--text-muted)" }}>
                    <span style={{ fontSize:14, width:18, textAlign:"center" }}>{done ? "✓" : active ? "⟳" : "○"}</span>
                    {step}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   SCREEN 4 — SKILLS
───────────────────────────────────────── */
const SkillsScreen = () => {
  const categories = [
    { title:"TECHNICAL", score:"82%", scoreColor:"var(--green)", bars:[["Python",92,"green"],["TensorFlow/PyTorch",78,"green"],["SQL",65,"purple"],["Docker / MLOps",35,"red"]] },
    { title:"ML KNOWLEDGE", score:"71%", scoreColor:"var(--purple-bright)", bars:[["Supervised Learning",88,"green"],["Deep Learning",72,"purple"],["NLP / LLMs",55,"purple"],["Reinforcement Learning",20,"red"]] },
    { title:"SOFT SKILLS",  score:"58%", scoreColor:"var(--amber)", bars:[["Communication",55,"red"],["Problem Solving",80,"green"],["Leadership",40,"red"],["System Thinking",60,"purple"]] },
  ];

  const atsGrades = [
    { grade:"A",  label:"Keywords",  color:"var(--green)" },
    { grade:"B+", label:"Format",    color:"var(--green)" },
    { grade:"C+", label:"Impact",    color:"var(--amber)" },
    { grade:"A-", label:"Skills",    color:"var(--green)" },
    { grade:"D",  label:"Leadership",color:"var(--red)" },
  ];

  return (
    <Screen style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Skill Profile</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>AI-extracted skill map of your Career Twin</div>
        </div>
        <span style={{ fontSize:11, ...t.mono, color:"var(--purple-bright)", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", padding:"6px 14px", borderRadius:20 }}>20 SKILLS DETECTED</span>
      </div>

      {/* Twin card */}
      <div style={{ ...t.glowCard, display:"flex", alignItems:"flex-start", gap:16, marginBottom:20 }}>
        <div style={{ width:52, height:52, background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, boxShadow:"0 0 20px rgba(139,92,246,0.4)" }}>👤</div>
        <div>
          <div style={{ ...t.syne, fontWeight:700, fontSize:15, marginBottom:2 }}>Arjun Kumar · ML Engineer Profile</div>
          <div style={{ fontSize:12, ...t.mono, color:"var(--text-muted)", marginBottom:10 }}>Target: Senior ML Engineer at Google / OpenAI · <span style={{ color:"var(--green)" }}>78% match</span></div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            <Tag color="green">Strong: Python</Tag>
            <Tag color="green">Strong: TensorFlow</Tag>
            <Tag color="cyan">Good: SQL</Tag>
            <Tag color="cyan">Good: Data Analysis</Tag>
            <Tag color="red">Gap: System Design</Tag>
            <Tag color="red">Gap: MLOps</Tag>
            <Tag color="amber">Learning: LLMs</Tag>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {categories.map(cat => (
          <div key={cat.title} style={t.cardSm}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text-muted)", ...t.mono, letterSpacing:"0.06em" }}>{cat.title}</span>
              <span style={{ ...t.syne, fontSize:18, fontWeight:700, color:cat.scoreColor }}>{cat.score}</span>
            </div>
            {cat.bars.map(([label, pct, v]) => <SkillBar key={label} label={label} pct={pct} variant={v} />)}
          </div>
        ))}
      </div>

      <div style={t.card}>
        <CardTitle badge="SCORE: 82/100">Resume ATS Analysis</CardTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
          {atsGrades.map(({ grade, label, color }) => (
            <div key={label} style={{ textAlign:"center", padding:14, background:`${color}0f`, border:`1px solid ${color}33`, borderRadius:10 }}>
              <div style={{ ...t.syne, fontSize:22, fontWeight:800, color }}>{grade}</div>
              <div style={{ fontSize:10, color:"var(--text-muted)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   SCREEN 5 — GAPS
───────────────────────────────────────── */
const GapsScreen = ({ onNav }) => {
  const gaps = [
    { priority:"!",  pStyle:{ background:"rgba(248,113,113,0.2)", border:"1px solid rgba(248,113,113,0.3)", color:"var(--red)" },    name:"System Design",                 desc:"Distributed systems, scalability — critical for senior roles",          filled:2, total:5, eta:"~4 weeks" },
    { priority:"!",  pStyle:{ background:"rgba(248,113,113,0.2)", border:"1px solid rgba(248,113,113,0.3)", color:"var(--red)" },    name:"MLOps & Model Deployment",      desc:"Kubernetes, CI/CD for ML, model monitoring — required at Google-level", filled:1, total:5, eta:"~3 weeks" },
    { priority:"▲",  pStyle:{ background:"rgba(251,191,36,0.2)",  border:"1px solid rgba(251,191,36,0.3)",  color:"var(--amber)" }, name:"Large Language Models (LLMs)",  desc:"Transformers, fine-tuning, RAG, prompt engineering",                   filled:3, total:5, eta:"~2 weeks" },
    { priority:"▲",  pStyle:{ background:"rgba(251,191,36,0.2)",  border:"1px solid rgba(251,191,36,0.3)",  color:"var(--amber)" }, name:"Communication & Storytelling",  desc:"Technical communication, stakeholder management",                      filled:2, total:5, eta:"~3 weeks" },
    { priority:"◇",  pStyle:{ background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.3)", color:"var(--purple-bright)" }, name:"Reinforcement Learning",   desc:"Policy optimization, reward shaping, RL frameworks",                  filled:1, total:5, eta:"~1 week" },
    { priority:"◇",  pStyle:{ background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.3)", color:"var(--purple-bright)" }, name:"Advanced SQL & Data Eng.",  desc:"Window functions, optimization, pipeline design",                     filled:3, total:5, eta:"~1 week" },
  ];

  return (
    <Screen style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Gap Analysis</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>6 critical gaps between your profile and Senior ML Engineer target</div>
        </div>
        <div style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"var(--red)", ...t.mono }}>6 GAPS · EST. 14 WEEKS</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:20 }}>
        <div>
          {gaps.map((g, i) => (
            <div key={i} style={{ ...t.cardSm, display:"flex", alignItems:"center", gap:16, marginBottom:10, cursor:"pointer", transition:"all 0.2s" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, ...t.mono, flexShrink:0, ...g.pStyle }}>{g.priority}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>{g.name}</div>
                <div style={{ fontSize:12, color:"var(--text-muted)" }}>{g.desc}</div>
              </div>
              <div style={{ width:120, textAlign:"right" }}>
                <div style={{ display:"flex", gap:3, marginBottom:4, justifyContent:"flex-end" }}>
                  {Array.from({ length:g.total }).map((_, j) => (
                    <div key={j} style={{ width:16, height:4, borderRadius:2, background: j < g.filled ? "var(--purple)" : "rgba(255,255,255,0.06)" }} />
                  ))}
                </div>
                <div style={{ fontSize:10, color:"var(--text-muted)", ...t.mono }}>{g.eta}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={t.card}>
            <CardTitle>Gap Severity</CardTitle>
            {[["var(--red)","Critical","2 gaps"],["var(--amber)","High","2 gaps"],["var(--purple-bright)","Medium","2 gaps"]].map(([c, label, count]) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:8 }}>
                <span style={{ color:c }}>{label}</span><span>{count}</span>
              </div>
            ))}
            <div style={{ marginTop:12, background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.2)", borderRadius:8, padding:10, fontSize:12, color:"var(--text-muted)" }}>
              <div style={{ color:"var(--purple-bright)", fontSize:10, ...t.mono, marginBottom:4 }}>✦ AI RECOMMENDATION</div>
              Prioritize System Design first — it's blocking 78% of Senior ML interviews.
            </div>
          </div>
          <div style={t.card}>
            <CardTitle>Market Data</CardTitle>
            <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.7 }}>
              <div>📊 87% of ML engineers at FAANG list System Design as top-3 interview topic</div>
              <div style={{ marginTop:6 }}>📈 MLOps skills → 40% salary premium</div>
              <div style={{ marginTop:6 }}>🎯 LLM knowledge in demand at 3× growth rate</div>
            </div>
          </div>
          <button style={{ ...t.btnPrimary, padding:12 }} onClick={() => onNav("roadmap")}>Generate Personalized Roadmap →</button>
        </div>
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   SCREEN 6 — ROADMAP
───────────────────────────────────────── */
const RoadmapScreen = ({ onNav }) => {
  const phases = [
    {
      status:"done", title:"Phase 1 — Foundation Solidification", badge:"✓ DONE", badgeColor:"var(--green)",
      subtitle:"Python deep dive · Statistics · Data preprocessing", weeks:"Weeks 1–3",
      resources:[
        { type:"COURSE",  name:"Python for ML Engineers",  time:"✓ 12h · Completed", done:true },
        { type:"PRACTICE",name:"LeetCode: Arrays & Strings",time:"✓ 40 problems done", done:true },
        { type:"PROJECT", name:"EDA on Kaggle Dataset",    time:"✓ Submitted",        done:true },
      ],
    },
    {
      status:"active", title:"Phase 2 — ML Core Mastery", badge:"IN PROGRESS · Week 3/5", badgeColor:"var(--purple-bright)",
      subtitle:"Deep learning · NLP · Model evaluation · LLMs intro", weeks:"Weeks 4–8",
      resources:[
        { type:"COURSE",  name:"Deep Learning Specialization", time:"✓ 3/5 courses done",    done:true },
        { type:"COURSE",  name:"LLMs & Transformers",          time:"🔵 In progress · 4h left", active:true },
        { type:"PROJECT", name:"Build a RAG Chatbot",          time:"○ Upcoming" },
      ],
    },
    {
      status:"future", title:"Phase 3 — System Design & MLOps", badge:null,
      subtitle:"Distributed systems · Kubernetes · Model deployment pipelines", weeks:"Weeks 9–12",
      resources:[
        { type:"COURSE",  name:"System Design Interview",  time:"○ 16h · Locked" },
        { type:"COURSE",  name:"MLOps with Kubeflow",      time:"○ 8h · Locked" },
        { type:"PROJECT", name:"Deploy Model to Prod",     time:"○ Locked" },
      ],
    },
    {
      status:"future", title:"Phase 4 — Interview Mastery", badge:null,
      subtitle:"20 mock interviews · Behavioral prep · Offer negotiation", weeks:"Weeks 13–14",
      resources:[
        { type:"PRACTICE",name:"AI Mock Interviews ×10",      time:"○ Locked" },
        { type:"PRACTICE",name:"Behavioral Story Bank",        time:"○ Locked" },
        { type:"GUIDE",   name:"Offer Negotiation Playbook",   time:"○ Locked" },
      ],
    },
  ];

  const dotStyle = { done:{ background:"var(--green)" }, active:{ background:"var(--purple)", animation:"pulse-green 2s infinite" }, future:{ background:"var(--bg3)", border:"2px solid var(--border)", boxShadow:"none" } };

  return (
    <Screen style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
        <div>
          <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Your Learning Roadmap</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>AI-generated 14-week plan to Senior ML Engineer readiness</div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"var(--text-muted)" }}>📅 14 weeks</div>
          <button style={{ ...t.btnPrimary, padding:"7px 14px", fontSize:12 }} onClick={() => onNav("interview")}>Start Mock Interview</button>
        </div>
      </div>

      <div style={{ position:"relative", paddingLeft:32 }}>
        <div style={{ position:"absolute", left:10, top:0, bottom:0, width:2, background:"linear-gradient(to bottom,#8b5cf6,#22d3ee,#34d399)", borderRadius:2 }} />
        {phases.map((phase, pi) => (
          <div key={pi} style={{ position:"relative", marginBottom:24 }}>
            <div style={{ position:"absolute", left:-28, top:4, width:16, height:16, borderRadius:"50%", border:"2px solid var(--bg)", boxShadow:"0 0 12px rgba(139,92,246,0.6)", ...dotStyle[phase.status] }} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ ...t.syne, fontSize:15, fontWeight:700, color: phase.status === "future" ? "var(--text-muted)" : "var(--text)" }}>
                  {phase.title}
                  {phase.badge && <span style={{ fontSize:11, color:phase.badgeColor, ...t.mono, marginLeft:10 }}>{phase.badge}</span>}
                </div>
                <div style={{ fontSize:12, color: phase.status === "future" ? "var(--text-dim)" : "var(--text-muted)" }}>{phase.subtitle}</div>
              </div>
              <div style={{ fontSize:11, ...t.mono, color: phase.status === "future" ? "var(--text-dim)" : "var(--text-muted)", background:"var(--card)", border:"1px solid var(--border)", padding:"3px 10px", borderRadius:20 }}>{phase.weeks}</div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {phase.resources.map((r, ri) => (
                <div key={ri} style={{ background:"var(--card)", border:`1px solid ${r.done ? "rgba(52,211,153,0.3)" : r.active ? "var(--border-glow)" : "var(--border)"}`, borderRadius:10, padding:12, fontSize:12, opacity: phase.status === "future" ? 0.5 : 1 }}>
                  <div style={{ color:"var(--text-muted)", ...t.mono, fontSize:10, letterSpacing:"0.06em", marginBottom:4 }}>{r.type}</div>
                  <div style={{ fontWeight:500, color:"var(--text)", marginBottom:4 }}>{r.name}</div>
                  <div style={{ color:"var(--text-dim)", fontSize:10 }}>{r.time}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   SCREEN 7 — INTERVIEW
───────────────────────────────────────── */
const InterviewScreen = ({ onNav }) => (
  <Screen style={{ padding:24 }}>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, height:"calc(100vh - 56px - 48px)" }}>
      {/* Main */}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {/* Video area */}
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:16, flex:1, position:"relative", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", minHeight:200 }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,rgba(139,92,246,0.08) 0%,transparent 70%)" }} />
          <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, boxShadow:"0 0 40px rgba(139,92,246,0.4)", position:"relative" }}>
              🤖
              <div style={{ position:"absolute", inset:-6, borderRadius:"50%", border:"1px solid rgba(139,92,246,0.4)", animation:"ping 2s linear infinite" }} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:3, height:30 }}>
              {[0,0.15,0.3,0.15,0].map((delay, i) => (
                <div key={i} style={{ width:3, borderRadius:3, background:"var(--purple-bright)", animation:`wave 1.2s ease-in-out ${delay}s infinite` }} />
              ))}
            </div>
          </div>
          <div style={{ position:"absolute", bottom:20, left:20, right:20, background:"rgba(5,5,8,0.9)", backdropFilter:"blur(20px)", border:"1px solid var(--border-glow)", borderRadius:12, padding:16 }}>
            <div style={{ fontSize:10, ...t.mono, color:"var(--purple-bright)", letterSpacing:"0.1em", marginBottom:6 }}>✦ QUESTION 4 OF 10 · TECHNICAL</div>
            <div style={{ fontSize:14, lineHeight:1.6 }}>You're designing a real-time recommendation system for 10 million users. Walk me through your system design, including data pipeline, model serving, and how you'd handle latency at scale.</div>
          </div>
        </div>

        {/* Answer area */}
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:16 }}>
          <textarea defaultValue={"I would start by breaking this into three main components. First, the data pipeline — I'd use Kafka for real-time event streaming to capture user interactions, feeding into a feature store like Feast.\n\nFor the model layer, I'd use a two-stage approach: candidate generation using ANN for recall, followed by a ranking model for precision. This keeps p99 latency under 50ms."} style={{ width:"100%", minHeight:100, background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:13, fontFamily:"'Instrument Sans',sans-serif", lineHeight:1.7, resize:"none" }} />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:12, borderTop:"1px solid var(--border)", marginTop:12 }}>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(34,211,238,0.1))", border:"1px solid var(--border-glow)", color:"var(--purple-bright)", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>🎙</button>
              <span style={{ fontSize:11, color:"var(--text-muted)", ...t.mono }}>Recording... 1:24</span>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button style={{ ...t.btnSecondary, fontSize:12, padding:"7px 14px" }}>Skip</button>
              <button style={{ ...t.btnPrimary, fontSize:12, padding:"7px 18px" }} onClick={() => onNav("feedback")}>Submit Answer →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div style={t.card}>
          <CardTitle>Interview Progress</CardTitle>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
            {Array.from({ length:10 }).map((_, i) => {
              const state = i < 3 ? "answered" : i === 3 ? "current" : "pending";
              const styles = {
                answered: { background:"rgba(52,211,153,0.2)", border:"1px solid rgba(52,211,153,0.4)", color:"var(--green)" },
                current:  { background:"rgba(139,92,246,0.3)", border:"1px solid var(--border-glow)", color:"var(--purple-bright)" },
                pending:  { background:"var(--card)", border:"1px solid var(--border)", color:"var(--text-dim)" },
              };
              return <div key={i} style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, ...t.mono, fontWeight:500, ...styles[state] }}>{i+1}</div>;
            })}
          </div>
          <div style={{ marginTop:12, fontSize:11, color:"var(--text-muted)" }}>4 of 10 · 3 Technical · 1 Behavioral</div>
        </div>

        <div style={t.card}>
          <CardTitle badge="REAL-TIME">Live Scores</CardTitle>
          {[["Technical Depth","82","var(--green)"],["Communication","61","var(--amber)"],["Structure","75","var(--purple-bright)"],["Confidence","68","var(--cyan)"]].map(([label, val, color]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid var(--border)", fontSize:12 }}>
              <span style={{ color:"var(--text-muted)" }}>{label}</span>
              <span style={{ ...t.syne, fontWeight:700, fontSize:14, color }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ background:"linear-gradient(135deg,rgba(34,211,238,0.06),rgba(52,211,153,0.04))", border:"1px solid rgba(34,211,238,0.2)", borderRadius:14, padding:14, fontSize:12, color:"var(--text-muted)", lineHeight:1.6, flex:1 }}>
          <div style={{ color:"var(--cyan)", fontWeight:600, marginBottom:8, fontSize:11, ...t.mono, letterSpacing:"0.08em" }}>✦ AI TIP (LIVE)</div>
          Great start! Remember to mention <strong style={{ color:"var(--text)" }}>failure modes</strong> — what happens when the recommendation service is down?
          <div style={{ marginTop:10, color:"var(--cyan)", fontSize:11 }}>💡 Mention: cache fallback · default popular items · circuit breaker pattern</div>
        </div>
      </div>
    </div>
  </Screen>
);

/* ─────────────────────────────────────────
   SCREEN 8 — FEEDBACK
───────────────────────────────────────── */
const FeedbackScreen = ({ onNav }) => (
  <Screen style={{ padding:24 }}>
    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
      <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>Interview Performance Report</div>
      <div style={{ display:"flex", gap:8 }}>
        <button style={{ ...t.btnSecondary, fontSize:12, padding:"7px 14px" }}>Download PDF</button>
        <button style={{ ...t.btnPrimary, fontSize:12, padding:"7px 14px" }} onClick={() => onNav("interview")}>Retake Interview</button>
      </div>
    </div>

    {/* Score hero */}
    <div style={{ textAlign:"center", padding:"40px 20px", background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,211,238,0.04))", border:"1px solid var(--border-glow)", borderRadius:16, marginBottom:24, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:300, height:300, background:"radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }} />
      <div style={{ ...t.syne, fontSize:72, fontWeight:800, ...t.gradText, lineHeight:1, marginBottom:8 }}>74</div>
      <div style={{ fontSize:18, fontWeight:600, color:"var(--green)", marginBottom:4 }}>B+ · Strong Candidate</div>
      <div style={{ fontSize:13, color:"var(--text-muted)" }}>Above average for Senior ML Engineer role at Google</div>
      <div style={{ display:"flex", gap:20, justifyContent:"center", marginTop:20 }}>
        {[["82","Technical","var(--green)"],["61","Communication","var(--amber)"],["75","Structure","var(--purple-bright)"],["78","Problem Solving","var(--cyan)"]].map(([num, label, color]) => (
          <div key={label}>
            <div style={{ ...t.syne, fontSize:22, fontWeight:700, color }}>{num}</div>
            <div style={{ fontSize:11, color:"var(--text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
      <div style={t.card}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.06em", color:"var(--green)", textTransform:"uppercase", marginBottom:10 }}>✓ What You Did Well</div>
        {["Excellent system design — Kafka → Feature Store → Two-stage model pipeline was impressive","Mentioned latency target (p99 < 50ms) — shows production awareness","Strong knowledge of candidate generation with ANN","Clear tradeoff reasoning between LightGBM vs neural net"].map((text, i, arr) => (
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom: i < arr.length-1 ? "1px solid var(--border)" : "none", fontSize:12, lineHeight:1.5, color:"var(--text-muted)" }}>
            <span style={{ fontSize:14, flexShrink:0 }}>✅</span>{text}
          </div>
        ))}
      </div>
      <div style={t.card}>
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.06em", color:"var(--red)", textTransform:"uppercase", marginBottom:10 }}>△ Areas to Improve</div>
        {["Didn't address failure modes — what's the fallback when the model is unavailable?","Communication pacing too fast — slow down and check if interviewer is following","Missed cold-start problem for new users — critical for recommendation systems","Could quantify business impact — 'This would improve CTR by X%'"].map((text, i, arr) => (
          <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom: i < arr.length-1 ? "1px solid var(--border)" : "none", fontSize:12, lineHeight:1.5, color:"var(--text-muted)" }}>
            <span style={{ fontSize:14, flexShrink:0 }}>⚠️</span>{text}
          </div>
        ))}
      </div>
    </div>

    <div style={{ ...t.card, marginBottom:16 }}>
      <CardTitle>AI Twin's Personalized Action Plan</CardTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[["THIS WEEK","var(--purple-bright)","rgba(139,92,246,0.06)","rgba(139,92,246,0.2)","Practice 5 system design problems with fallback scenarios. Focus: distributed caching patterns."],["NEXT WEEK","var(--cyan)","rgba(34,211,238,0.06)","rgba(34,211,238,0.2)","Re-do 3 behavioral questions with STAR framework. Record yourself and review communication pace."],["ONGOING","var(--green)","rgba(52,211,153,0.06)","rgba(52,211,153,0.2)","2 mock interviews per week. Your twin will auto-generate harder questions as you improve."]].map(([label, c, bg, border, text]) => (
          <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:14 }}>
            <div style={{ fontSize:11, color:c, ...t.mono, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:12, color:"var(--text-muted)", lineHeight:1.6 }}>{text}</div>
          </div>
        ))}
      </div>
    </div>

    <div style={{ ...t.glowCard, display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ fontSize:28 }}>✦</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600, marginBottom:2 }}>Twin Prediction</div>
        <div style={{ fontSize:12, color:"var(--text-muted)" }}>At your current improvement rate (+8 pts/week), you'll be interview-ready for Google in <strong style={{ color:"var(--green)" }}>3 more weeks</strong>. Focus on System Design to push score above 85.</div>
      </div>
      <button style={{ ...t.btnPrimary, flexShrink:0, fontSize:12, padding:"8px 16px" }} onClick={() => onNav("mentor")}>Ask Twin →</button>
    </div>
  </Screen>
);

/* ─────────────────────────────────────────
   SCREEN 9 — AI MENTOR (CHAT)
───────────────────────────────────────── */
const QUICK_PROMPTS = [
  "Generate a system design question for me",
  "Review my resume bullet points",
  "Predict my interview score this week",
  "What should I study today?",
];

const AI_RESPONSES = {
  "Generate a system design question for me": "Here's a targeted question based on your gaps:<br><br><strong>Design a real-time ML feature pipeline</strong> for a fraud detection system processing 1M transactions/second. Address: data ingestion, feature freshness, model latency, and fallback when the ML service is down.",
  "What should I study today?": "Based on your progress and interview date in 2 days:<br><br><strong>Today's Plan (4 hours):</strong><br>• 2h: System Design — Distributed Caching (Redis patterns)<br>• 1h: LeetCode Graph problems (×3)<br>• 1h: Mock interview on MLOps with me",
  "Predict my interview score this week": "Based on your trajectory:<br><br><strong>Predicted Score: 79–83</strong> (up from 74)<br><br>If you practice system design fallbacks today, I estimate you'll cross 80. Your communication score is the key variable — it could swing ±8 points.",
  "Review my resume bullet points": "I've analyzed your resume bullets. Top 3 improvements:<br><br>1. <strong>Quantify impact</strong> — 'Improved model accuracy' → 'Improved model accuracy by 12% (F1 0.82→0.92)'<br>2. <strong>Add scale</strong> — mention dataset sizes, user counts<br>3. <strong>ATS keywords</strong> — add: MLOps, Kubernetes, Distributed Systems",
};

const MentorScreen = () => {
  const [messages, setMessages] = useState([
    { role:"ai", text:"Hey Arjun! I've been tracking your progress. You scored 74% in your last mock interview — great work, but I noticed you struggled with failure modes in system design.<br><br>Based on your profile, I recommend spending 2 hours today on <strong>cache fallback patterns</strong>. Want me to generate a targeted practice problem?" },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, thinking]);

  const sendMsg = useCallback((text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(prev => [...prev, { role:"user", text:msg }]);
    setThinking(true);
    setTimeout(() => {
      const resp = AI_RESPONSES[msg] || `Great question! Based on your profile and current progress toward <strong>Senior ML Engineer</strong>, you're making strong progress. Your technical foundation is solid (82%), but communication (61%) is holding you back. Want a specific action plan?`;
      setThinking(false);
      setMessages(prev => [...prev, { role:"ai", text:resp }]);
    }, 1400);
  }, [input]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  return (
    <Screen style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, background:"var(--bg2)", flexShrink:0 }}>
        <div style={{ width:36, height:36, background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, boxShadow:"0 0 16px rgba(139,92,246,0.4)", position:"relative" }}>
          ✦
          <div style={{ position:"absolute", bottom:0, right:0, width:10, height:10, background:"var(--green)", borderRadius:"50%", border:"2px solid var(--bg2)" }} />
        </div>
        <div>
          <div style={{ fontWeight:600, fontSize:14 }}>Your AI Career Twin</div>
          <div style={{ fontSize:11, color:"var(--text-muted)", ...t.mono }}>PERSONALIZED · CONTEXT-AWARE · ALWAYS ON</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
          <Tag color="cyan">Senior ML Engineer</Tag>
          <Tag color="green">Memory: 12 sessions</Tag>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "slide-right" : "slide-left"} style={{ display:"flex", gap:10, maxWidth:"75%", alignSelf: m.role === "user" ? "flex-end" : "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background: m.role === "ai" ? "linear-gradient(135deg,#8b5cf6,#22d3ee)" : "rgba(255,255,255,0.1)", border: m.role === "user" ? "1px solid var(--border)" : "none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0, marginTop:2 }}>
              {m.role === "ai" ? "✦" : "AK"}
            </div>
            <div>
              {m.role === "ai" && <div style={{ fontSize:10, color:"var(--purple-bright)", ...t.mono, marginBottom:6 }}>✦ AI TWIN</div>}
              <div style={{ background: m.role === "user" ? "rgba(139,92,246,0.1)" : "var(--card)", border: `1px solid ${m.role === "user" ? "rgba(139,92,246,0.25)" : "var(--border)"}`, borderRadius:12, padding:"12px 14px", fontSize:13, lineHeight:1.6, color: m.role === "user" ? "var(--text)" : "var(--text-muted)" }} dangerouslySetInnerHTML={{ __html:m.text }} />
              <div style={{ fontSize:10, color:"var(--text-dim)", marginTop:4, ...t.mono }}>Just now</div>
            </div>
          </div>
        ))}
        {thinking && (
          <div className="slide-left" style={{ display:"flex", gap:10, maxWidth:"75%" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#8b5cf6,#22d3ee)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0, marginTop:2 }}>✦</div>
            <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 14px", display:"flex", gap:4, alignItems:"center" }}>
              {[0,0.2,0.4].map((d, i) => <div key={i} style={{ width:6, height:6, background:"var(--purple-bright)", borderRadius:"50%", animation:`bounce 1.2s ${d}s infinite` }} />)}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"16px 24px", borderTop:"1px solid var(--border)", background:"var(--bg2)", flexShrink:0 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => sendMsg(p)} style={{ fontSize:11, padding:"5px 12px", background:"var(--card)", border:"1px solid var(--border)", borderRadius:20, color:"var(--text-muted)", cursor:"pointer", transition:"all 0.2s", fontFamily:"'Instrument Sans',sans-serif" }}>{p}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Ask your AI twin anything about your career..." rows={1} style={{ flex:1, background:"var(--card)", border:"1px solid var(--border)", borderRadius:12, padding:"12px 14px", color:"var(--text)", fontSize:13, fontFamily:"'Instrument Sans',sans-serif", outline:"none", resize:"none", minHeight:44, maxHeight:120, lineHeight:1.5, transition:"border-color 0.2s" }} />
          <button onClick={() => sendMsg()} style={{ width:40, height:40, background:"linear-gradient(135deg,#8b5cf6,#6366f1)", border:"none", borderRadius:10, color:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 0 20px rgba(139,92,246,0.3)", transition:"all 0.2s" }}>↑</button>
        </div>
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   SCREEN 10 — ARCHITECTURE
───────────────────────────────────────── */
const ArchScreen = () => {
  const layers = [
    { label:"FRONTEND LAYER", nodes:[
      { text:"⚛ React 18 + Vite" }, { text:"📱 Responsive Web App" }, { text:"🎨 Tailwind CSS" },
      { text:"🎙 Web Speech API", cyan:true }, { text:"📊 D3.js Visualizations", cyan:true },
    ]},
    { label:"BACKEND LAYER", nodes:[
      { text:"🟢 Node.js + Express" }, { text:"🐍 Flask (AI microservice)" }, { text:"🔐 Firebase Auth" },
      { text:"📄 PDF/DOCX Parser", cyan:true }, { text:"⚡ WebSockets (real-time)", amber:true },
    ]},
    { label:"AI LAYER — GENAI CORE", nodes:[
      { text:"✦ LLM API (Claude / GPT-4)" }, { text:"🧠 Prompt Engine" }, { text:"⬡ Skill Analyzer" },
      { text:"🎯 Gap Detection", cyan:true }, { text:"🗺️ Roadmap Generator", cyan:true },
      { text:"🎤 Interview Engine" }, { text:"📊 Answer Evaluator" },
      { text:"🔄 Adaptive Feedback", green:true }, { text:"🔢 Embeddings (Vector)", amber:true },
    ]},
    { label:"DATA LAYER", nodes:[
      { text:"🔥 Firebase Firestore", green:true }, { text:"👤 User Profile Store" }, { text:"💾 Context Memory" },
      { text:"📈 Progress Tracking", cyan:true }, { text:"🧠 Vector DB (Pinecone)", amber:true },
    ]},
  ];

  const pipeline = ["Resume Upload","LLM Parse","Skill Extract","Gap Detect","Roadmap Gen","ATS Optimize","Interview Gen","Evaluate","Score + Feedback","Adaptive Mentor"];

  const winFeats = [
    { bg:"rgba(52,211,153,0.06)", border:"rgba(52,211,153,0.2)", title:"Digital Twin Metaphor", text:"The 'mirror of yourself' narrative is emotionally compelling and technically novel for judges." },
    { bg:"rgba(139,92,246,0.06)", border:"rgba(139,92,246,0.2)", title:"Live AI Feedback",       text:"Real-time scoring during interviews with contextual tips — genuinely delightful demo moment." },
    { bg:"rgba(34,211,238,0.06)", border:"rgba(34,211,238,0.2)", title:"End-to-End Pipeline",    text:"Resume → Roadmap → Interview → Feedback is a complete product, not a prototype." },
    { bg:"rgba(251,191,36,0.06)", border:"rgba(251,191,36,0.2)", title:"Persistent Memory",      text:"AI actually remembers you across sessions — not a stateless chatbot." },
    { bg:"rgba(248,113,113,0.06)",border:"rgba(248,113,113,0.2)",title:"Market Intelligence",    text:"Gaps tied to real hiring data — '87% of Google ML interviews include system design.'" },
    { bg:"rgba(139,92,246,0.06)", border:"rgba(139,92,246,0.2)", title:"Billion-Dollar Market",  text:"$366B ed-tech + $240B recruiting market. Clear monetization path. Investors love it." },
  ];

  const nodeStyle = (n) => ({
    background: n.cyan ? "rgba(34,211,238,0.06)" : n.green ? "rgba(52,211,153,0.06)" : n.amber ? "rgba(251,191,36,0.06)" : "rgba(139,92,246,0.08)",
    border: `1px solid ${n.cyan ? "rgba(34,211,238,0.3)" : n.green ? "rgba(52,211,153,0.3)" : n.amber ? "rgba(251,191,36,0.3)" : "rgba(139,92,246,0.2)"}`,
    borderRadius:8, padding:"10px 14px", fontSize:12, display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
  });

  return (
    <Screen style={{ padding:24, overflowY:"auto" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ ...t.syne, fontSize:22, fontWeight:700, letterSpacing:"-0.02em" }}>System Architecture</div>
          <div style={{ fontSize:13, color:"var(--text-muted)", marginTop:2 }}>GenAI pipeline powering AI Career Twin</div>
        </div>

        {/* Pipeline */}
        <div style={{ ...t.card, marginBottom:20 }}>
          <div style={{ fontSize:10, ...t.mono, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12 }}>GENAI PIPELINE FLOW</div>
          <div style={{ display:"flex", alignItems:"center", overflowX:"auto", paddingBottom:4 }}>
            {pipeline.map((step, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", fontSize:11, textAlign:"center", minWidth:90 }}>
                  <div style={{ ...t.mono, fontSize:10, color:"var(--purple-bright)", marginBottom:4 }}>0{i+1}</div>
                  {step}
                </div>
                {i < pipeline.length-1 && <div style={{ color:"var(--text-dim)", fontSize:14, padding:"0 6px", flexShrink:0 }}>→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Layers */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
          {layers.map((layer, li) => (
            <div key={li}>
              <div style={{ ...t.cardSm }}>
                <div style={{ fontSize:10, ...t.mono, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
                  {layer.label}
                  <div style={{ flex:1, height:1, background:"var(--border)" }} />
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                  {layer.nodes.map((n, ni) => <div key={ni} style={nodeStyle(n)}>{n.text}</div>)}
                </div>
              </div>
              {li < layers.length-1 && <div style={{ textAlign:"center", color:"var(--text-dim)", fontSize:18, padding:"4px 0" }}>↕</div>}
            </div>
          ))}
        </div>

        {/* GenAI Internals */}
        <div style={{ ...t.glowCard, marginBottom:14 }}>
          <CardTitle>How GenAI Works Internally</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, fontSize:12, lineHeight:1.8, color:"var(--text-muted)" }}>
            {[
              ["PROMPT ENGINEERING","var(--purple-bright)","Chain-of-thought prompts extract skills from resumes as structured JSON. Role-specific system prompts compare extracted skills against real job descriptions. Few-shot examples calibrate gap severity scoring."],
              ["ADAPTIVE MEMORY","var(--cyan)","Firebase stores full session context — every interview answer, feedback, skill progression. Each LLM call receives a compressed context window of the student's full history, enabling the twin to truly 'know' the student."],
              ["INTERVIEW ENGINE","var(--green)","Questions generated dynamically using role + company + candidate skill profile as context. LLM evaluates answers on 4 rubrics (technical accuracy, communication, structure, insight) using scoring rubrics inspired by actual Google/Meta interview guidelines."],
              ["VECTOR SEARCH","var(--amber)","Skills, job descriptions, and learning resources are embedded into a vector space. Gap detection uses cosine similarity to find the most semantically relevant missing skills for each target role."],
            ].map(([title, color, text]) => (
              <div key={title}>
                <div style={{ color, ...t.mono, fontSize:10, letterSpacing:"0.08em", marginBottom:8 }}>{title}</div>
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Winning features */}
        <div style={t.card}>
          <CardTitle>🏆 Hackathon Winning Features</CardTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
            {winFeats.map(f => (
              <div key={f.title} style={{ background:f.bg, border:`1px solid ${f.border}`, borderRadius:10, padding:12, fontSize:12, color:"var(--text-muted)" }}>
                <strong style={{ color:"var(--text)", display:"block", marginBottom:4 }}>{f.title}</strong>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
};

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  const [screen, setScreen] = useState("landing");

  useEffect(() => { injectGlobalStyles(); }, []);

  const screens = {
    landing:   <LandingScreen   onNav={setScreen} />,
    dashboard: <DashboardScreen onNav={setScreen} />,
    resume:    <ResumeScreen    onNav={setScreen} />,
    skills:    <SkillsScreen />,
    gaps:      <GapsScreen      onNav={setScreen} />,
    roadmap:   <RoadmapScreen   onNav={setScreen} />,
    interview: <InterviewScreen onNav={setScreen} />,
    feedback:  <FeedbackScreen  onNav={setScreen} />,
    mentor:    <MentorScreen />,
    arch:      <ArchScreen />,
  };

  return (
    <div style={{ height:"100vh", width:"100vw", overflow:"hidden", background:"var(--bg)" }}>
      <Nav active={screen} onNav={setScreen} />
      {screens[screen]}
    </div>
  );
}
