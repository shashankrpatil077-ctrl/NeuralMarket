const links = [
  { label: 'Welcome', href: '#welcome' },
  { label: 'Submit', href: '#submit' },
  { label: 'Auction', href: '#auction' },
  { label: 'Workspace', href: '#workspace' },
  { label: 'Verdict', href: '#verdict' },
  { label: 'Settlement', href: '#settlement' },
  { label: 'History', href: '#history' },
];

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100]"
      style={{
        background: 'rgba(18,18,18,0.80)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div
        className="flex items-center justify-between px-6 md:px-[80px]"
        style={{ maxWidth: 1400, margin: '0 auto', height: 64 }}
      >
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#E8E8E8' }}>
          NeuralMarket
        </span>
        <div className="hidden md:flex items-center" style={{ gap: 32 }}>
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: '#8A8A8A',
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#E8E8E8')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8A8A8A')}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
