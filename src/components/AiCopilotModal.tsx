import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Activity,
  X,
  RefreshCw
} from 'lucide-react';

interface AiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (cmd: string) => void;
}

export const AiCopilotModal: React.FC<AiCopilotModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; action?: string }>>([
    {
      role: 'assistant',
      text: 'Hello Engineer. I am 4M Engineering Copilot. I can assist with the real CalculiX FEM beam solver and the real OpenFOAM CFD pipe-flow solver, plus the analytical formula calculators and design standards. How can I assist your study today?',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Calculate cooling load for this building',
    'Find all HVAC clashes with structural beams',
    'Generate BOQ and cost estimate',
    'Find electrical circuits with excessive voltage drop',
    'Optimize airfoil angle of attack for max L/D ratio',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || promptInput;
    if (!query.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      } else {
        const errorMsg = data.message || data.error || 'Set GEMINI_API_KEY to enable the AI copilot.';
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `⚠️ **AI Copilot Notice**: ${errorMsg}\n\n*Code: ${data.error || 'UNCONFIGURED'}*`,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ **Connection Error**: Unable to reach /api/copilot endpoint. Check network or server status.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none font-mono">
      <div className="w-full max-w-2xl bg-[#1a1c1f] rounded-lg border border-[#3491ff]/40 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="h-10 px-4 bg-[#111316] border-b border-[#282a2d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#00daf3]" />
            <span className="text-white font-bold text-[12px] tracking-wide">4M Engineering Copilot (AI Phase 11)</span>
            <span className="text-[9px] bg-[#282a2d] px-1.5 py-0.5 rounded text-[#a8c8ff]">Gemini 2.5 Pro CAE</span>
          </div>
          <button onClick={onClose} className="text-[#8a919f] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-[#0c0e11] border-b border-[#282a2d] flex flex-wrap gap-1.5 text-[10px]">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-2 py-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#a8c8ff] rounded border border-[#282a2d] transition-colors cursor-pointer text-left"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-[11px] bg-[#0c0e11]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[9px] text-[#8a919f] mb-1">
                {m.role === 'user' ? 'You (Engineer)' : '4M Copilot'}
              </div>
              <div
                className={`max-w-[85%] p-3 rounded text-[11px] leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-[#3491ff] text-white font-semibold'
                    : 'bg-[#1e2023] text-[#e2e2e6] border border-[#282a2d]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-[#00daf3] text-[10px] bg-[#1e2023] p-2 rounded w-fit border border-[#282a2d]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Waiting for Copilot response...</span>
            </div>
          )}
        </div>

        {/* Prompt Input Form */}
        <div className="p-3 bg-[#111316] border-t border-[#282a2d] flex items-center gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask Copilot (e.g., 'Check aerodynamic stall angle' or 'Calculate duct sizing')..."
            className="flex-1 bg-[#1a1c1f] border border-[#282a2d] px-3 py-2 rounded text-white text-[11px] focus:outline-none focus:border-[#00daf3]"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !promptInput.trim()}
            className="px-4 py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] disabled:opacity-50 text-white font-bold text-[11px] rounded transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
