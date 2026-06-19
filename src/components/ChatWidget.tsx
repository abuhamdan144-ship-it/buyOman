import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '👋 Hello! Welcome to BuyOman. How can I help you today?',
      type: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // ✅ PRODUCTION URL - THIS IS THE CORRECT ONE
  const WEBHOOK_URL = 'https://n8n-production-ea7d.up.railway.app/webhook/buyoman-chat';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), content, type, timestamp: new Date() },
    ]);
  };

  const sendQuickMessage = (message: string) => {
    setInput(message);
    setTimeout(() => handleSendMessage(message), 100);
  };

  const handleSendMessage = async (messageOverride?: string) => {
    const messageToSend = messageOverride || input;
    if (!messageToSend.trim()) return;

    addMessage(messageToSend, 'user');
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId.current,
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: sessionId.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response from n8n:', data);
      
      const reply = data.reply || data.content || data.message || data.output || "Sorry, I didn't understand. Please contact us at info@buyoman.om";
      addMessage(reply, 'bot');
    } catch (error) {
      console.error('❌ Chat error:', error);
      addMessage('❌ Sorry, I\'m having trouble connecting. Please try again later.', 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    { label: '📱 Phones', message: 'I need a new phone' },
    { label: '❄️ AC Services', message: 'AC installation price' },
    { label: '🚚 Delivery', message: 'Delivery information' },
    { label: '🛡️ Warranty', message: 'Warranty policy' },
  ];

  return (
    <>
      <button
        id="chat-widget-trigger-btn"
        onClick={toggleChat}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#D97706', // Match Oman Gold/Amber color theme for BuyOman!
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '14px 22px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow: '0 4px 15px rgba(217,119,6,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: '16px' }}>💬</span> Chat with BuyOman
      </button>

      {isOpen && (
        <div
          id="chat-widget-window"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '25px',
            width: '380px',
            height: '520px',
            background: '#121212', // Match dark UI of BuyOman
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            border: '1px solid #2a2a2a',
            fontFamily: "Inter, system-ui, sans-serif",
            color: '#e5e5e5'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1e1b4b, #120e2e)',
              borderBottom: '1px solid #262626',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '20px 20px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontWeight: 900, fontSize: '15px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>🇴🇲 BuyOman Advisor</span>
              <div style={{ fontSize: '11px', opacity: 0.7, color: '#f59e0b', fontWeight: 'bold' }}>Live Workflow Active • Replies Instantly</div>
            </div>
            <button
              id="chat-widget-close-btn"
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                color: '#a3a3a3',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: '#09090b',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.type === 'user' ? '#171717' : '#1e1b4b',
                  color: 'white',
                  border: msg.type === 'user' ? '1px solid #262626' : '1px solid #312e81',
                  padding: '10px 14px',
                  borderRadius:
                    msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  fontSize: '12.5px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  background: '#121212',
                  border: '1px solid #1e1b4b',
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  alignSelf: 'flex-start',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span className="animate-pulse">⏳</span> BuyOman assistant is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '10px 14px',
              background: '#09090b',
              borderTop: '1px solid #1f1f23',
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
            }}
          >
            {quickReplies.map((reply) => (
              <button
                key={reply.label}
                id={`chat-widget-quick-${reply.label.toLowerCase().replace(/[^a-z]/g, '')}`}
                onClick={() => sendQuickMessage(reply.message)}
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#a1a1aa',
                  fontWeight: 'bold',
                  transition: 'all 0.15s'
                }}
              >
                {reply.label}
              </button>
            ))}
          </div>

          <div
            style={{
              padding: '12px 14px',
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid #1f1f23',
              background: '#0a0a0c',
              borderRadius: '0 0 20px 20px',
            }}
          >
            <input
              id="chat-widget-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Query n8n webhook workflow..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: '#18181c',
                border: '1px solid #27272c',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                fontSize: '12.5px',
              }}
            />
            <button
              id="chat-widget-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              style={{
                background: '#d97706',
                color: 'white',
                border: 'none',
                padding: '0 16px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                opacity: isLoading || !input.trim() ? 0.5 : 1,
                transition: 'all 0.15s'
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
