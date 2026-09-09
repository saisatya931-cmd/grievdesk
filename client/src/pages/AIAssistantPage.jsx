import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Clock,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { aiAPI } from '../services/api';
import { Button } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const SUGGESTIONS = [
  'How do I file a new complaint?',
  'What does "Under Review" status mean?',
  'How long does complaint resolution take?',
  'Which department handles hostel & mess problems?',
  'Can I track my complaint progress in real time?',
  'What should I include in my complaint description?',
];

export const AIAssistantPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hello ${
        user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : ''
      }! 👋 I am the GrievDesk AI Assistant. I can help you file complaints, navigate campus departments, understand resolution statuses, and track your grievances. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.chat({ question: query });
      const answer = res.data?.data?.answer || 'I am ready to help with any questions regarding GrievDesk!';

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: answer,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: `To submit a complaint on GrievDesk:
1. Click **New Complaint** in the navigation bar.
2. Fill in the Title, choose the Category, and enter a detailed Description (min 10 characters).
3. Select Priority and optionally provide your Campus Location.
4. Click Submit Complaint to register it directly in the system.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="container-max py-6 px-4 sm:px-6 max-w-4xl flex flex-col h-[calc(100vh-5rem)]">
      {/* Page Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1F2937] dark:text-[#F8FAFC] flex items-center gap-2">
              GrievDesk AI Assistant
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 font-medium">
                Online
              </span>
            </h1>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              Instant grievance guidance, policy navigation, and complaint help
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 1,
                sender: 'ai',
                text: 'Conversation reset. How can I help you today?',
                timestamp: new Date(),
              },
            ])
          }
          className="text-xs text-[#6B7280] hover:text-[#B8892E] dark:hover:text-[#E0B85C] transition-colors flex items-center gap-1 self-start sm:self-center"
        >
          <RefreshCw size={12} />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggestion Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
        <span className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] flex items-center gap-1 whitespace-nowrap">
          <Sparkles size={12} className="text-gold-500" /> Prompts:
        </span>
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(s)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full border border-[#E2E5E9] dark:border-[#343A46] hover:border-[#B8892E] dark:hover:border-[#C89B3C] bg-white dark:bg-[#1B2028] text-[#1F2937] dark:text-[#D1D5DB] whitespace-nowrap transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="card flex-grow p-4 sm:p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed relative group ${
                  isAI
                    ? 'bg-[#F0F1F3] dark:bg-[#252C36] text-[#1F2937] dark:text-[#F8FAFC] rounded-tl-none border border-[#E2E5E9] dark:border-[#343A46]'
                    : 'bg-[#B8892E] dark:bg-[#C89B3C] text-white rounded-tr-none shadow-md font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                <div
                  className={`flex items-center justify-between gap-4 mt-2 text-[10px] ${
                    isAI ? 'text-[#6B7280] dark:text-[#9CA3AF]' : 'text-amber-100'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {isAI && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#1F2937] dark:hover:text-[#F8FAFC]"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-lg bg-[#B8892E] dark:bg-[#C89B3C] text-white flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
                </div>
              )}
            </motion.div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
              <Bot size={18} />
            </div>
            <div className="bg-[#F0F1F3] dark:bg-[#252C36] rounded-2xl rounded-tl-none p-4 flex items-center gap-2 border border-[#E2E5E9] dark:border-[#343A46]">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] ml-1">AI Assistant is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <input
          id="ai-chat-input"
          name="message"
          aria-label="Ask a question about filing complaints, departments, or statuses"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about filing complaints, departments, or statuses..."
          disabled={loading}
          className="input-field flex-grow"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!input.trim() || loading}
          className="flex-shrink-0"
        >
          <Send size={18} />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </form>
    </div>
  );
};
