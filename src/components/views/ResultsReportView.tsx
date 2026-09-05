import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  Activity,
  Layers,
  Sliders,
  TrendingUp,
  BarChart,
  Eye,
  Maximize2,
  Printer,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';

interface ResultsReportViewProps {
  onOpenCopilot?: () => void;
}

export const ResultsReportView: React.FC<ResultsReportViewProps> = ({ onOpenCopilot }) => {
  const [activeField, setActiveField] = useState<'pressure' | 'velocity' | 'vorticity' | 'yplus'>('pressure');
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [showVortices, setShowVortices] = useState<boolean>(true);
  const [showCpPlot, setShowCpPlot] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  const handleGenerateReport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setReportGenerated(true);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Context Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Activity className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">AERO_STUDY_001_POST [ParaView / VTK WebGL Engine]</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#00daf3] rounded">CONVERGED</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#8a919f]">
            <span>Active Scalar:</span>
            <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d]">
              {[
                { id: 'pressure', label: 'Pressure (p, Cp)' },
                { id: 'velocity', label: 'Velocity (|U|)' },
                { id: 'vorticity', label: 'Q-Criterion' },
                { id: 'yplus', label: 'Wall Y+' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveField(f.id as any)}
                  className={`px-2 py-0.5 text-[9px] rounded transition-colors cursor-pointer ${
                    activeField === f.id ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white text-[10px] font-bold rounded shadow transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Compiling Dossier...' : 'Generate PDF Dossier'}</span>
          </button>

          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1 px-2 py-0.5 bg-[#1e2023] text-[#a8c8ff] rounded border border-[#282a2d] text-[10px]"
          >
            <Zap className="w-3 h-3 text-[#00daf3]" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Multi-Pane Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sub-Dock (Post-Processing Objects & Boundary Layer Quantities) */}
        <section className="w-[300px] flex flex-col bg-[#1a1c1f] border-r border-[#282a2d] shadow-md shrink-0">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Post-Processing Pipeline</span>
            <span className="text-[#00daf3]">ParaView VTK</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-[11px]">
            {/* Visual Filters */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Field Overlays</span>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white">Streamlines (Inlet Seeding)</span>
                <input
                  type="checkbox"
                  checked={showStreamlines}
                  onChange={(e) => setShowStreamlines(e.target.checked)}
                  className="accent-[#00daf3]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white">Vortex Core Iso-Surfaces</span>
                <input
                  type="checkbox"
                  checked={showVortices}
                  onChange={(e) => setShowVortices(e.target.checked)}
                  className="accent-[#00daf3]"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white">Chordwise Cp Plot</span>
                <input
                  type="checkbox"
                  checked={showCpPlot}
                  onChange={(e) => setShowCpPlot(e.target.checked)}
                  className="accent-[#00daf3]"
                />
              </label>
            </div>

            {/* Aerodynamic Global Metrics */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Aerodynamic Integrated Coefficients</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">LIFT (Cl)</span>
                  <span className="text-[14px] text-[#00daf3] font-bold">0.5842</span>
                </div>
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">DRAG (Cd)</span>
                  <span className="text-[14px] text-[#ffb68b] font-bold">0.0248</span>
                </div>
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">PRESSURE DRAG (Cdp)</span>
                  <span className="text-[12px] text-white font-bold">0.0142</span>
                </div>
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">FRICTION DRAG (Cdf)</span>
                  <span className="text-[12px] text-white font-bold">0.0106</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                <span className="text-[#c0c6d6]">Efficiency (L/D):</span>
                <span className="text-[#00daf3] font-bold text-[13px]">23.55</span>
              </div>
            </div>

            {/* Boundary Layer Quantities */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Boundary Layer Analysis (x/c = 0.50)</span>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Displacement Thick. (δ*):</span>
                <span className="text-white">1.42 mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Momentum Thick. (θ):</span>
                <span className="text-white">0.88 mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Shape Factor (H = δ*/θ):</span>
                <span className="text-[#34c759] font-bold">1.61 (Attached)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Laminar-Turbulent Trans:</span>
                <span className="text-[#00daf3]">12.4% Chord</span>
              </div>
            </div>
          </div>

          <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-t border-[#282a2d] text-[#8a919f] text-[10px]">
            <span>Validation: Wind Tunnel Benchmark</span>
            <span className="text-[#34c759] font-bold">Δ 0.8% ERROR</span>
          </div>
        </section>

        {/* Center: 3D Scientific Flow Visualization Field */}
        <main className="flex-1 relative bg-[#0c0e11] flex flex-col overflow-hidden">
          {/* Top Field Badge */}
          <div className="absolute top-2.5 left-3 z-30 bg-[#1e2023]/90 backdrop-blur-md px-3 py-1 rounded shadow border border-[#282a2d] text-[11px] flex items-center gap-3">
            <span className="text-white font-bold">FIELD: Pressure Coefficient (Cp) Surface Map</span>
            <span className="text-[#8a919f]">|</span>
            <span className="text-[#00daf3]">Mach: 0.15 | Re: 3.2M | AoA: 4.0°</span>
          </div>

          {/* Canvas SVG */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full max-w-[800px] max-h-[500px]" viewBox="0 0 800 500">
              <defs>
                <linearGradient id="wing-cp-gradient" x1="10%" y1="20%" x2="90%" y2="80%">
                  <stop offset="0%" stopColor="#ffb68b" stopOpacity="0.9" />
                  <stop offset="25%" stopColor="#00daf3" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#3491ff" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#003061" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="streamline-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00daf3" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#00daf3" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3491ff" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* 3D Isometric Wing Solid with High-Resolution Pressure Contours */}
              {/* Lower Surface Shadow */}
              <path
                d="M 120 270 C 180 180, 420 190, 640 240 L 580 320 C 380 280, 200 320, 100 350 Z"
                fill="#111316"
                opacity="0.8"
              />

              {/* Suction Upper Surface */}
              <path
                d="M 100 280 C 160 140, 420 155, 640 230 C 660 238, 680 244, 690 248 L 610 320 C 440 280, 220 340, 100 280 Z"
                fill="url(#wing-cp-gradient)"
                stroke="#a8c8ff"
                strokeWidth="1.5"
              />

              {/* Pressure Iso-Contour Lines on Surface */}
              <path d="M 140 240 C 180 170, 360 180, 560 240" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M 190 220 C 240 185, 380 195, 520 250" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />
              <path d="M 260 215 C 310 195, 410 205, 480 260" fill="none" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.4" />

              {/* 3D Velocity Streamlines */}
              {showStreamlines && (
                <g stroke="url(#streamline-glow)" strokeWidth="1.5" fill="none">
                  <path d="M 40 220 C 110 200, 180 120, 350 135 C 500 150, 620 210, 750 220" />
                  <path d="M 40 250 C 110 240, 190 145, 360 155 C 510 170, 640 225, 750 240" />
                  <path d="M 40 280 C 90 280, 160 210, 320 200 C 480 200, 640 240, 750 260" />
                  <path d="M 40 310 C 110 320, 220 350, 400 320 C 550 300, 660 280, 750 280" />
                </g>
              )}

              {/* Vortex Cores Behind Wing Tip */}
              {showVortices && (
                <g stroke="#00daf3" strokeWidth="1.2" fill="none" strokeDasharray="3 2" opacity="0.8">
                  <path d="M 690 248 C 720 240, 740 255, 770 245 C 790 238, 800 242, 810 240" />
                  <ellipse cx="730" cy="245" rx="6" ry="12" stroke="#ffb68b" />
                  <ellipse cx="760" cy="248" rx="8" ry="16" stroke="#ffb68b" />
                  <text x="690" y="270" fill="#ffb68b" fontSize="9">Tip Vortex Core (Q-crit)</text>
                </g>
              )}

              {/* Probes Overlay */}
              <g>
                <circle cx="210" cy="205" r="4" fill="#00daf3" />
                <line x1="210" y1="205" x2="210" y2="150" stroke="#00daf3" strokeWidth="1" />
                <rect x="150" y="130" width="120" height="20" rx="3" fill="#1e2023" stroke="#00daf3" strokeWidth="1" />
                <text x="156" y="144" fill="#00daf3" fontSize="9" fontWeight="bold">
                  Probe 1: x/c=0.25, Cp=-1.84
                </text>

                <circle cx="450" cy="225" r="4" fill="#ffb68b" />
                <line x1="450" y1="225" x2="450" y2="170" stroke="#ffb68b" strokeWidth="1" />
                <rect x="400" y="150" width="120" height="20" rx="3" fill="#1e2023" stroke="#ffb68b" strokeWidth="1" />
                <text x="406" y="164" fill="#ffb68b" fontSize="9" fontWeight="bold">
                  Probe 2: x/c=0.75, Cp=-0.22
                </text>
              </g>
            </svg>

            {/* Vertical Scalar Bar on Right */}
            <div className="absolute right-4 top-16 bottom-16 w-14 bg-[#1e2023]/90 backdrop-blur-sm rounded border border-[#282a2d] p-1.5 flex flex-col items-center justify-between text-[9px]">
              <span className="text-[#ffb4ab] font-bold">+1.20</span>
              <span className="text-[#ffb68b]">+0.50</span>
              <span className="text-white">0.00</span>
              <span className="text-[#3491ff]">-1.00</span>
              <span className="text-[#00daf3] font-bold">-2.50</span>
              <div className="w-3 h-48 rounded bg-gradient-to-t from-[#00daf3] via-[#3491ff] via-[#ffffff] via-[#ffb68b] to-[#ffb4ab]" />
              <span className="text-[8px] text-[#8a919f] mt-1">Cp Scalar</span>
            </div>
          </div>
        </main>

        {/* Right Sub-Dock: Chordwise Cp Plot & Report Generator */}
        <aside className="w-[340px] flex flex-col bg-[#1a1c1f] border-l border-[#282a2d] shadow-md shrink-0 select-none">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Section Analysis & Report</span>
            <span className="text-[#00daf3]">DOSSIER</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-[11px]">
            {/* Chordwise Pressure Coefficient Plot */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Chordwise Cp Distribution</span>
                <span className="text-[8px] text-[#00daf3] bg-[#111316] px-1 rounded">Validation Match</span>
              </div>

              {/* Mini Cp Plot */}
              <div className="w-full h-36 bg-[#0c0e11] rounded border border-[#282a2d] p-1 relative">
                <svg className="w-full h-full" viewBox="0 0 300 130">
                  <line x1="30" y1="65" x2="280" y2="65" stroke="#333538" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="30" y1="10" x2="30" y2="120" stroke="#333538" strokeWidth="1" />
                  <text x="5" y="20" fill="#8a919f" fontSize="8">-2.0</text>
                  <text x="10" y="68" fill="#8a919f" fontSize="8">0.0</text>
                  <text x="5" y="115" fill="#8a919f" fontSize="8">+1.0</text>
                  <text x="35" y="125" fill="#8a919f" fontSize="8">x/c: 0.0</text>
                  <text x="250" y="125" fill="#8a919f" fontSize="8">1.0</text>

                  {/* Upper Suction Surface (Negative peak at ~12%) */}
                  <path
                    d="M 30 65 Q 60 15, 120 40 T 200 58 T 280 62"
                    fill="none"
                    stroke="#00daf3"
                    strokeWidth="2"
                  />
                  {/* Lower Pressure Surface */}
                  <path
                    d="M 30 65 Q 70 85, 140 75 T 220 68 T 280 62"
                    fill="none"
                    stroke="#ffb68b"
                    strokeWidth="2"
                  />
                  {/* Wind tunnel comparison dots */}
                  <circle cx="65" cy="22" r="2" fill="#ffffff" />
                  <circle cx="100" cy="34" r="2" fill="#ffffff" />
                  <circle cx="150" cy="48" r="2" fill="#ffffff" />
                  <circle cx="210" cy="58" r="2" fill="#ffffff" />
                </svg>

                <div className="absolute top-1 right-2 flex items-center gap-2 text-[8px]">
                  <span className="flex items-center gap-0.5 text-[#00daf3]"><span className="w-1.5 h-0.5 bg-[#00daf3]" /> Upper</span>
                  <span className="flex items-center gap-0.5 text-[#ffb68b]"><span className="w-1.5 h-0.5 bg-[#ffb68b]" /> Lower</span>
                  <span className="flex items-center gap-0.5 text-white"><span className="w-1 h-1 rounded-full bg-white" /> Exp Data</span>
                </div>
              </div>
            </div>

            {/* Certification Report Dossier Summary */}
            <div className="bg-[#1e2023] p-2.5 rounded border border-[#282a2d] flex flex-col gap-2 text-[10px]">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-1.5">
                <span className="text-white font-bold uppercase">Certification Dossier</span>
                <span className="text-[9px] text-[#00daf3] bg-[#111316] px-1 rounded font-mono">4M-CAE-TR-2026-A1</span>
              </div>

              <div className="flex flex-col gap-1 text-[9px] text-[#8a919f]">
                <div>Project: <span className="text-white">Aero_Wing_Transonic_Evaluation</span></div>
                <div>Lead Developer: <span className="text-[#00daf3] font-bold">Eng. Alaa Mohammed</span></div>
                <div>Standard: <span className="text-[#a8c8ff]">AIAA S-117 / ISO 14001 / Eurocode</span></div>
                <div>Status: <span className="text-[#34c759] font-bold">APPROVED FOR FLIGHT ENVELOPE</span></div>
                <div>Max Stress Margin: <span className="text-white font-bold">+18.4% (Safety Factor: 1.50)</span></div>
              </div>

              {reportGenerated && (
                <div className="p-2 bg-[#111316] rounded border border-[#34c759] flex items-center gap-2 text-[#34c759] text-[10px] animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-[#34c759]" />
                  <span>Dossier generated successfully (24 Pages with high-res vector charts).</span>
                </div>
              )}

              <button
                onClick={handleGenerateReport}
                className="w-full py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Official Engineering Report (PDF)</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  onClick={() => alert('Exporting Raw CSV Datasets for Cl, Cd, and Cp distribution...')}
                  className="py-1 bg-[#111316] hover:bg-[#282a2d] text-[#c0c6d6] rounded text-[9px] border border-[#282a2d] cursor-pointer"
                >
                  Raw CSV Datasets
                </button>
                <button
                  onClick={() => alert('Exporting ParaView VTK Scientific Bundle...')}
                  className="py-1 bg-[#111316] hover:bg-[#282a2d] text-[#c0c6d6] rounded text-[9px] border border-[#282a2d] cursor-pointer"
                >
                  Download VTK File
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
