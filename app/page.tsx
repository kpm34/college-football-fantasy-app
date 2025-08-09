'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 960, width: '100%', padding: '24px' }}>
        <h1 style={{ fontSize: 'clamp(32px,6vw,56px)', marginBottom: 12 }}>College Football Fantasy</h1>
        <p style={{ opacity: 0.85, marginBottom: 24 }}>Power 4 conferences only • AP Top‑25 eligibility • 12‑week season</p>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <Link href="/league/create" className="btn btn-primary" style={btnPrimary}>Create League</Link>
          <Link href="/league/join" className="btn" style={btn}>Join League</Link>
          <Link href="/leagues/search" className="btn" style={btn}>Find Leagues</Link>
          <Link href="/draft/test" className="btn" style={btn}>Try Mock Draft</Link>
        </div>
        <div style={{ marginTop: 28, opacity: 0.7, fontSize: 14 }}>If the old frontend is needed, visit <a href="/frontend" style={{ color: '#67e8f9' }}>backup UI</a>.</div>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  display: 'inline-block',
  padding: '12px 16px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  textAlign: 'center',
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: '#9C0B0B',
  borderColor: 'rgba(255,255,255,0.2)',
};

