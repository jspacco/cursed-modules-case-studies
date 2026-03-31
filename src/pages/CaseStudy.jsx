import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranscript } from '../hooks/useTranscript';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { ChatWindow } from '../components/ChatWindow';
import { ChatInput } from '../components/ChatInput';
import { caseStudies, conceptKeywords } from '../data/caseStudies';
import '../styles/casestudy.css';

export function CaseStudy() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const caseStudy = caseStudies.find((cs) => cs.id === id);

  const { messages, metadata, loading, error, sendMessage } = useTranscript(user, caseStudy);
  const [thinking, setThinking] = useState(false);
  const [sendError, setSendError] = useState(null);

  // Redirect if not signed in
  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  // Redirect if case study not found
  if (!caseStudy) {
    return (
      <div style={{ padding: '2rem', fontFamily: "'IBM Plex Mono', monospace" }}>
        Case study not found. <a href="/">Go back</a>
      </div>
    );
  }

  // Compute visited concepts from assistant messages
  const visitedConcepts = useMemo(() => {
    const visited = new Set();
    const assistantText = messages
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content.toLowerCase())
      .join(' ');
    for (const [conceptId, keywords] of Object.entries(conceptKeywords)) {
      if (keywords.some((kw) => assistantText.includes(kw.toLowerCase()))) {
        visited.add(conceptId);
      }
    }
    return visited;
  }, [messages]);

  const hasMessages = messages.length > 0;
  const isResuming = hasMessages && !loading;

  const handleStart = async () => {
    setSendError(null);
    setThinking(true);
    try {
      await sendMessage("I'm ready to start the case study.", caseStudy.systemPrompt);
    } catch (err) {
      console.error('Start error:', err);
      setSendError('Failed to start the conversation. Please try again.');
    } finally {
      setThinking(false);
    }
  };

  const handleSend = async (userContent) => {
    setSendError(null);
    setThinking(true);
    try {
      await sendMessage(userContent, caseStudy.systemPrompt);
    } catch (err) {
      console.error('Send error:', err);
      setSendError('Failed to send message. Please try again.');
    } finally {
      setThinking(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: "'IBM Plex Mono', monospace",
        color: 'var(--text-dimmer)',
        fontSize: '0.85rem'
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="app" style={{ height: '100vh', overflow: 'hidden' }}>
      <Header caseStudyTitle={caseStudy.title} />
      <div className="casestudy-layout">
        <Sidebar caseStudy={caseStudy} visitedConcepts={visitedConcepts} />
        <div className="chat-area">
          {(error || sendError) && (
            <div className="error-banner">{error || sendError}</div>
          )}
          {!hasMessages ? (
            <div className="welcome-screen">
              <div className="welcome-title">{caseStudy.title}</div>
              <div className="welcome-subtitle">{caseStudy.subtitle}</div>
              <div className="welcome-tutor">
                Your tutor: <strong>{caseStudy.tutorName}</strong> · {caseStudy.tutorRole}
              </div>
              <button
                className="btn-start"
                onClick={handleStart}
                disabled={thinking}
              >
                {thinking ? 'Starting…' : 'Start the Case Study'}
              </button>
            </div>
          ) : (
            <>
              {isResuming && metadata && (
                <div className="welcome-back-banner">
                  Welcome back — continuing your conversation with {caseStudy.tutorName}
                </div>
              )}
              <ChatWindow
                messages={messages}
                thinking={thinking}
                tutorName={caseStudy.tutorName}
                closingDeliverable={caseStudy.closingDeliverable}
              />
              <ChatInput
                onSend={handleSend}
                disabled={thinking}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
