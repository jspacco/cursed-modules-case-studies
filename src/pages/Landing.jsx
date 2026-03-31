import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/LoginButton';
import { caseStudies } from '../data/caseStudies';
import '../styles/landing.css';

export function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentMeta, setStudentMeta] = useState({});
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setMetaLoading(true);
    const ref = collection(db, 'students', user.email, 'casestudies');
    getDocs(ref)
      .then((snap) => {
        const map = {};
        snap.forEach((docSnap) => {
          map[docSnap.id] = docSnap.data().metadata;
        });
        setStudentMeta(map);
      })
      .catch((err) => {
        console.error('Error loading metadata:', err);
        setMetaError('Could not load your progress. Check your connection.');
      })
      .finally(() => setMetaLoading(false));
  }, [user?.email]);

  return (
    <div className="landing">
      {!user ? (
        <div className="landing-unauthenticated">
          <h2>Welcome to Cursed Modules</h2>
          <p>Sign in with your Knox Google account to begin.</p>
          <LoginButton />
        </div>
      ) : (
        <>
          <div className="landing-greeting">
            <h2>Hello, <strong>{user.displayName?.split(' ')[0] || user.email}</strong></h2>
          </div>
          {metaError && <div className="error-banner">{metaError}</div>}
          <div className="case-study-grid">
            {caseStudies.map((cs) => {
              const meta = studentMeta[cs.id];
              const hasStarted = Boolean(meta);
              const isCompleted = meta?.completed === true;
              return (
                <div
                  key={cs.id}
                  className={`case-study-card ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="card-title-row">
                    <div className="card-title">{cs.title}</div>
                    {isCompleted && <span className="completed-badge">✓ Completed</span>}
                  </div>
                  <div className="card-subtitle">{cs.subtitle}</div>
                  <div className="card-meta">
                    <span className="card-badge">{cs.prereqs}</span>
                    <span className="card-badge">{cs.estimatedMinutes} min</span>
                  </div>
                  <div className="card-tutor">{cs.tutorName} · {cs.tutorRole}</div>
                  <div className="card-action">
                    <button
                      className={hasStarted ? 'btn-resume' : 'btn-begin'}
                      onClick={() => navigate(`/case/${cs.id}`)}
                    >
                      {hasStarted ? 'Resume' : 'Begin'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
