import { useState } from 'react';

// Very simple markdown renderer — no external deps
function renderMarkdown(text) {
  // Split into blocks by double newline
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, i) => {
    // Code block
    if (block.startsWith('```')) {
      const lines = block.split('\n');
      const code = lines.slice(1, lines[lines.length - 1] === '```' ? -1 : undefined).join('\n');
      return <pre key={i}><code>{code}</code></pre>;
    }
    // Unordered list
    if (block.split('\n').every(l => l.startsWith('- ') || l.startsWith('* '))) {
      const items = block.split('\n').filter(Boolean);
      return (
        <ul key={i}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.slice(2))}</li>
          ))}
        </ul>
      );
    }
    // Ordered list
    if (block.split('\n').every(l => /^\d+\.\s/.test(l))) {
      const items = block.split('\n').filter(Boolean);
      return (
        <ol key={i}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      );
    }
    // Paragraph
    return <p key={i}>{renderInline(block)}</p>;
  });
}

function renderInline(text) {
  // Split on code, bold, italic
  const parts = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const m = match[0];
    if (m.startsWith('`')) {
      parts.push(<code key={match.index}>{m.slice(1, -1)}</code>);
    } else if (m.startsWith('**')) {
      parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
    }
    last = match.index + m.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

export function MessageBubble({ message, tutorName, closingDeliverable }) {
  const { role, content } = message;
  const [copied, setCopied] = useState(false);

  // Detect deliverable
  const deliverableFirstSentence = closingDeliverable?.split('\n')[0] ?? '';
  const isDeliverable = deliverableFirstSentence && content.includes(deliverableFirstSentence);

  // Split content into pre-deliverable and deliverable if needed
  let mainContent = content;
  let deliverableContent = null;
  if (isDeliverable) {
    const idx = content.indexOf(deliverableFirstSentence);
    mainContent = content.slice(0, idx).trim();
    deliverableContent = content.slice(idx).trim();
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(closingDeliverable).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`message-row ${role}`}>
      <div className="message-label">
        {role === 'assistant' ? tutorName : 'You'}
      </div>
      <div className={`message-bubble ${role}`}>
        {role === 'assistant' ? (
          <>
            {mainContent && renderMarkdown(mainContent)}
            {deliverableContent && (
              <div className="deliverable-box">
                <pre>{deliverableContent}</pre>
                <div className="deliverable-actions">
                  <button className="btn-copy" onClick={handleCopy}>
                    {copied ? 'Copied!' : 'Copy deliverable prompt'}
                  </button>
                  <span className="deliverable-note">Write your response in the chat. Ray will give you feedback.</span>
                </div>
              </div>
            )}
          </>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
