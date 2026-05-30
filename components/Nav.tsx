import Link from 'next/link';

export default function Nav({ backLabel, backHref }: { backLabel?: string; backHref?: string }) {
  return (
    <nav style={{
      borderBottom: '1px solid var(--dark-3)',
      background: 'var(--dark)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {backLabel && backHref ? (
            <Link href={backHref} style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600,
              fontSize: '0.8rem',
              color: 'var(--grey)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}>
              ← {backLabel}
            </Link>
          ) : (
            <Link href="/blog" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 7, height: 7, background: 'var(--red)', borderRadius: '50%' }} />
              <span style={{
                fontFamily: 'Bebas Neue, sans-serif',
                fontSize: '1.1rem',
                letterSpacing: '0.06em',
                color: 'var(--white)',
              }}>
                HobbyCity
              </span>
              <span style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--grey)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Blog
              </span>
            </Link>
          )}
        </div>

        {/* Shop link */}
        <a
          href="https://www.hobbycity.nz"
          style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--grey)',
            textDecoration: 'none',
            padding: '0.375rem 0.875rem',
            border: '1px solid var(--dark-3)',
            borderRadius: 4,
            transition: 'all 0.15s',
          }}
        >
          Visit Shop →
        </a>
      </div>
    </nav>
  );
}
