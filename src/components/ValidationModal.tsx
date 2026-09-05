import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X, Play, RefreshCw, ShieldCheck } from 'lucide-react';
import { ValidationMessage } from '../types';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ValidationMessage[];
  isValidating: boolean;
  canRun: boolean;
  onRunSimulation: () => void;
  onRevalidate: () => void;
  studyType: string;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  messages,
  isValidating,
  canRun,
  onRunSimulation,
  onRevalidate,
  studyType,
}) => {
  if (!isOpen) return null;

  const errorCount = messages.filter((m) => m.level === 'ERROR').length;
  const warningCount = messages.filter((m) => m.level === 'WARNING').length;
  const infoCount = messages.filter((m) => m.level === 'INFO').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-2xl bg-[#1a1c1f] rounded-lg border border-[#282a2d] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="h-11 px-4 bg-[#111316] border-b border-[#282a2d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00daf3]" />
            <span className="text-white font-bold text-[12px] tracking-wide">
              PRE-SIMULATION AUDIT & VALIDATION ENGINE (SECTION 28)
            </span>
            <span className="text-[9px] bg-[#282a2d] text-[#a8c8ff] px-2 py-0.5 rounded font-mono">
              {studyType} STUDY
            </span>
          </div>
          <button onClick={onClose} className="text-[#8a919f] hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Summary Telemetry Bar */}
        <div className="p-3 bg-[#0c0e11] border-b border-[#282a2d] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#ffb4ab]">
              <AlertCircle className="w-3.5 h-3.5 text-[#ffb4ab]" />
              <strong>{errorCount}</strong> Errors
            </span>
            <span className="flex items-center gap-1.5 text-[#ffb68b]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffb68b]" />
              <strong>{warningCount}</strong> Warnings
            </span>
            <span className="flex items-center gap-1.5 text-[#a8c8ff]">
              <Info className="w-3.5 h-3.5 text-[#a8c8ff]" />
              <strong>{infoCount}</strong> Validated
            </span>
          </div>

          <button
            onClick={onRevalidate}
            disabled={isValidating}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#1e2023] hover:bg-[#282a2d] text-white rounded border border-[#282a2d] text-[10px] cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isValidating ? 'animate-spin' : ''}`} />
            <span>Re-Audit Setup</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-[11px] bg-[#0c0e11]">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-[#8a919f] flex flex-col items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-[#34c759]" />
              <span className="text-white font-bold">All Physics & Numerical Checks Passed</span>
              <p className="text-[10px] max-w-md">
                Model geometry, topological manifold condition, materials, boundary conditions, and mesh discretizations meet standard criteria.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border flex flex-col gap-1.5 ${
                  msg.level === 'ERROR'
                    ? 'bg-[#2b1616] border-[#ff8b8b]/40 text-[#ffebe8]'
                    : msg.level === 'WARNING'
                    ? 'bg-[#2b2216] border-[#ffb68b]/40 text-[#fff4e8]'
                    : 'bg-[#15202b] border-[#3491ff]/40 text-[#e8f4ff]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] flex items-center gap-1.5">
                    {msg.level === 'ERROR' && <AlertCircle className="w-3.5 h-3.5 text-[#ff8b8b]" />}
                    {msg.level === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-[#ffb68b]" />}
                    {msg.level === 'INFO' && <Info className="w-3.5 h-3.5 text-[#00daf3]" />}
                    {msg.problem}
                  </span>
                  <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded font-mono">
                    {msg.location}
                  </span>
                </div>

                <div className="text-[10px] text-[#c0c6d6] leading-relaxed">
                  <strong>Reason: </strong> {msg.reason}
                </div>

                <div className="text-[10px] text-[#00daf3] bg-black/30 p-1.5 rounded flex items-center justify-between">
                  <span><strong>Action: </strong>{msg.solution}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-[#111316] border-t border-[#282a2d] flex items-center justify-between">
          <div className="text-[10px] text-[#8a919f]">
            {canRun ? (
              <span className="text-[#34c759] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                VERIFICATION PASSED — SOLVER READY
              </span>
            ) : (
              <span className="text-[#ff8b8b] flex items-center gap-1 font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                CANNOT PROCEED: RESOLVE BLOCKING ERRORS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#1e2023] hover:bg-[#282a2d] text-white text-[10px] rounded border border-[#282a2d] cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onRunSimulation();
              }}
              disabled={!canRun}
              className="px-4 py-1.5 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[10px] rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Solver Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
