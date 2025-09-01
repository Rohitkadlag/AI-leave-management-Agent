// TODO: Add component content here
import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperAirplaneIcon, 
  BoltIcon, 
  TrashIcon,
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';
import { useAI } from '../../hooks/useAI';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { chatHistory, loading, sendChatMessage, clearChatHistory } = useAI();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      const context = {
        userRole: user.role,
        userName: user.name
      };
      
      await sendChatMessage(userMessage, context);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    clearChatHistory();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const quickQuestions = [
    "What's the company leave policy?",
    "How many sick days do I have?",
    "Can I take leave during busy periods?",
    "What documents do I need for medical leave?",
    "How far in advance should I request leave?"
  ];

  const handleQuickQuestion = (question) => {
    setMessage(question);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <BoltIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
            <p className="text-xs text-gray-600">Ask me anything about leave management</p>
          </div>
        </div>
        
        {chatHistory.length > 0 && (
          <button
            onClick={handleClearChat}
            className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            title="Clear chat history"
          >
            <TrashIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center py-8">
            <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to your AI Assistant!
            </h3>
            <p className="text-gray-600 mb-6">
              I'm here to help with questions about leave policies, procedures, and more.
            </p>
            
            <div className="text-left max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-2">Try asking:</p>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="block w-full text-left text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                  >
                    • {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-primary-200' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {(isTyping || loading) && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me about leave policies, procedures, or anything else..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
          >
            {loading ? (
              <LoadingSpinner size="small" text="" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses are generated and may not always be accurate. Please verify important information.
        </p>
      </div>
    </div>
  );
};

export default AIChat;