import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bot, 
  Send, 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  ChevronLeft, 
  Sparkles,
  Paperclip,
  Trash2,
  X,
  MoreHorizontal,
  Zap,
  BookOpen,
  Calendar,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import AIService from '../services/AIService';
import { clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

const AIChatPage = () => {
  const { state, updateSection } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [apiKey, setApiKey] = useState(AIService.getApiKey());
  const [showSettings, setShowSettings] = useState(false);
  
  // Chat History Management
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize new chat if none exists
  useEffect(() => {
    if (history.length === 0) {
      handleNewChat();
    } else if (!currentChatId) {
      // Load most recent chat
      const recent = history[0];
      setCurrentChatId(recent.id);
      setMessages(recent.messages);
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(history));
  }, [history]);

  // Update AI context when state changes
  useEffect(() => {
    if (state) AIService.setAppData(state);
  }, [state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleNewChat = () => {
    const newChat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      timestamp: new Date().toISOString()
    };
    setHistory([newChat, ...history]);
    setCurrentChatId(newChat.id);
    setMessages([]);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSelectChat = (chatId) => {
    const chat = history.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      if (window.innerWidth < 768) setShowSidebar(false);
    }
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    const newHistory = history.filter(c => c.id !== chatId);
    setHistory(newHistory);
    if (currentChatId === chatId) {
      if (newHistory.length > 0) {
        setCurrentChatId(newHistory[0].id);
        setMessages(newHistory[0].messages);
      } else {
        handleNewChat();
      }
    }
  };

  const updateChatTitle = (chatId, firstMessage) => {
    const updatedHistory = history.map(chat => {
      if (chat.id === chatId && chat.title === 'New Chat') {
        const title = firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage;
        return { ...chat, title };
      }
      return chat;
    });
    setHistory(updatedHistory);
  };

  const executeAction = (tool, args) => {
    if (!state) return false;

    try {
      if (tool === 'ADD_TASK') {
        const newTasks = [...(state.tasks || [])];
        newTasks.push({
          id: uuidv4(),
          title: args.title || 'New Task',
          dueDate: args.dueDate || new Date().toISOString().split('T')[0],
          priority: args.priority || 'Medium',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        updateSection('tasks', newTasks);
        return true;
      }

      if (tool === 'ADD_GOAL') {
        const newGoals = [...(state.goals || [])];
        newGoals.push({
          id: uuidv4(),
          name: args.name || 'New Goal',
          date: args.deadline || new Date().toISOString().split('T')[0],
          completed: false
        });
        updateSection('goals', newGoals);
        return true;
      }
    } catch (error) {
      console.error('Error executing AI action:', error);
      return false;
    }
    return false;
  };

  const parseAndExecuteTools = (text) => {
    const toolRegex = /```json\s*([\s\S]*?)\s*```/g;
    let match;
    const actions = [];
    
    // Find all JSON blocks
    while ((match = toolRegex.exec(text)) !== null) {
      try {
        const jsonStr = match[1];
        const data = JSON.parse(jsonStr);
        if (data.tool && data.args) {
          actions.push(data);
        }
      } catch (e) {
        // Ignore invalid JSON blocks
      }
    }

    return actions;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: uuidv4(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    
    // Update history immediately
    const updatedHistory = history.map(chat => 
      chat.id === currentChatId ? { ...chat, messages: newMessages } : chat
    );
    setHistory(updatedHistory);

    // Update title if it's the first message
    if (messages.length === 0) {
      updateChatTitle(currentChatId, input);
    }

    const currentInput = input;
    setInput('');
    setIsTyping(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Get context from last 10 messages
    const context = newMessages.slice(-10);
    const response = await AIService.chat(currentInput, context);
    
    // Check for tools in the response
    const actions = parseAndExecuteTools(response.text);
    let finalResponseText = response.text;
    
    if (actions.length > 0) {
      // Execute actions
      let actionResults = [];
      actions.forEach(action => {
        const success = executeAction(action.tool, action.args);
        if (success) {
           actionResults.push(`✅ Action Executed: ${action.tool === 'ADD_TASK' ? 'Added Task' : 'Added Goal'} - "${action.args.title || action.args.name}"`);
        }
      });
      
      // Clean up the JSON from the text to hide it from the user (optional, but cleaner)
      // For now, we keep it or we could replace it. Let's append status.
      if (actionResults.length > 0) {
         // Create a synthetic "system" message or just append to the text
         // We'll append a clean status note
         // We remove the JSON block for cleaner UI
         finalResponseText = finalResponseText.replace(/```json\s*[\s\S]*?\s*```/g, '');
         
         // Add a visual indicator
         finalResponseText += `\n\n---\n**System Actions:**\n${actionResults.join('\n')}`;
      }
    }
    
    const finalMsg = { ...response, text: finalResponseText };
    const finalMessages = [...newMessages, finalMsg];
    setMessages(finalMessages);
    setIsTyping(false);

    // Update history with response
    const finalHistory = history.map(chat => 
      chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
    );
    setHistory(finalHistory);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveApiKey = (key) => {
    AIService.setApiKey(key);
    setApiKey(key);
    setShowSettings(false);
  };

  // Capability Cards for Empty State
  const capabilities = [
    { icon: BookOpen, title: 'Analyze Syllabus', prompt: 'Analyze my syllabus progress and suggest what to study next.' },
    { icon: Calendar, title: 'Plan Schedule', prompt: 'Create a study schedule for my upcoming exams based on my weak subjects.' },
    { icon: Layers, title: 'Generate Quiz', prompt: 'Quiz me on my least attended subject concepts.' },
    { icon: Zap, title: 'Study Tips', prompt: 'Give me effective study techniques for maintaining high grades.' },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-[#212121] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar - ChatGPT Style: Dark #171717 or #000000 */}
      <motion.div 
        initial={false}
        animate={{ width: showSidebar ? 260 : 0, opacity: showSidebar ? 1 : 0 }}
        className="flex-shrink-0 bg-[#000000] text-gray-200 overflow-hidden flex flex-col z-30 transition-all duration-300 ease-in-out"
      >
        <div className="p-3 min-w-[260px]">
          <button 
            onClick={handleNewChat}
            className="flex items-center justify-between w-full px-3 py-2.5 hover:bg-[#212121] rounded-lg transition-colors group mb-2 text-sm text-gray-100"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 bg-white/10 dark:bg-transparent border border-white/20 rounded-lg">
                 <Bot size={16} className="text-white" />
              </div>
              <span className="font-medium text-[13px]">New chat</span>
            </div>
            <MessageSquare size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 min-w-[260px] custom-scrollbar">
          <div className="space-y-1">
             <div className="pt-2 px-3 pb-2 text-[11px] font-semibold text-gray-500">Today</div>
             {history.map(chat => (
               <button
                 key={chat.id}
                 onClick={() => handleSelectChat(chat.id)}
                 className={clsx(
                   "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors group relative overflow-hidden",
                   currentChatId === chat.id 
                     ? "bg-[#212121] text-white" 
                     : "hover:bg-[#212121/50] text-gray-300 hover:text-white"
                 )}
               >
                 <span className="truncate flex-1 pr-6 text-[13px]">{chat.title}</span>
                 
                 {/* Delete button gradient overlay */}
                 {currentChatId === chat.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#212121] via-[#212121] to-transparent pointer-events-none" />
                 )}
                 
                 <div 
                   onClick={(e) => handleDeleteChat(e, chat.id)}
                   className="absolute right-2 opacity-0 group-hover:opacity-100 z-10 p-1 hover:text-white text-gray-400 transition-all"
                 >
                   <Trash2 size={14} />
                 </div>
               </button>
             ))}
          </div>
        </div>

        <div className="p-2 border-t border-white/10 min-w-[260px]">
           <button 
             onClick={() => setShowSettings(true)}
             className="flex items-center gap-3 w-full px-3 py-3 hover:bg-[#212121] rounded-lg transition-colors text-sm"
           >
             <Settings size={18} className="text-gray-400" />
             <div className="flex-1 text-left">
               <p className="font-medium text-[13px] text-gray-200">Settings</p>
             </div>
           </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative z-0 bg-white dark:bg-[#212121]">
        {/* Header - Minimalist */}
        <div className="h-12 flex items-center justify-between px-3 md:px-4 absolute top-0 left-0 right-0 z-10 bg-white/90 dark:bg-[#212121]/90 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {!showSidebar && (
              <button 
                onClick={() => setShowSidebar(true)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] rounded-md text-slate-500 transition-colors"
                title="Open Sidebar"
              >
                <Layers size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#2f2f2f] transition-colors">
              <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">StudyX 2.0</span>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full pt-14 pb-32 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-20">
               <div className="mb-6 p-4 bg-white dark:bg-[#2f2f2f] rounded-full shadow-sm">
                 <Bot size={40} className="text-slate-800 dark:text-slate-200" />
               </div>
               <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 w-full max-w-2xl px-4">
                 {capabilities.map((card, i) => (
                   <button 
                     key={i}
                     onClick={() => setInput(card.prompt)}
                     className="p-4 text-left border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#2f2f2f] rounded-xl transition-colors"
                   >
                     <h4 className="font-medium text-sm mb-1 text-slate-700 dark:text-slate-200 text-nowrap truncate">{card.title}</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 opacity-80">{card.prompt}</p>
                   </button>
                 ))}
               </div>
            </div>
          ) : (
            <div className="flex flex-col w-full mx-auto px-4 md:px-0">
              {messages.map((msg) => (
                <div key={msg.id} className="w-full py-6 md:py-8 border-b border-black/5 dark:border-white/5 last:border-0 group">
                  <div className="flex gap-4 md:gap-6 px-4 md:px-0 max-w-[95%] mx-auto">
                    <div className="flex-shrink-0 flex flex-col relative items-end">
                      <div className={clsx(
                        "w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0",
                        msg.sender === 'ai' 
                          ? "bg-[#10a37f] text-white" /* ChatGPT Green */
                          : "bg-gray-500 text-white" /* User Grey */
                      )}>
                        {msg.sender === 'ai' ? <Bot size={20} className="text-white" /> : <span className="text-xs font-semibold">U</span>}
                      </div>
                    </div>
                    <div className="relative flex-1 overflow-hidden min-w-0">
                      <div className="font-semibold text-sm mb-1 opacity-90 select-none">
                         {msg.sender === 'ai' ? 'StudyX' : 'You'}
                      </div>
                      <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-7 prose-pre:bg-[#0d0d0d] prose-pre:rounded-md prose-headings:font-semibold">
                         {msg.sender === 'ai' ? (
                           <ReactMarkdown 
                             remarkPlugins={[remarkGfm, remarkMath]}
                             rehypePlugins={[rehypeKatex]}
                             components={{
                               code({node, inline, className, children, ...props}) {
                                 const match = /language-(\w+)/.exec(className || '')
                                 return !inline && match ? (
                                   <div className="relative group my-4 rounded-md overflow-hidden bg-[#0d0d0d]">
                                      <div className="flex items-center justify-between bg-[#2d2d2d] px-4 py-1.5 text-xs text-gray-200">
                                         <span>{match[1]}</span>
                                         <span className="text-gray-400">Copy</span>
                                      </div>
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                   </div>
                                 ) : (
                                   <code className={className} {...props}>
                                     {children}
                                   </code>
                                 )
                               }
                             }}
                           >
                             {msg.text}
                           </ReactMarkdown>
                         ) : (
                           <p className="whitespace-pre-wrap">{msg.text}</p>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="w-full py-6 md:py-8 px-4 md:px-0 max-w-[95%] mx-auto">
                  <div className="flex gap-4 md:gap-6">
                    <div className="w-8 h-8 rounded-sm bg-[#10a37f] text-white flex items-center justify-center flex-shrink-0">
                       <Bot size={20} />
                    </div>
                    <div className="flex items-center h-8">
                       <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" />
                       <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce delay-75 mx-1" />
                       <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent dark:from-[#212121] dark:via-[#212121] pt-10 pb-6 px-4">
          <div className="w-full max-w-[90%] mx-auto">
             <div className="relative flex items-end gap-2 bg-white dark:bg-[#2f2f2f] rounded-xl shadow-lg border border-slate-200 dark:border-gray-700/50 p-2 ring-offset-2 focus-within:ring-1 ring-blue-500/10 transition-all">
               <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Paperclip size={20} />
               </button>
               
               <textarea
                 ref={textareaRef}
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyDown={handleKeyDown}
                 placeholder="Message StudyX..."
                 className="flex-1 max-h-[200px] bg-transparent border-none focus:ring-0 py-3 text-[15px] text-slate-800 dark:text-gray-100 placeholder:text-slate-400 resize-none overflow-y-auto custom-scrollbar leading-relaxed"
                 rows={1}
                 style={{ minHeight: '44px' }}
               />

               <button 
                 onClick={handleSend}
                 disabled={!input.trim() || isTyping}
                 className={clsx(
                   "p-2 rounded-lg transition-all duration-200 mb-1",
                   input.trim() 
                     ? "bg-black dark:bg-white text-white dark:text-black" 
                     : "bg-transparent text-slate-300 dark:text-gray-600 cursor-not-allowed"
                 )}
               >
                 <Send size={18} />
               </button>
             </div>
             <div className="text-center mt-2.5">
               <span className="text-[11px] text-slate-400 dark:text-gray-500 font-normal">
                 StudyX can make mistakes. Consider checking important information.
               </span>
             </div>
          </div>
        </div>

      </div>

      {/* Settings Modal - kept same logic but updated styles if needed */}
      <AnimatePresence>
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-semibold text-lg">Settings</h3>
               <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] rounded-full">
                 <X size={20} />
               </button>
             </div>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">API Key (OpenRouter)</label>
                 <input 
                   type="password" 
                   value={apiKey}
                   onChange={e => setApiKey(e.target.value)}
                   className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#2f2f2f] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                   placeholder="sk-or-..." 
                 />
                 <p className="text-xs text-slate-500 mt-2">
                   Your key is stored locally in your browser.
                 </p>
               </div>
               <div className="flex justify-end gap-2 mt-6">
                 <button 
                   onClick={() => setShowSettings(false)}
                   className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2f2f2f] rounded-lg transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => saveApiKey(apiKey)}
                   className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
                 >
                   Save
                 </button>
               </div>
             </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatPage;
