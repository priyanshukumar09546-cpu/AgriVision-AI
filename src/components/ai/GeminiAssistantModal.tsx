import React, { useState, useEffect } from 'react';
import { Bot, Send, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { askGeminiAssistant, checkGeminiStatus, type GeminiStatusResponse } from '../../services/geminiService';

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  cropContext?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  model?: string;
  isError?: boolean;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  cropContext = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState<GeminiStatusResponse | null>(null);

  const suggestionChips = [
    'How do I treat Early Blight organically?',
    'What is the best N-P-K fertilizer ratio for tomatoes?',
    'How can I protect wheat crops during rainy weather?',
    'What are common symptoms of bacterial leaf spot?'
  ];

  useEffect(() => {
    if (isOpen) {
      checkGeminiStatus().then((info) => setStatusInfo(info));
      if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: `Hello! I am AgriVision AI's Agronomist Assistant powered by Google Gemini. Ask me any questions about crop health, disease management, soil nutrition, or farming practices.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await askGeminiAssistant(text, cropContext);
      if (res.success && res.answer) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: res.model || statusInfo?.model || 'gemini-3.6-flash',
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.error || 'Unable to process your request at this moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'An unexpected connection error occurred. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[85vh] max-h-[650px] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#15803D] flex items-center justify-center font-bold">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">AgriVision AI Assistant</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-[#15803D]" />
                  <span>{statusInfo?.model || 'gemini-3.6-flash'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Real-time Agricultural Guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAFDFB]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#15803D] text-white rounded-br-none shadow-xs font-medium'
                    : msg.isError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-bl-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.isError && (
                  <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1 text-[11px]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Gemini API Notice</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.model && !msg.isError && (
                  <div className="mt-2 pt-1 border-t border-slate-100 text-[9.5px] text-slate-400 font-semibold flex items-center justify-between">
                    <span>Powered by Google Gemini</span>
                    <span>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-xs flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Loader2 className="w-4 h-4 text-[#15803D] animate-spin" />
                <span>Consulting Gemini AI Agronomist...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="shrink-0 text-[10.5px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-[#15803D] hover:text-[#15803D] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Gemini about crop care, disease prevention, fertilizers..."
            className="flex-1 h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="h-10 px-4 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
