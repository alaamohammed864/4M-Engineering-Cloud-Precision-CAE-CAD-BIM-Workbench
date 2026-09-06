import React, { useState, useRef, useEffect } from 'react';
import { Terminal, CornerDownLeft } from 'lucide-react';

interface CadCommandLineProps {
  onExecuteCommand?: (cmd: string) => void;
  activeView?: string;
  onNavigateView?: (view: any) => void;
}

interface CommandLog {
  id: string;
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
  timestamp: string;
}

export const CadCommandLine: React.FC<CadCommandLineProps> = ({
  onExecuteCommand,
  activeView,
  onNavigateView
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandLog[]>([
    {
      id: '1',
      text: '4M Engineering Cloud CAD/BIM Command Console Initialized | Lead Developer: Eng. Alaa Mohammed (م. علاء محمد)',
      type: 'system',
      timestamp: '00:00:01'
    },
    {
      id: '2',
      text: 'Current coordinate system: WCS (World Coordinate System) | Units: Metric (mm / m)',
      type: 'output',
      timestamp: '00:00:02'
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCmd = inputVal.trim();
    if (!cleanCmd) return;

    const time = new Date().toLocaleTimeString();
    const newLogs: CommandLog[] = [
      ...history,
      { id: String(Date.now()), text: `Command: ${cleanCmd}`, type: 'input', timestamp: time }
    ];

    const upper = cleanCmd.toUpperCase();
    const args = upper.split(' ');
    const root = args[0];

    // Command interpreter
    if (root === 'HELP') {
      newLogs.push({
        id: String(Date.now() + 1),
        text: 'Available Commands: LINE, RECT, CIRCLE, WALL, DOOR, WINDOW, DUCT, PIPE, CABLE, SPRINKLER, GAS, LIFT, CLASH, BOQ, CALC, SOLVE, EXPORT, DEV, CLEAR',
        type: 'output',
        timestamp: time
      });
    } else if (root === 'DEV' || root === 'DEVELOPER' || root === 'AUTHOR' || root === 'ABOUT') {
      newLogs.push({
        id: String(Date.now() + 1),
        text: '4M Engineering Cloud — Lead Software Architect & Developer: Eng. Alaa Mohammed (م. علاء محمد)',
        type: 'output',
        timestamp: time
      });
    } else if (root === 'CLEAR') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (root === 'WALL' || root === 'DOOR' || root === 'WINDOW' || root === 'ROOM') {
      if (onNavigateView) onNavigateView('mep-bim');
      newLogs.push({
        id: String(Date.now() + 1),
        text: `Command [${root}] executed: Opening Architectural BIM Workspace & level editor.`,
        type: 'output',
        timestamp: time
      });
    } else if (root === 'DUCT' || root === 'PIPE' || root === 'CABLE' || root === 'SPRINKLER' || root === 'GAS' || root === 'LIFT') {
      if (onNavigateView) onNavigateView('mep-bim');
      newLogs.push({
        id: String(Date.now() + 1),
        text: `Command [${root}] executed: Switched to 4M MEP Engineering module.`,
        type: 'output',
        timestamp: time
      });
    } else if (root === 'BOQ') {
      if (onNavigateView) onNavigateView('mep-bim');
      newLogs.push({
        id: String(Date.now() + 1),
        text: 'Command [BOQ]: Generating automated Bill of Quantities & cost breakdown.',
        type: 'output',
        timestamp: time
      });
    } else if (root === 'CLASH') {
      if (onNavigateView) onNavigateView('mep-bim');
      newLogs.push({
        id: String(Date.now() + 1),
        text: 'Command [CLASH]: Launching multidisciplinary BIM clash detection solver.',
        type: 'output',
        timestamp: time
      });
    } else if (root === 'SOLVE' || root === 'FEA' || root === 'CALC') {
      if (onNavigateView) onNavigateView('fea-acceptance');
      newLogs.push({
        id: String(Date.now() + 1),
        text: 'Command [SOLVE]: Initializing FEA Structural & Stress Analysis engine.',
        type: 'output',
        timestamp: time
      });
    } else if (root === 'EXPORT') {
      newLogs.push({
        id: String(Date.now() + 1),
        text: 'Command [EXPORT]: Compiling DXF / IFC / PDF engineering package.',
        type: 'output',
        timestamp: time
      });
    } else {
      newLogs.push({
        id: String(Date.now() + 1),
        text: `Command "${cleanCmd}" recognized. Executing geometry / tool routine.`,
        type: 'output',
        timestamp: time
      });
    }

    if (onExecuteCommand) {
      onExecuteCommand(cleanCmd);
    }

    setHistory(newLogs);
    setInputVal('');
  };

  return (
    <div className="bg-[#111316] border-t border-[#282a2d] font-mono text-[11px] select-none shrink-0 z-20">
      {/* Expandable History Drawer */}
      {isExpanded && (
        <div className="h-32 overflow-y-auto p-2 bg-[#0c0e11] border-b border-[#282a2d] flex flex-col gap-1 text-[10px]">
          {history.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 ${
                log.type === 'input'
                  ? 'text-white font-bold'
                  : log.type === 'system'
                  ? 'text-[#00daf3]'
                  : log.type === 'error'
                  ? 'text-[#ff8b8b]'
                  : 'text-[#8a919f]'
              }`}
            >
              <span className="text-[#43464d] text-[9px]">[{log.timestamp}]</span>
              <span>{log.text}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {/* Main Command Input Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#16181b]">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <div className="flex items-center gap-1 text-[#00daf3] font-bold text-[10px]">
            <Terminal className="w-3.5 h-3.5 text-[#00daf3]" />
            <span>COMMAND:</span>
          </div>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder='Type CAD/BIM command (e.g. WALL, DUCT, PIPE, CLASH, BOQ, SOLVE, HELP) and press Enter...'
            className="flex-1 bg-transparent text-white focus:outline-none placeholder:text-[#525866] text-[11px] font-mono"
          />

          <button
            type="submit"
            className="px-2 py-0.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#00daf3] rounded border border-[#282a2d] flex items-center gap-1 text-[10px] cursor-pointer"
          >
            <span>Run</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </form>

        <div className="flex items-center gap-3 text-[10px] text-[#8a919f] ml-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#00daf3] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>{isExpanded ? 'Hide History' : 'History Log'}</span>
          </button>
          <span className="hidden sm:inline text-[#282a2d]">|</span>
          <span className="hidden sm:inline">SNAP: ON</span>
          <span className="hidden sm:inline">ORTHO: ON</span>
          <span className="hidden sm:inline text-[#00daf3]">GRID: 1000mm</span>
        </div>
      </div>
    </div>
  );
};
