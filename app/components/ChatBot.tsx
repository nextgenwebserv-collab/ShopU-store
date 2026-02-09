'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  content: string;
  role: 'user' | 'assistant';
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      content: 'Hello! Welcome to ShopU. How can I help you with your shopping today? 😊',
      role: 'assistant',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = { content: message, role: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      const botMessage = { content: data.reply, role: 'assistant' as const };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { content: 'Sorry, I encountered an error. Please try again later.', role: 'assistant' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed right-5 bottom-5 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center rounded-full bg-[#317C80] p-4 text-white shadow-lg transition-all duration-200 hover:bg-teal-700"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="absolute right-0 bottom-16 flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl sm:w-96">
          {/* Chat Header */}
          <div className="flex items-center bg-teal-600 px-4 py-3 text-white">
            <div className="mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">ShopU Assistant</h3>
              <p className="text-xs text-teal-100">Online</p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mb-3 flex justify-start">
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none"
                placeholder="Type a message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="rounded-r-lg bg-teal-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-teal-700 disabled:bg-teal-400"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
