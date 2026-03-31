import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export function useTranscript(user, caseStudy) {
  const [messages, setMessages] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const docRef = user && caseStudy
    ? doc(db, 'students', user.email, 'casestudies', caseStudy.id)
    : null;

  useEffect(() => {
    if (!user || !caseStudy) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(docRef)
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setMessages(data.messages || []);
          setMetadata(data.metadata || null);
        }
      })
      .catch((err) => {
        console.error('Firestore load error:', err);
        setError('Failed to load conversation. Check your connection.');
      })
      .finally(() => setLoading(false));
  }, [user?.email, caseStudy?.id]);

  const saveToFirestore = useCallback(async (newMessages, extra = {}) => {
    if (!docRef) return;
    setSaving(true);
    try {
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          metadata: {
            studentName: user.displayName,
            studentEmail: user.email,
            caseStudyId: caseStudy.id,
            caseStudyTitle: caseStudy.title,
            startedAt: serverTimestamp(),
            lastActiveAt: serverTimestamp(),
            completed: false,
            ...extra
          },
          messages: newMessages
        });
      } else {
        await updateDoc(docRef, {
          messages: newMessages,
          'metadata.lastActiveAt': serverTimestamp(),
          ...extra
        });
      }
    } catch (err) {
      console.error('Firestore save error:', err);
      setError('Failed to save conversation.');
    } finally {
      setSaving(false);
    }
  }, [docRef, user, caseStudy]);

  const addMessage = useCallback(async (role, content) => {
    const message = { role, content, timestamp: new Date().toISOString() };
    const newMessages = [...messages, message];
    setMessages(newMessages);
    await saveToFirestore(newMessages);
    return newMessages;
  }, [messages, saveToFirestore]);

  const sendMessage = useCallback(async (userContent, systemPrompt) => {
    // Add user message
    const userMsg = { role: 'user', content: userContent, timestamp: new Date().toISOString() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    await saveToFirestore(withUser);

    // Call API
    const apiMessages = withUser.map(({ role, content }) => ({ role, content }));
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, systemPrompt })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    if (data.error) {
      throw new Error(data.error.message || 'API returned an error');
    }

    const assistantContent = data.content?.[0]?.text ?? '';
    const assistantMsg = { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() };
    const withAssistant = [...withUser, assistantMsg];
    setMessages(withAssistant);

    // Check if deliverable was surfaced
    const deliverableFirstSentence = caseStudy.closingDeliverable.split('\n')[0];
    const isCompleted = assistantContent.includes(deliverableFirstSentence);
    await saveToFirestore(withAssistant, isCompleted ? { 'metadata.completed': true } : {});

    return withAssistant;
  }, [messages, saveToFirestore, caseStudy]);

  const markComplete = useCallback(async () => {
    if (!docRef) return;
    try {
      await updateDoc(docRef, { 'metadata.completed': true });
    } catch (err) {
      console.error('Error marking complete:', err);
    }
  }, [docRef]);

  return { messages, metadata, loading, saving, error, addMessage, sendMessage };
}
