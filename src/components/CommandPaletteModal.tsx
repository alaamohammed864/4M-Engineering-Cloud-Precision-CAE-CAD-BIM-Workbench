import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  FileText,
  Settings,
  Globe,
  Sliders,
  Play,
  ArrowRight,
  X
} from 'lucide-react';
import { ActiveWorkbenchView, UserExperienceMode, AppLanguage } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: ActiveWorkbenchView) => void;
  onToggleUserMode: () => void;
  currentMode: UserExperienceMode;
  onToggleLanguage: () => void;
  currentLanguage: AppLanguage;
  onTriggerValidation: () => void;
  onOpenCopilot: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onToggleUserMode,
  currentMode,
  onToggleLanguage,
  currentLanguage,
  onTriggerValidation,
  onOpenCopilot,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    {
      id: 'cmd_validate',
      title: 'Run Pre-Simulation Validation Audit',
      subtitle: 'Perform topological, boundary condition, and mesh checks (Section 28)',
      icon: ShieldCheck,
      category: 'SOLVER',
      action: () => {
        onClose();
        onTriggerValidation();
      },
    },
    {
      id: 'cmd_fea_acc',
      title: 'Real FEM Beam Solver (CalculiX)',
      subtitle: 'Runs the real CalculiX (ccx) binary on a generated mesh via an isolated solver backend',
      icon: Cpu,
      category: 'TESTING',
      action: () => {
        onClose();
        onSelectView('fea-acceptance');
      },
    },
    {
      id: 'cmd_cfd_acc',
      title: 'Analytical Pipe Flow Calculator (Darcy-Weisbach)',
      subtitle: 'Analytical pipe flow calculation; OpenFOAM CFD solver integration is planned',
      icon: Zap,
      category: 'TESTING',
      action: () => {
        onClose();
        onSelectView('solver-monitor');
      },
    },
    {
      id: 'cmd_sketch',
      title: 'Open 2D Parametric Sketcher',
      subtitle: 'Geometric constraints, dimensional parameters, and Extrude/Revolve (Section 9A)',
      icon: Layers,
      category: 'GEOMETRY',
      action: () => {
        onClose();
        onSelectView('geometry-and-sketch');
      },
    },
    {
      id: 'cmd_mesh',
      title: 'Open Mesh Generator & Quality Inspector',
      subtitle: 'Gmsh tet/hex meshing, prism inflation layers, and aspect ratio metrics (Section 22)',
      icon: Sliders,
      category: 'MESHING',
      action: () => {
        onClose();
        onSelectView('mesh-generator');
      },
    },
    {
      id: 'cmd_results',
      title: 'Post-Processing & Certification Dossier',
      subtitle: 'Scalar pressure/stress contours, streamlines, Cp curves & PDF report (Section 34)',
      icon: FileText,
      category: 'RESULTS',
      action: () => {
        onClose();
        onSelectView('results-and-reports');
      },
    },
    {
      id: 'cmd_toggle_mode',
      title: `Switch Mode to ${currentMode === 'beginner' ? 'ADVANCED ENGINEER' : 'BEGINNER GUIDED'}`,
      subtitle: currentMode === 'beginner' ? 'Expose numerical schemes, Courant limits and raw dictionaries' : 'Switch to clean, high-level wizard interface',
      icon: Sliders,
      category: 'PREFERENCES',
      action: () => {
        onClose();
        onToggleUserMode();
      },
    },
    {
      id: 'cmd_toggle_lang',
      title: currentLanguage === 'en' ? 'التبديل إلى الواجهة العربية (RTL)' : 'Switch to English UI (LTR)',
      subtitle: 'Internationalization & bilingual engineering terms (Section 70)',
      icon: Globe,
      category: 'LANGUAGE',
      action: () => {
        onClose();
        onToggleLanguage();
      },
    },
    {
      id: 'cmd_copilot',
      title: 'Launch 4M / Engineer AI Copilot',
      subtitle: 'Natural language engineering calculations and aerodynamic guidance (Section 58)',
      icon: Zap,
      category: 'AI ASSISTANT',
      action: () => {
        onClose();
        onOpenCopilot();
      },
    },
    {
      id: 'cmd_settings',
      title: 'System Preferences & Material Library',
      subtitle: 'Units (SI / Imperial), active regulatory standards, and material database (Section 55)',
      icon: Settings,
      category: 'SETTINGS',
      action: () => {
        onClose();
        onSelectView('system-settings');
      },
    },
  ];

  const filtered = commands.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-24 p-4 font-mono select-none">
      <div className="w-full max-w-xl bg-[#1a1c1f] rounded-lg border border-[#3491ff]/40 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        {/* Search Input Bar */}
        <div className="h-12 px-3 bg-[#111316] border-b border-[#282a2d] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#00daf3]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a command or search workflow (e.g., 'FEA', 'Validate', 'Mesh', 'Mode')..."
            className="flex-1 bg-transparent border-none text-white text-[12px] placeholder-[#8a919f] focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-[#282a2d] text-[#8a919f] rounded text-[9px]">
            ESC
          </kbd>
          <button onClick={onClose} className="text-[#8a919f] hover:text-white cursor-pointer ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Items List */}
        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1 text-[11px] bg-[#0c0e11]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[#8a919f] text-[11px]">
              No commands matching "{searchQuery}"
            </div>
          ) : (
            filtered.map((cmd) => (
              <div
                key={cmd.id}
                onClick={cmd.action}
                className="p-2.5 rounded bg-[#16181b] hover:bg-[#282a2d] border border-transparent hover:border-[#3491ff]/50 cursor-pointer transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-[#111316] rounded border border-[#282a2d] text-[#00daf3] group-hover:text-white group-hover:bg-[#3491ff]">
                    <cmd.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-[11px] group-hover:text-[#00daf3]">
                      {cmd.title}
                    </span>
                    <span className="text-[9px] text-[#8a919f]">{cmd.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] bg-[#1e2023] text-[#a8c8ff] px-1.5 py-0.5 rounded border border-[#282a2d]">
                    {cmd.category}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[#8a919f] group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="h-7 px-3 bg-[#111316] border-t border-[#282a2d] flex items-center justify-between text-[9px] text-[#8a919f]">
          <span>Navigate with mouse or keyboard</span>
          <span>ENGINEER CAE CLOUD v2.4</span>
        </div>
      </div>
    </div>
  );
};
