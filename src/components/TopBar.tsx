import React from 'react';
import { ActiveWorkbenchView, SolverStatus, UserExperienceMode, AppLanguage } from '../types';
import {
  FolderOpen,
  Bot,
  Bell,
  User,
  Box,
  Cpu,
  Layers,
  Activity,
  FileText,
  Building2,
  Settings,
  Sparkles,
  Command,
  ShieldCheck,
  Globe,
  Sliders
} from 'lucide-react';

interface TopBarProps {
  activeView: ActiveWorkbenchView;
  onSelectView: (view: ActiveWorkbenchView) => void;
  solverStatus: SolverStatus;
  currentIteration: number;
  maxIterations: number;
  onOpenCopilot: () => void;
  currentFile: string;
  userMode: UserExperienceMode;
  onToggleUserMode: () => void;
  language: AppLanguage;
  onToggleLanguage: () => void;
  onOpenCommandPalette: () => void;
  onOpenValidation: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onSelectView,
  solverStatus,
  currentIteration,
  maxIterations,
  onOpenCopilot,
  currentFile,
  userMode,
  onToggleUserMode,
  language,
  onToggleLanguage,
  onOpenCommandPalette,
  onOpenValidation,
}) => {
  const isArabic = language === 'ar';

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex flex-col bg-[#0c0e11] shadow-[0_4px_16px_rgba(0,0,0,0.65)] select-none font-mono">
      {/* Top Application Bar */}
      <div className="h-10 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d]/50">
        {/* Left Brand and Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[13px] text-[#a8c8ff] tracking-tight font-bold">
            <span className="w-2.5 h-2.5 rounded bg-[#00daf3]" />
            <span className="text-white tracking-wider">ENGINEER CAE</span>
            <span className="text-[9px] text-[#00daf3] px-1 py-0.2 bg-[#1e2023] rounded border border-[#282a2d]">
              CLOUD v2.4
            </span>
          </div>

          {/* Quick Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#c0c6d6] hover:text-white rounded border border-[#282a2d] text-[10px] cursor-pointer transition-colors"
            title="Open Command Palette (Ctrl+K)"
          >
            <Command className="w-3 h-3 text-[#00daf3]" />
            <span className="hidden sm:inline">Search / Cmd</span>
            <kbd className="px-1 py-0.2 bg-black/40 text-[#8a919f] text-[8px] rounded">Ctrl+K</kbd>
          </button>

          {/* Pre-Simulation Validation Audit Button */}
          <button
            onClick={onOpenValidation}
            className="hidden md:flex items-center gap-1 px-2 py-0.5 bg-[#1a2b25] hover:bg-[#223d34] text-[#78dc96] rounded border border-[#34c759]/40 text-[10px] cursor-pointer transition-colors"
            title="Pre-simulation validation audit (Section 28)"
          >
            <ShieldCheck className="w-3 h-3 text-[#34c759]" />
            <span>{isArabic ? 'تدقيق النموذج' : 'Audit Setup'}</span>
          </button>
        </div>

        {/* Center / Right Telemetry & Controls */}
        <div className="flex items-center gap-2 text-[11px]">
          {/* Active File Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 bg-[#1e2023] rounded border border-[#282a2d]">
            <FolderOpen className="text-[#a8c8ff] w-3 h-3" />
            <span className="text-[#e2e2e6] text-[10px] truncate max-w-[140px]">{currentFile}</span>
          </div>

          {/* Solver Status Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1a1c1f] rounded border border-[#282a2d]">
            <div
              className={`w-2 h-2 rounded-full ${
                solverStatus === 'running'
                  ? 'bg-[#00daf3] animate-ping'
                  : solverStatus === 'converged'
                  ? 'bg-[#34c759]'
                  : 'bg-[#a8c8ff]'
              }`}
            />
            <span className="text-[#8a919f] text-[9px] hidden sm:inline">SOLVER:</span>
            <span
              className={`font-semibold text-[9px] ${
                solverStatus === 'running'
                  ? 'text-[#00daf3]'
                  : solverStatus === 'converged'
                  ? 'text-[#34c759]'
                  : 'text-[#bdf4ff]'
              }`}
            >
              {solverStatus === 'running'
                ? `Iter ${currentIteration}/${maxIterations}`
                : solverStatus === 'converged'
                ? 'CONVERGED'
                : 'READY'}
            </span>
          </div>

          {/* User Experience Mode Toggle: Beginner vs Advanced */}
          <button
            onClick={onToggleUserMode}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-[#282a2d] bg-[#1e2023] hover:bg-[#282a2d] cursor-pointer transition-colors"
            title="Toggle between Beginner Guided Mode and Advanced Engineer Mode (Section 2)"
          >
            <Sliders className="w-3 h-3 text-[#00daf3]" />
            <span className="text-white font-bold">
              {userMode === 'advanced' ? 'ADVANCED' : 'GUIDED'}
            </span>
          </button>

          {/* Language Toggle: EN / AR */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] border border-[#282a2d] bg-[#1e2023] hover:bg-[#282a2d] text-[#c0c6d6] hover:text-white cursor-pointer transition-colors"
            title="Toggle English / Arabic Localization"
          >
            <Globe className="w-3 h-3 text-[#a8c8ff]" />
            <span className="font-bold">{isArabic ? 'العربية' : 'EN'}</span>
          </button>

          {/* AI Copilot Button */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-2 py-0.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#a8c8ff] rounded border border-[#3491ff]/40 transition-colors cursor-pointer group"
          >
            <Bot className="w-3 h-3 text-[#00daf3] group-hover:rotate-12 transition-transform" />
            <span className="font-bold text-[10px] text-white">Copilot</span>
            <span className="px-1 py-0.1 text-[8px] bg-[#00daf3]/20 text-[#00daf3] rounded">AI</span>
          </button>

          {/* User Account Avatar */}
          <div className="w-6 h-6 rounded-full bg-[#3491ff] flex items-center justify-center text-black font-bold text-xs shadow">
            <User className="w-3.5 h-3.5 text-[#003061]" />
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs Ribbon */}
      <nav className="h-9 px-2 flex items-center gap-1 bg-[#1a1c1f] overflow-x-auto border-b border-[#282a2d]">
        {[
          { id: 'workbench', label: isArabic ? 'بيئة العمل (3D CAD)' : 'CAD Workbench', icon: Box },
          { id: 'geometry-and-sketch', label: isArabic ? 'الرسم الهندسي (2D Sketch)' : '2D Sketcher', icon: Layers },
          { id: 'fea-acceptance', label: isArabic ? 'اختبار FEA (CalculiX)' : 'FEA Test (CalculiX)', icon: Cpu },
          { id: 'mesh-generator', label: isArabic ? 'توليد الشبكة (Gmsh)' : 'Meshing (Gmsh)', icon: Activity },
          { id: 'solver-monitor', label: isArabic ? 'حلّال CFD (OpenFOAM)' : 'CFD Solver (OpenFOAM)', icon: Sparkles },
          { id: 'results-and-reports', label: isArabic ? 'التقارير الهندسية' : 'Reports & Dossier', icon: FileText },
          { id: 'mep-bim', label: isArabic ? 'أنظمة BIM & MEP' : '4M BIM & MEP', icon: Building2 },
          { id: 'system-settings', label: isArabic ? 'الإعدادات والمواد' : 'Materials & Standards', icon: Settings },
        ].map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectView(tab.id as ActiveWorkbenchView)}
              className={`px-2.5 py-1 text-[11px] font-mono flex items-center gap-1.5 whitespace-nowrap transition-all rounded-sm cursor-pointer ${
                isActive
                  ? 'bg-[#282a2d] text-[#00daf3] font-bold shadow-inner border-b-2 border-[#00daf3]'
                  : 'text-[#c0c6d6] hover:text-white hover:bg-[#1e2023]'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00daf3]' : 'text-[#8a919f]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
