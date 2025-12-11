import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, Minimize2, Maximize2, Key, Settings, Trash2 } from 'lucide-react';
import AIService from '../../services/AIService';
import { useApp } from '../../context/AppContext';
import { clsx } from 'clsx';
import ReactMarkdown from 'react-markdown';

const AIChatWidget = () => {
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('OPENROUTER_API_KEY') || '');
  const [messages, setMessages] = useState([
    { 
      id: 'welcome', 
      text: "👋 Hi! I'm your **AI Study Assistant** powered by Gemini 2.0 Flash. I have access to all your app data - ask me anything about your subjects, syllabus, attendance, or study tips!\n\n💡 *Tip: Add your OpenRouter API key in settings (⚙️) to unlock full AI capabilities.*", 
      sender: 'ai', 
      timestamp: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Update AI service with app data whenever state changes
  useEffect(() => {
    if (state) {
      AIService.setAppData(state);
    }
  }, [state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSaveApiKey = () => {
    AIService.setApiKey(apiKey);
    setShowSettings(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: apiKey 
        ? "✅ API key saved! I'm now fully powered and ready to help you with anything!" 
        : "⚠️ API key removed. I'll use basic responses until you add a key.",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }]);
  };

  const handleClearChat = () => {
    setMessages([{ 
      id: 'welcome', 
      text: "👋 Chat cleared! How can I help you today?", 
      sender: 'ai', 
      timestamp: new Date().toISOString() 
    }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Get conversation history (last 10 messages for context)
    const history = messages.slice(-10);
    
    // Call AI Service with context
    const response = await AIService.chat(currentInput, history);
    
    setMessages(prev => [...prev, response]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "📊 How's my attendance?",
    "📚 What should I study?",
    "🎯 My pending tasks?",
    "💡 Study tips"
  ];

  const handleQuickPrompt = (prompt) => {
    setInput(prompt.slice(2).trim()); // Remove emoji
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75 group-hover:opacity-100" />
        <Bot size={28} className="relative z-10" />
        {AIService.isConfigured() && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </button>
    );
  }

  return (
    <div className={clsx(
      "fixed z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col",
      isMinimized 
        ? "bottom-6 right-6 w-72 h-16 rounded-2xl"
        : "bottom-6 right-6 w-[400px] h-[650px] rounded-3xl"
    )}>
      {/* Header */}
      <div 
        className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 flex justify-between items-center cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 text-white">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              StudyX AI
              {AIService.isConfigured() && (
                <span className="text-[10px] bg-green-500 px-1.5 py-0.5 rounded-full">PRO</span>
              )}
            </h3>
            {!isMinimized && (
              <p className="text-[10px] text-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Powered by Gemini
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/80">
          <button 
            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleClearChat(); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear chat"
          >
            <Trash2 size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && !isMinimized && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              🔑 OpenRouter API Key
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 dark:text-white"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Get key: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">openrouter.ai/keys</a>
            </p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={clsx(
                  "flex gap-3 max-w-[90%]",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.sender === 'user' 
                    ? "bg-slate-200 dark:bg-slate-700" 
                    : "bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                )}>
                  {msg.sender === 'user' ? "👤" : <Bot size={16} />}
                </div>
                <div className={clsx(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  msg.sender === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700",
                  msg.isError && "border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                )}>
                  {msg.sender === 'ai' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-pre:bg-slate-100 prose-pre:dark:bg-slate-900 prose-code:text-blue-600 prose-code:dark:text-blue-400">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap bg-slate-50 dark:bg-slate-950/50">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/50 dark:text-white transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatWidget;
