import React, { useState } from 'react';
import {
  Layers,
  Box,
  Eye,
  Check,
  ChevronDown,
  ChevronRight,
  Maximize2,
  RefreshCw,
  Send,
  Zap,
  Play,
  RotateCcw,
  Sliders,
  Shield,
  Activity,
  Terminal,
  TrendingUp,
  Award
} from 'lucide-react';

interface WorkbenchViewProps {
  onCommitStudy?: () => void;
  onOpenMesh?: () => void;
  onOpenSolver?: () => void;
  onOpenCopilot?: () => void;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({
  onCommitStudy,
  onOpenMesh,
  onOpenSolver,
  onOpenCopilot,
}) => {
  const [leftTab, setLeftTab] = useState<'tree' | 'selections' | 'materials'>('tree');
  const [bottomTab, setBottomTab] = useState<'terminal' | 'residuals' | 'mesh' | 'events'>('terminal');

  const [physicsOpen, setPhysicsOpen] = useState(true);
  const [boundaryOpen, setBoundaryOpen] = useState(true);
  const [meshOpen, setMeshOpen] = useState(true);

  // Inspector inputs
  const [inletVelX, setInletVelX] = useState('45.0');
  const [inletVelY, setInletVelY] = useState('0.0');
  const [inletVelZ, setInletVelZ] = useState('0.0');
  const [turbK, setTurbK] = useState('0.24');
  const [turbOmega, setTurbOmega] = useState('120.0');

  // Shading mode & selection filter
  const [shadingMode, setShadingMode] = useState<'smooth' | 'flat' | 'wire' | 'xray'>('smooth');
  const [selectionTarget, setSelectionTarget] = useState<'body' | 'face' | 'edge' | 'vertex'>('face');

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none">
      {/* Secondary Context & Engine Ribbon */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 font-mono text-[11px]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Box className="w-3.5 h-3.5 text-[#a8c8ff]" />
            <span className="text-[#e2e2e6] font-medium truncate">Aero_Foil_Transonic_Study_01.step</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#c0c6d6] rounded">AP242</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#8a919f]">
            <span>ENGINES:</span>
            <span className="flex items-center gap-1 bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d] text-[#00daf3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse" />
              OpenCASCADE 7.7
            </span>
            <span className="flex items-center gap-1 bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d] text-[#e2e2e6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8a919f]" />
              Gmsh 4.11
            </span>
            <span className="flex items-center gap-1 bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d] text-[#a8c8ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3491ff]" />
              OpenFOAM v2312 (Idle)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#333538] p-0.5 rounded">
            <button className="px-2 py-0.5 bg-[#a8c8ff] text-[#003061] text-[10px] font-bold rounded-sm shadow-sm">
              Advanced Engineer Mode
            </button>
            <button className="px-2 py-0.5 text-[#c0c6d6] hover:text-white text-[10px] transition-colors">
              Beginner Mode
            </button>
          </div>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#a8c8ff] rounded border border-[#282a2d] text-[10px] transition-colors cursor-pointer"
          >
            <Zap className="w-3 h-3 text-[#00daf3]" />
            <span>AI Copilot</span>
            <span className="text-[8px] bg-[#282a2d] px-1 rounded text-[#8a919f]">Phase 11</span>
          </button>
        </div>
      </div>

      {/* Multi-Pane Workbench Core */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sub-Dock (Model Tree, Persistent Selections, Materials) */}
        <section className="w-[300px] flex flex-col bg-[#1a1c1f] border-r border-[#282a2d] shadow-md shrink-0">
          {/* Panel Tabs */}
          <div className="flex items-center bg-[#111316] h-7 px-1.5 gap-1 border-b border-[#282a2d] font-mono text-[10px]">
            <button
              onClick={() => setLeftTab('tree')}
              className={`px-2 py-1 font-semibold flex items-center gap-1 rounded-t transition-colors cursor-pointer ${
                leftTab === 'tree' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>MODEL TREE</span>
            </button>
            <button
              onClick={() => setLeftTab('selections')}
              className={`px-2 py-1 flex items-center gap-1 rounded-t transition-colors cursor-pointer ${
                leftTab === 'selections' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>NAMED (4)</span>
            </button>
            <button
              onClick={() => setLeftTab('materials')}
              className={`px-2 py-1 flex items-center gap-1 rounded-t transition-colors cursor-pointer ${
                leftTab === 'materials' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Award className="w-3 h-3" />
              <span>MATERIALS</span>
            </button>
          </div>

          {/* Tree View Container */}
          {leftTab === 'tree' && (
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-[#8a919f] text-[9px] px-1 py-0.5 uppercase tracking-wider">
                <span>Study Topology Structure</span>
                <span className="text-[#a8c8ff]">1.25 MB</span>
              </div>

              {/* Root Node */}
              <div className="bg-[#282a2d] p-1.5 rounded-sm border border-[#404754]/40">
                <div className="flex items-center gap-1.5 text-white font-semibold text-[11px]">
                  <ChevronDown className="w-3.5 h-3.5 text-[#a8c8ff]" />
                  <Box className="w-3.5 h-3.5 text-[#00daf3]" />
                  <span className="truncate">Aero_Foil_Transonic_Study</span>
                  <span className="text-[9px] px-1 bg-[#111316] text-[#00daf3] ml-auto rounded border border-[#00daf3]/30">
                    Solid Body [1]
                  </span>
                </div>

                {/* Children Elements */}
                <div className="mt-1.5 pl-3 flex flex-col gap-1 border-l border-[#404754]/50 ml-2">
                  <div className="flex items-center justify-between p-1 bg-[#1e2023] rounded-sm hover:bg-[#37393d] cursor-pointer">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3]" />
                      <span className="truncate text-white text-[10px]">2D Sketch 1 (XY Plane)</span>
                    </div>
                    <span className="text-[8px] text-[#00daf3] px-1 bg-[#111316] rounded">FULLY CONSTRAINED</span>
                  </div>

                  <div className="flex items-center justify-between p-1 bg-[#1e2023] rounded-sm hover:bg-[#37393d] cursor-pointer">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8a919f]" />
                      <span className="truncate text-white text-[10px]">Extrude 1</span>
                    </div>
                    <span className="text-[9px] text-[#c0c6d6]">120.0 mm</span>
                  </div>

                  <div className="flex items-center justify-between p-1 bg-[#1e2023] rounded-sm hover:bg-[#37393d] cursor-pointer">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ffb68b]" />
                      <span className="truncate text-white text-[10px]">Chamfer 1 (Trailing edge)</span>
                    </div>
                    <span className="text-[9px] text-[#ffb68b]">0.5 mm</span>
                  </div>
                </div>
              </div>

              {/* Named Selections Card in Tree View */}
              <div className="mt-2 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[#8a919f] text-[9px] px-1 uppercase tracking-wider">
                  <span>Persistent Selections</span>
                  <span className="text-[#00daf3]">4 BOUNDARIES</span>
                </div>

                {/* Boundary 1: Inlet */}
                <div className="p-1.5 bg-[#1e2023] rounded-sm border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#3491ff]" />
                      <span className="font-semibold text-[#a8c8ff] text-[11px]">Inlet</span>
                      <span className="text-[9px] text-[#8a919f]">Face #104</span>
                    </div>
                    <span className="text-[9px] bg-[#111316] px-1 rounded text-[#a8c8ff]">Velocity Inlet</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#c0c6d6]">
                    <span className="text-[#8a919f]">UUID: f_inlet_01</span>
                    <span className="text-[#00daf3] font-bold">45.0 m/s</span>
                  </div>
                </div>

                {/* Boundary 2: Outlet */}
                <div className="p-1.5 bg-[#1e2023] rounded-sm border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#00daf3]" />
                      <span className="font-semibold text-[#00daf3] text-[11px]">Outlet</span>
                      <span className="text-[9px] text-[#8a919f]">Face #108</span>
                    </div>
                    <span className="text-[9px] bg-[#111316] px-1 rounded text-[#00daf3]">Pressure Outlet</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#c0c6d6]">
                    <span className="text-[#8a919f]">UUID: f_outlet_01</span>
                    <span className="font-mono">P = 101325 Pa</span>
                  </div>
                </div>

                {/* Boundary 3: Airfoil Wall */}
                <div className="p-1.5 bg-[#1e2023] rounded-sm border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#ffb68b]" />
                      <span className="font-semibold text-[#ffb68b] text-[11px]">Airfoil_Wall</span>
                      <span className="text-[9px] text-[#8a919f]">#101, #102</span>
                    </div>
                    <span className="text-[9px] bg-[#111316] px-1 rounded text-[#ffb68b]">No-slip Wall</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#c0c6d6]">
                    <span className="text-[#8a919f]">UUID: f_wall_aerofoil</span>
                    <span className="text-[#ffb68b]">Viscous: k-ω SST</span>
                  </div>
                </div>

                {/* Boundary 4: Symmetry */}
                <div className="p-1.5 bg-[#1e2023] rounded-sm border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-[#8a919f]" />
                      <span className="font-semibold text-white text-[11px]">Symm_Top_Bottom</span>
                      <span className="text-[9px] text-[#8a919f]">#105, #106</span>
                    </div>
                    <span className="text-[9px] bg-[#111316] px-1 rounded text-[#8a919f]">Symmetry</span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#c0c6d6]">
                    <span>Zero Gradient Normal</span>
                    <Check className="w-3 h-3 text-[#00daf3]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {leftTab === 'selections' && (
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 font-mono text-[11px]">
              <div className="p-2 bg-[#1e2023] rounded-sm border border-[#282a2d]">
                <span className="text-[#00daf3] font-bold block mb-1">Persistent Geometric IDs</span>
                <p className="text-[#8a919f] text-[10px] leading-relaxed">
                  OpenCASCADE topology hash locks all boundary faces against parametric shape recalculations and topology rebuilds.
                </p>
              </div>
            </div>
          )}

          {leftTab === 'materials' && (
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 font-mono text-[11px]">
              <div className="p-2 bg-[#1e2023] rounded-sm border border-[#282a2d]">
                <div className="flex items-center justify-between font-semibold text-[#a8c8ff]">
                  <span>Air (Standard Atmosphere 20°C)</span>
                  <span className="text-[9px] px-1.5 bg-[#111316] rounded border border-[#a8c8ff]/30">Fluid</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] text-[#8a919f]">
                  <div>Density: <span className="text-white font-mono">1.225 kg/m³</span></div>
                  <div>Viscosity: <span className="text-white font-mono">1.789e-5 Pa·s</span></div>
                  <div>Specific Heat: <span className="text-white font-mono">1005 J/kg·K</span></div>
                  <div>Prandtl (Pr): <span className="text-white font-mono">0.71</span></div>
                </div>
              </div>
            </div>
          )}

          {/* Panel Status Bar */}
          <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-t border-[#282a2d] text-[#8a919f] font-mono text-[10px]">
            <span>OCC Primitives: 1 Solid, 6 Faces</span>
            <span className="text-[#00daf3] font-semibold">VALIDATED</span>
          </div>
        </section>

        {/* Center Scientific 3D / CAE Canvas */}
        <main className="flex-1 flex flex-col relative bg-[#0c0e11] overflow-hidden">
          {/* Phase Notice Banner */}
          <div className="absolute top-2.5 left-3 right-3 z-30 flex items-center justify-between bg-[#282a2d]/90 backdrop-blur-md px-3 py-1.5 rounded shadow-lg border border-[#404754]/40 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-pulse" />
              <span className="text-white font-medium text-[11px]">
                Phase 1 Testing Viewport — Synthetic Preview Model Active. Real OpenCASCADE geometry pipeline activates in Phase 2.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <span className="text-[#00daf3]">GL_RENDERER: WebGL2 Canvas</span>
              <span className="px-1.5 py-0.5 bg-[#111316] text-[#a8c8ff] rounded border border-[#282a2d]">FPS: 60.0</span>
            </div>
          </div>

          {/* Floating Viewport HUD Toolbar */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 flex items-center bg-[#1e2023]/90 backdrop-blur-md p-1 rounded shadow-xl gap-1.5 border border-[#282a2d]">
            {/* Selection Target Filters */}
            <div className="flex items-center bg-[#111316] p-0.5 rounded-sm border border-[#282a2d]">
              {(['body', 'face', 'edge', 'vertex'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectionTarget(mode)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase transition-colors cursor-pointer rounded-sm ${
                    selectionTarget === mode ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f] hover:text-white'
                  }`}
                  title={`Select ${mode}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-4 bg-[#404754]" />

            {/* Shading Mode */}
            <div className="flex items-center bg-[#111316] p-0.5 rounded-sm border border-[#282a2d]">
              {(['smooth', 'flat', 'wire', 'xray'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setShadingMode(mode)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase transition-colors cursor-pointer rounded-sm ${
                    shadingMode === mode ? 'bg-[#282a2d] text-[#00daf3] font-bold' : 'text-[#8a919f] hover:text-white'
                  }`}
                  title={`${mode} Shading`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="w-[1px] h-4 bg-[#404754]" />

            {/* CAE Analytical Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenMesh}
                className="px-2 py-0.5 bg-[#282a2d] hover:bg-[#333538] text-[#a8c8ff] rounded text-[10px] font-mono cursor-pointer flex items-center gap-1"
                title="Open Mesh Generator"
              >
                <span>Mesh</span>
              </button>
              <button
                onClick={onOpenSolver}
                className="px-2 py-0.5 bg-[#282a2d] hover:bg-[#333538] text-[#00daf3] rounded text-[10px] font-mono cursor-pointer flex items-center gap-1"
                title="Launch Solver"
              >
                <span>Solve</span>
              </button>
            </div>
          </div>

          {/* Interactive SVG Viewport Canvas */}
          <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden cursor-crosshair">
            {/* Scientific Grid Pattern */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="workbench-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2023" strokeWidth="0.75" />
                </pattern>
                <radialGradient id="cae-glow-wb" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3491ff" stopOpacity="0.15" />
                  <stop offset="70%" stopColor="#00daf3" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#0c0e11" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#workbench-grid)" />
              <rect width="100%" height="100%" fill="url(#cae-glow-wb)" />
              <line x1="10%" y1="52%" x2="90%" y2="52%" stroke="#333538" strokeDasharray="3 3" />
              <line x1="50%" y1="15%" x2="50%" y2="85%" stroke="#333538" strokeDasharray="3 3" />
            </svg>

            {/* 3D NACA 0012 Airfoil CAD Representation */}
            <div className="relative w-[560px] h-[360px] flex items-center justify-center">
              <svg className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]" viewBox="0 0 600 360">
                <defs>
                  <linearGradient id="airfoil-skin-wb" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#1e2023" />
                    <stop offset="35%" stopColor="#282a2d" />
                    <stop offset="70%" stopColor="#1e2023" />
                    <stop offset="100%" stopColor="#0c0e11" />
                  </linearGradient>
                </defs>

                {/* Extruded Depth Shadow */}
                <path
                  d="M 120 180 C 180 80, 360 100, 520 150 L 460 210 C 310 160, 150 140, 100 220 Z"
                  fill="#14171a"
                  opacity="0.6"
                />

                {/* NACA 0012 Camber Surface */}
                <path
                  d="M 80 190 C 140 100, 320 115, 480 165 C 500 171, 510 174, 515 176 L 475 220 C 340 190, 180 230, 80 190 Z"
                  fill="url(#airfoil-skin-wb)"
                  stroke="#404754"
                  strokeWidth="1.5"
                />

                {/* Computational Mesh Isolines */}
                <path d="M 110 175 C 160 115, 300 128, 440 172" fill="none" stroke="#3491ff" strokeDasharray="2 2" strokeOpacity="0.5" />
                <path d="M 140 165 C 190 125, 310 138, 410 180" fill="none" stroke="#3491ff" strokeDasharray="2 2" strokeOpacity="0.5" />
                <path d="M 90 200 C 180 205, 330 185, 475 220" fill="none" stroke="#00daf3" strokeOpacity="0.4" />

                {/* Spanwise Structured Grid */}
                <line x1="160" y1="135" x2="140" y2="198" stroke="#a8c8ff" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="220" y1="130" x2="205" y2="192" stroke="#a8c8ff" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="280" y1="132" x2="270" y2="188" stroke="#a8c8ff" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="340" y1="140" x2="335" y2="182" stroke="#a8c8ff" strokeOpacity="0.4" strokeWidth="1" />
                <line x1="400" y1="150" x2="395" y2="180" stroke="#a8c8ff" strokeOpacity="0.4" strokeWidth="1" />

                {/* Inlet Vectors */}
                <g opacity="0.9">
                  <line x1="30" y1="160" x2="70" y2="175" stroke="#00daf3" strokeWidth="2" />
                  <polygon points="70,172 78,175 70,178" fill="#00daf3" />
                  <line x1="30" y1="190" x2="70" y2="190" stroke="#00daf3" strokeWidth="2" />
                  <polygon points="70,187 78,190 70,193" fill="#00daf3" />
                  <line x1="30" y1="220" x2="70" y2="205" stroke="#00daf3" strokeWidth="2" />
                  <polygon points="70,202 78,205 70,208" fill="#00daf3" />
                  <text x="25" y="145" fill="#00daf3" fontFamily="JetBrains Mono" fontSize="10" letterSpacing="0.5">
                    U_inlet = {inletVelX} m/s
                  </text>
                </g>

                {/* Trailing Edge Wake */}
                <g fill="none" stroke="#ffb68b" strokeDasharray="1 3" strokeOpacity="0.6">
                  <path d="M 515 176 C 540 178, 570 170, 590 165" />
                  <path d="M 515 176 C 540 182, 570 188, 590 195" />
                </g>

                {/* Chord markers */}
                <circle cx="80" cy="190" r="3" fill="#3491ff" />
                <text x="88" y="193" fill="#a8c8ff" fontFamily="JetBrains Mono" fontSize="9">LE (Chord 0.0%)</text>
                <circle cx="515" cy="176" r="3" fill="#ffb68b" />
                <text x="475" y="160" fill="#ffb68b" fontFamily="JetBrains Mono" fontSize="9">TE (Chord 100%)</text>
              </svg>

              {/* Direct Probe Tag Overlay */}
              <div className="absolute top-10 left-20 bg-[#1e2023]/90 backdrop-blur-sm px-2 py-1 rounded shadow-md border border-[#282a2d] pointer-events-none font-mono text-[10px] text-[#a8c8ff]">
                Face #101: Cp = -1.342
              </div>
            </div>

            {/* Top-Right 3D ViewCube & Triad */}
            <div className="absolute top-4 right-4 z-30 flex flex-col items-center gap-2">
              {/* 3D Isometric ViewCube */}
              <div className="w-16 h-16 relative bg-[#1e2023] shadow-2xl rounded border border-[#282a2d] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 p-1 gap-1 font-mono text-[9px] font-bold">
                  <button className="bg-[#282a2d] text-[#c0c6d6] hover:bg-[#3491ff] hover:text-white flex items-center justify-center">
                    TOP
                  </button>
                  <button className="bg-[#282a2d] text-[#c0c6d6] hover:bg-[#3491ff] hover:text-white flex items-center justify-center">
                    FRT
                  </button>
                  <button className="bg-[#282a2d] text-[#c0c6d6] hover:bg-[#3491ff] hover:text-white flex items-center justify-center">
                    RGT
                  </button>
                  <button className="bg-[#3491ff]/20 text-[#a8c8ff] hover:bg-[#3491ff] hover:text-white flex items-center justify-center">
                    ISO
                  </button>
                </div>
              </div>

              {/* Coordinate Triad */}
              <div className="w-16 h-16 relative flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="2.5" fill="#e2e2e6" />
                  <line x1="30" y1="30" x2="52" y2="30" stroke="#ff8b8b" strokeWidth="2" />
                  <text x="50" y="24" fill="#ff8b8b" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">X</text>
                  <line x1="30" y1="30" x2="30" y2="8" stroke="#8bff9b" strokeWidth="2" />
                  <text x="34" y="12" fill="#8bff9b" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">Y</text>
                  <line x1="30" y1="30" x2="14" y2="44" stroke="#a8c8ff" strokeWidth="2" />
                  <text x="8" y="52" fill="#a8c8ff" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold">Z</text>
                </svg>
              </div>
            </div>

            {/* Bottom Floating Status Pill in Canvas */}
            <div className="absolute bottom-2.5 left-3 flex items-center gap-3 font-mono text-[10px] bg-[#282a2d]/80 backdrop-blur-sm px-2.5 py-1 rounded border border-[#404754]/40">
              <span className="text-[#c0c6d6]">Scale: 1:1</span>
              <span className="text-[#8a919f]">|</span>
              <span className="text-[#c0c6d6]">Units: mm / SI</span>
              <span className="text-[#8a919f]">|</span>
              <span className="text-[#00daf3]">BBox: [0.0, 1000.0, 120.0]</span>
            </div>
          </div>
        </main>

        {/* Right Sub-Dock (Simulation Setup & Inspector) */}
        <aside className="w-[340px] flex flex-col bg-[#1a1c1f] border-l border-[#282a2d] shadow-md shrink-0 select-none">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d]">
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase text-[#a8c8ff]">
              <Sliders className="w-3.5 h-3.5 text-[#a8c8ff]" />
              <span>Simulation Setup & Inspector</span>
            </div>
            <Maximize2 className="w-3 h-3 text-[#8a919f] cursor-pointer hover:text-white" />
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 font-mono text-[11px]">
            {/* Section 1: Physics Setup */}
            <div className="bg-[#1e2023] rounded-sm border border-[#282a2d] overflow-hidden">
              <button
                onClick={() => setPhysicsOpen(!physicsOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#282a2d] hover:bg-[#37393d] transition-colors cursor-pointer"
              >
                <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                  <Activity className="w-3 h-3 text-[#00daf3]" />
                  Physics Model (CFD / RANS)
                </span>
                {physicsOpen ? <ChevronDown className="w-3 h-3 text-[#8a919f]" /> : <ChevronRight className="w-3 h-3 text-[#8a919f]" />}
              </button>

              {physicsOpen && (
                <div className="p-2 flex flex-col gap-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Flow Regime:</span>
                    <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                      Incompressible Flow
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Turbulence Model:</span>
                    <span className="text-[#00daf3] font-bold bg-[#111316] px-1.5 py-0.5 rounded border border-[#00daf3]/30">
                      k-omega SST
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                      <span className="text-[9px] text-[#8a919f] block">MACH NUMBER</span>
                      <span className="text-white text-[12px] font-bold">0.15</span>
                    </div>
                    <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                      <span className="text-[9px] text-[#8a919f] block">REYNOLDS (Re)</span>
                      <span className="text-white text-[12px] font-bold">3.2 × 10⁶</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Boundary Inspector */}
            <div className="bg-[#1e2023] rounded-sm border border-[#282a2d] overflow-hidden">
              <button
                onClick={() => setBoundaryOpen(!boundaryOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#282a2d] hover:bg-[#37393d] transition-colors cursor-pointer"
              >
                <span className="font-semibold text-[#a8c8ff] flex items-center gap-1.5 text-[11px]">
                  <Send className="w-3 h-3 text-[#a8c8ff]" />
                  Boundary Inspector: Inlet
                </span>
                {boundaryOpen ? <ChevronDown className="w-3 h-3 text-[#8a919f]" /> : <ChevronRight className="w-3 h-3 text-[#8a919f]" />}
              </button>

              {boundaryOpen && (
                <div className="p-2 flex flex-col gap-2 text-[10px]">
                  <div className="flex items-center justify-between text-[9px] text-[#8a919f] bg-[#111316] px-2 py-1 rounded border border-[#282a2d]">
                    <span>ASSIGNED FACE: #104</span>
                    <span className="text-[#a8c8ff]">ID: f_inlet_01</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] text-[#8a919f]">
                      <span>Velocity U Vector (m/s)</span>
                      <span className="text-[#00daf3]">Cartesian [x, y, z]</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="flex items-center bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                        <span className="text-[#8a919f] text-[9px] mr-1">x:</span>
                        <input
                          type="text"
                          value={inletVelX}
                          onChange={(e) => setInletVelX(e.target.value)}
                          className="bg-transparent text-white w-full focus:outline-none font-mono text-[10px]"
                        />
                      </div>
                      <div className="flex items-center bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                        <span className="text-[#8a919f] text-[9px] mr-1">y:</span>
                        <input
                          type="text"
                          value={inletVelY}
                          onChange={(e) => setInletVelY(e.target.value)}
                          className="bg-transparent text-white w-full focus:outline-none font-mono text-[10px]"
                        />
                      </div>
                      <div className="flex items-center bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                        <span className="text-[#8a919f] text-[9px] mr-1">z:</span>
                        <input
                          type="text"
                          value={inletVelZ}
                          onChange={(e) => setInletVelZ(e.target.value)}
                          className="bg-transparent text-white w-full focus:outline-none font-mono text-[10px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Turb. Energy (k):</span>
                    <div className="flex items-center bg-[#111316] px-2 py-0.5 rounded border border-[#282a2d]">
                      <input
                        type="text"
                        value={turbK}
                        onChange={(e) => setTurbK(e.target.value)}
                        className="bg-transparent text-white w-12 focus:outline-none text-[10px]"
                      />
                      <span className="text-[#8a919f] text-[9px]">m²/s²</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Dissipation (ω):</span>
                    <div className="flex items-center bg-[#111316] px-2 py-0.5 rounded border border-[#282a2d]">
                      <input
                        type="text"
                        value={turbOmega}
                        onChange={(e) => setTurbOmega(e.target.value)}
                        className="bg-transparent text-white w-12 focus:outline-none text-[10px]"
                      />
                      <span className="text-[#8a919f] text-[9px]">s⁻¹</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Meshing & Boundary Layers */}
            <div className="bg-[#1e2023] rounded-sm border border-[#282a2d] overflow-hidden">
              <button
                onClick={() => setMeshOpen(!meshOpen)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 bg-[#282a2d] hover:bg-[#37393d] transition-colors cursor-pointer"
              >
                <span className="font-semibold text-white flex items-center gap-1.5 text-[11px]">
                  <Box className="w-3 h-3 text-[#ffb68b]" />
                  Meshing & Boundary Layers
                </span>
                {meshOpen ? <ChevronDown className="w-3 h-3 text-[#8a919f]" /> : <ChevronRight className="w-3 h-3 text-[#8a919f]" />}
              </button>

              {meshOpen && (
                <div className="p-2 flex flex-col gap-1 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">First Layer Height:</span>
                    <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded">0.015 mm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Growth Rate / Layers:</span>
                    <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded">1.20 / 12 layers</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Estimated Cells:</span>
                    <span className="text-[#00daf3] font-semibold bg-[#111316] px-1.5 py-0.5 rounded">~450,000 cells</span>
                  </div>

                  <button
                    onClick={onOpenMesh}
                    className="w-full mt-1 py-1 bg-[#333538] hover:bg-[#3491ff] hover:text-white transition-colors text-white font-semibold text-[10px] rounded flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3" />
                    <span>Generate Gmsh Surface Mesh</span>
                  </button>
                </div>
              )}
            </div>

            {/* Section 4: Contact Pairs & Solvers notice */}
            <div className="bg-[#1e2023] rounded-sm p-2 border border-[#282a2d] flex flex-col gap-1">
              <span className="text-[#ffb68b] font-semibold text-[10px] flex items-center gap-1">
                <span>Contacts Status [Notice]</span>
              </span>
              <p className="text-[#8a919f] text-[9px] leading-relaxed">
                [FIX #9] Frictional Contacts locked until Nonlinear Static Solver Phase is configured. Multi-body contact pair generation will unlock in Phase 2.
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-2 bg-[#111316] border-t border-[#282a2d] flex gap-1.5 font-mono">
            <button
              onClick={() => {
                onCommitStudy?.();
                onOpenSolver?.();
              }}
              className="flex-1 py-1.5 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Commit Study</span>
            </button>
            <button
              onClick={() => {
                setInletVelX('45.0');
                setInletVelY('0.0');
                setInletVelZ('0.0');
              }}
              className="px-2 py-1.5 bg-[#282a2d] hover:bg-[#37393d] text-white rounded cursor-pointer"
              title="Reset Parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      </div>

      {/* Bottom Docked Console & Execution Tray */}
      <footer className="h-44 flex flex-col bg-[#1a1c1f] border-t border-[#282a2d] shadow-2xl shrink-0 select-none font-mono">
        {/* Tray Tabs */}
        <div className="h-7 bg-[#111316] px-3 flex items-center justify-between border-b border-[#282a2d] text-[10px]">
          <div className="flex items-center gap-1 h-full">
            <button
              onClick={() => setBottomTab('terminal')}
              className={`px-3 h-full font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                bottomTab === 'terminal' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Terminal className="w-3 h-3" />
              <span>SOLVER TERMINAL (LIVE)</span>
            </button>
            <button
              onClick={() => setBottomTab('residuals')}
              className={`px-3 h-full font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                bottomTab === 'residuals' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>CONVERGENCE MONITOR (RESIDUALS)</span>
            </button>
            <button
              onClick={() => setBottomTab('mesh')}
              className={`px-3 h-full font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                bottomTab === 'mesh' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>MESH QUALITY METRICS</span>
            </button>
            <button
              onClick={() => setBottomTab('events')}
              className={`px-3 h-full font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                bottomTab === 'events' ? 'bg-[#1e2023] text-[#a8c8ff] border-t border-[#a8c8ff]' : 'text-[#8a919f] hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>EVENT LOG</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[#8a919f] text-[9px]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3]" />
              <span>Process ID: 8492</span>
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden p-2.5 bg-[#0c0e11] text-[11px]">
          {bottomTab === 'terminal' && (
            <div className="h-full overflow-y-auto flex flex-col gap-0.5 font-mono text-[10px] leading-relaxed text-[#c0c6d6]">
              <div className="text-[#8a919f]">[00:00:01] Initializing OpenFOAM case file structure from geometry definition...</div>
              <div className="text-white">[00:00:02] Loading mesh domain 'Aero_Foil_Transonic_Study.msh' via Gmsh 4.11...</div>
              <div className="text-[#00daf3]">[00:00:03] Boundary tags confirmed: Inlet (104), Outlet (108), Wall (101, 102), Symmetry (105, 106)</div>
              <div className="text-[#a8c8ff]">[00:00:04] Executing simpleFoam steady-state incompressible RANS solver...</div>
              <div className="text-white flex items-center gap-3">
                <span>Iter 120 | Ux: 1.42e-04</span>
                <span>Uy: 9.87e-05</span>
                <span>p: 4.12e-04</span>
                <span>k: 8.91e-05</span>
                <span>omega: 7.22e-05</span>
                <span className="text-[#00daf3] ml-auto">Continuity error: 2.11e-06</span>
              </div>
              <div className="text-[#3491ff] flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 bg-[#3491ff]" />
                <span>[RUNNING] Iteration 121 in progress on 16 MPI ranks...</span>
              </div>
            </div>
          )}

          {bottomTab === 'residuals' && (
            <div className="h-full flex items-center justify-between px-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-white font-bold">Convergence Residual History</span>
                <div className="flex items-center gap-2 text-[9px]">
                  <span className="flex items-center gap-1 text-[#3491ff]"><span className="w-2 h-0.5 bg-[#3491ff]" /> Ux (10⁻⁴)</span>
                  <span className="flex items-center gap-1 text-[#00daf3]"><span className="w-2 h-0.5 bg-[#00daf3]" /> Uy (10⁻⁴)</span>
                  <span className="flex items-center gap-1 text-[#ffb68b]"><span className="w-2 h-0.5 bg-[#ffb68b]" /> p (10⁻⁴)</span>
                  <span className="flex items-center gap-1 text-[#a8c8ff]"><span className="w-2 h-0.5 bg-[#a8c8ff]" /> k/ω (10⁻⁵)</span>
                </div>
                <span className="text-[#8a919f] text-[9px]">Criterion threshold: 1.00e-05</span>
              </div>

              <div className="flex-1 h-20 bg-[#1e2023] rounded p-1 relative border border-[#282a2d]">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#333538" strokeDasharray="2 2" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#333538" strokeDasharray="2 2" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#333538" strokeDasharray="2 2" />
                  <polyline points="0,15 50,28 100,42 160,56 220,68 300,75 400,82 500,88" fill="none" stroke="#3491ff" strokeWidth="1.8" />
                  <polyline points="0,20 60,35 120,48 200,62 310,74 410,80 500,86" fill="none" stroke="#00daf3" strokeWidth="1.8" />
                  <polyline points="0,10 70,30 140,46 220,59 320,65 420,72 500,79" fill="none" stroke="#ffb68b" strokeWidth="1.8" />
                  <polyline points="0,30 80,45 150,55 240,68 350,82 450,91 500,94" fill="none" stroke="#a8c8ff" strokeDasharray="3 2" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          )}

          {bottomTab === 'mesh' && (
            <div className="h-full grid grid-cols-4 gap-2 font-mono text-[10px]">
              <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col justify-between">
                <span className="text-[#8a919f] text-[9px] uppercase">Min Orthogonal Quality</span>
                <span className="text-[16px] text-[#00daf3] font-bold">0.824</span>
                <span className="text-[#00daf3] text-[9px]">EXCELLENT (&gt; 0.15)</span>
              </div>
              <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col justify-between">
                <span className="text-[#8a919f] text-[9px] uppercase">Max Skewness</span>
                <span className="text-[16px] text-[#a8c8ff] font-bold">0.281</span>
                <span className="text-[#a8c8ff] text-[9px]">ACCEPTABLE (&lt; 0.85)</span>
              </div>
              <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col justify-between">
                <span className="text-[#8a919f] text-[9px] uppercase">Max Aspect Ratio</span>
                <span className="text-[16px] text-[#ffb68b] font-bold">18.4</span>
                <span className="text-[#ffb68b] text-[9px]">INFLATION BOUNDARY</span>
              </div>
              <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col justify-between">
                <span className="text-[#8a919f] text-[9px] uppercase">Total Cells</span>
                <span className="text-[16px] text-white font-bold">448,210</span>
                <span className="text-[#8a919f] text-[9px]">Gmsh 4.11 Engine</span>
              </div>
            </div>
          )}

          {bottomTab === 'events' && (
            <div className="h-full overflow-y-auto flex flex-col gap-1 text-[10px] text-[#c0c6d6]">
              <div className="flex items-center gap-2">
                <span className="text-[#8a919f]">[14:02:11.890]</span>
                <span className="text-[#00daf3]">SYS_CAD:</span>
                <span>OpenCASCADE topology validated. 6 faces, 12 edges, 8 vertices.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8a919f]">[14:02:12.102]</span>
                <span className="text-[#a8c8ff]">PERSIST_ID:</span>
                <span>Persistent IDs mapped successfully (4/4 tags synchronized with topology hash).</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8a919f]">[14:02:12.441]</span>
                <span className="text-[#00daf3]">GMSH_INIT:</span>
                <span>Gmsh ready. Mesh generation pipeline queued for Phase 2 synthesis.</span>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
