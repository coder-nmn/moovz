import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMessageCircle, FiX, FiSend, FiTrash2 } from 'react-icons/fi';
import './ChatBot.css';

const STARTER_MESSAGES = [
  '🎬 Find me a good thriller',
  '⭐ What are trending movies?',
  '🎭 Tell me about an actor',
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// Parse [Text](/path) markdown links into clickable React Router Links
function parseMessageContent(text) {
  const linkRegex = /\[([^\]]+)\]\((\/[^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Push text before the link
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    // Push the link
    parts.push({ type: 'link', text: match[1], path: match[2] });
    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  if (parts.length === 0) return text;

  return parts.map((part, i) =>
    part.type === 'link' ? (
      <Link key={i} to={part.path} className="chatbot-link">
        {part.text}
      </Link>
    ) : (
      <span key={i}>{part.value}</span>
    )
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const reply = data.reply || data.error || "Sorry, I couldn't process that.";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting. Please check if the server is running and try again! 🎬",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStarterClick = (text) => {
    sendMessage(text);
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h4 className="chatbot-title">Moovz AI</h4>
                <span className="chatbot-status">Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setMessages([])} title="Clear conversation">
              <FiTrash2 />
            </button>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} title="Close">
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="chatbot-welcome-icon">🎬</div>
                <p className="chatbot-welcome-text">
                  Hi! I'm your Moovz assistant. Ask me anything about movies, TV shows, or actors!
                </p>
                <div className="chatbot-starters">
                  {STARTER_MESSAGES.map((msg, i) => (
                    <button key={i} className="chatbot-starter" onClick={() => handleStarterClick(msg)}>
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'assistant' && <span className="chatbot-msg-avatar">🤖</span>}
                <div className="chatbot-msg-bubble">{parseMessageContent(msg.content)}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chatbot-msg assistant">
                <span className="chatbot-msg-avatar">🤖</span>
                <div className="chatbot-msg-bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form className="chatbot-input-bar" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask about movies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" className="chatbot-send" disabled={!input.trim() || isTyping}>
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button
        className={`chatbot-fab ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat with Moovz AI"
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </>
  );
}
