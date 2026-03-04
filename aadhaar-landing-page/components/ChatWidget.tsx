import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, ChatSender } from '../types';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: ChatSender.BOT,
      text: "Namaste! I am the Aadhaar Policy Assistant. How can I help you today regarding enrollment, updates, or regulations?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: ChatSender.USER,
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key not configured");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Using gemini-3-flash-preview for quick, efficient text responses
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: inputValue,
        config: {
            systemInstruction: `You are the Official Aadhaar Policy AI Assistant. 
            Your tone must be: Professional, Authoritative, yet Empathetic and Reassuring.
            You assist citizens and officials with questions about UIDAI, Aadhaar Act, enrollment processes, and biometric updates.
            
            Guidelines for Interaction:
            1. **Empathy First**: If the user asks about corrections, lost cards, or rejection, acknowledge their concern gently (e.g., "I understand it is important to get this corrected") before providing the solution.
            2. **Scope**: Only answer questions related to Aadhaar, UIDAI, and Indian Government Identity services.
            3. **Escalation**: If you don't know the answer, politely advise the user to visit the nearest Enrollment Center or call the toll-free number 1947.
            4. **Privacy Protocol**: STRICTLY FORBIDDEN to ask for personal details like Aadhaar Number, OTP, or Date of Birth. Remind users not to share these.
            5. **Format**: Keep answers concise (under 100 words) and easy to read. Use bullet points for procedural steps.
            `,
        }
      });

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: ChatSender.BOT,
        text: response.text || "I apologize, I could not process your request at this moment. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: ChatSender.SYSTEM,
        text: "System: Unable to connect to Policy Database. Please check your network or try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-govt-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-800 transition-all z-50 flex items-center gap-2 group"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-medium text-sm">
          Policy Assistant
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[600px] overflow-hidden">
      {/* Chat Header */}
      <div className="bg-govt-blue p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-full">
                <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
                <h3 className="text-white font-bold text-sm">Aadhaar Sahayak</h3>
                <p className="text-blue-200 text-xs">AI-Powered Policy Help</p>
            </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 h-80 md:h-96">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === ChatSender.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === ChatSender.USER
                  ? 'bg-govt-blue text-white rounded-br-none'
                  : msg.sender === ChatSender.SYSTEM
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg border border-gray-200 rounded-bl-none flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-govt-blue" />
                    <span className="text-xs text-gray-500">Processing query...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about updates, PVC cards..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-govt-blue focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-govt-saffron text-white p-2 rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">AI responses are for guidance only. Verify with official sources.</p>
        </div>
      </div>
    </div>
  );
};