export function Sidebar({ caseStudy, visitedConcepts }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-title">{caseStudy.title}</div>
        <div className="sidebar-tutor">{caseStudy.tutorName} · {caseStudy.tutorRole}</div>
      </div>

      <p className="sidebar-note">
        This is a conversation, not a lecture. Ask follow-up questions. Push back. Say "I don't get it" — that's the point.
      </p>

      <div>
        <div className="sidebar-section-label">Primary Sources</div>
        <ul className="primary-sources-list">
          {caseStudy.primarySources.map((s, i) => (
            <li key={i} className="primary-source-item">
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              <div className="primary-source-desc">{s.description}</div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="sidebar-section-label">Concepts</div>
        <ul className="concept-list">
          {caseStudy.concepts.map((c) => (
            <li key={c.id} className={`concept-item ${visitedConcepts.has(c.id) ? 'visited' : ''}`}>
              <span className="concept-dot" />
              {c.label}
            </li>
          ))}
        </ul>
      </div>

    </aside>
  );
}
