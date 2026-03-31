import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Header({ caseStudyTitle }) {
  const { user, signOut } = useAuth();

  return (
    <header style={{
      background: 'var(--accent)',
      color: 'white',
      padding: '0 1.5rem',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        <Link to="/" style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '1.6rem',
          letterSpacing: '0.06em',
          color: 'white',
          textDecoration: 'none'
        }}>
          Cursed Modules
        </Link>
        {caseStudyTitle && (
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.65)',
            borderLeft: '1px solid rgba(255,255,255,0.3)',
            paddingLeft: '1rem'
          }}>
            {caseStudyTitle}
          </span>
        )}
      </div>
      {user && (
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span>{user.displayName || user.email}</span>
          <button
            onClick={signOut}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'rgba(255,255,255,0.8)',
              padding: '0.25rem 0.6rem',
              borderRadius: '3px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'border-color 0.1s ease'
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
