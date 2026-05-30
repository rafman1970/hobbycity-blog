export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--dark-3)',
      background: 'var(--dark)',
      padding: '1.75rem 1.5rem',
      marginTop: '5rem',
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontSize: '0.8rem',
          color: 'var(--grey)',
          letterSpacing: '0.03em',
        }}>
          © {new Date().getFullYear()} Hobby City 2018 Ltd ·{' '}
          <a href="https://www.hobbycity.nz" style={{ color: 'var(--grey)', textDecoration: 'none' }}>
            hobbycity.nz
          </a>
          {' '}· 62 Lunn Avenue, Mount Wellington, Auckland
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ width: 6, height: 6, background: 'var(--red)', borderRadius: '50%' }} />
          <div style={{ width: 6, height: 6, background: 'var(--dark-3)', borderRadius: '50%' }} />
          <div style={{ width: 6, height: 6, background: 'var(--dark-3)', borderRadius: '50%' }} />
        </div>
      </div>
    </footer>
  );
}
