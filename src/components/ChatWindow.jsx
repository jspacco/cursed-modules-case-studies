import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

export function ChatWindow({ messages, thinking, tutorName, closingDeliverable }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          tutorName={tutorName}
          closingDeliverable={closingDeliverable}
        />
      ))}
      {thinking && (
        <div className="message-row assistant">
          <div className="message-label">{tutorName}</div>
          <div className="thinking-indicator">
            <div className="thinking-dot" />
            <div className="thinking-dot" />
            <div className="thinking-dot" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
