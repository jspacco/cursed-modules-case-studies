import { useState, useRef, useEffect } from 'react';

export function ChatInput({ onSend, disabled, quickPrompts }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    autoResize();
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // reset height after clearing
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (disabled) return;
    onSend(prompt);
  };

  return (
    <>
      {quickPrompts && quickPrompts.length > 0 && (
        <div className="quick-prompts">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              className="btn-quick"
              onClick={() => handleQuickPrompt(p)}
              disabled={disabled}
            >
              {p}
            </button>
          ))}
        </div>
      )}
      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your response… (Enter to send, Shift+Enter for newline)"
          disabled={disabled}
          rows={1}
          style={{ overflow: 'hidden' }}
        />
        <button
          className="btn-send"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          Send
        </button>
      </div>
    </>
  );
}
