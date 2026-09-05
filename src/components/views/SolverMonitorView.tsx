import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Activity,
  Zap,
  Sliders,
  Send,
  Cpu,
  BarChart3,
  Clock,
  Square
} from 'lucide-react';
import { SolverStatus } from '../../types';

interface SolverMonitorViewProps {
  solverStatus: SolverStatus;
  onSetSolverStatus: (status: SolverStatus) => void;
  currentIteration: number;
  onSetCurrentIteration: (iter: number) => void;
  onOpenResults?: () => void;
  onOpenCopilot?: () => void;
}

export const SolverMonitorView: React.FC<SolverMonitorViewProps> = ({
  solverStatus,
  onSetSolverStatus,
  currentIteration,
  onSetCurrentIteration,
  onOpenResults,
  onOpenCopilot,
}) => {
  const maxIterations = 1000;
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(258); // 04:18

  // Solver iteration loop
  useEffect(() => {
    let interval: any;
    if (solverStatus === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
        onSetCurrentIteration(Math.min(maxIterations, currentIteration + 1));
        if (currentIteration >= maxIterations) {
          onSetSolverStatus('converged');
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [solverStatus, currentIteration, onSetCurrentIteration, onSetSolverStatus]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => onSetSolverStatus('running');
  const handlePause = () => onSetSolverStatus('paused');
  const handleReset = () => {
    onSetSolverStatus('idle');
    onSetCurrentIteration(0);
    setElapsedSeconds(0);
  };
  const handleForceConverge = () => {
    onSetCurrentIteration(maxIterations);
    onSetSolverStatus('converged');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Context Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Cpu className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">Aero_Wing_Transonic_Run_01.foam</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#00daf3] rounded">simpleFoam</span>
          </div>

          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#111316] rounded border border-[#282a2d]">
              <span
                className={`w-2 h-2 rounded-full ${
                  solverStatus === 'running'
                    ? 'bg-[#00daf3] animate-pulse'
                    : solverStatus === 'converged'
                    ? 'bg-[#34c759]'
                    : 'bg-[#8a919f]'
                }`}
              />
              <span className="text-white font-bold">
                {solverStatus === 'running'
                  ? `RUNNING • Iter ${currentIteration} / ${maxIterations}`
                  : solverStatus === 'converged'
                  ? 'SOLVER CONVERGED • Criterion 1.0e-5 Met'
                  : 'SOLVER IDLE'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[#8a919f]">
              <Clock className="w-3 h-3 text-[#a8c8ff]" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
            <span className="hidden md:inline text-[#8a919f]">| 16 MPI Ranks (AVX-512)</span>
          </div>
        </div>

        {/* Solver Controls */}
        <div className="flex items-center gap-1.5">
          {solverStatus === 'running' ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#e76e00] hover:bg-[#ff8b24] text-black font-bold text-[10px] rounded cursor-pointer shadow"
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[10px] rounded cursor-pointer shadow"
            >
              <Play className="w-3 h-3" />
              <span>{solverStatus === 'paused' ? 'Resume' : 'Start Solver'}</span>
            </button>
          )}

          <button
            onClick={handleForceConverge}
            className="px-2 py-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#00daf3] border border-[#00daf3]/40 text-[10px] rounded cursor-pointer"
            title="Force Full Convergence"
          >
            Converge
          </button>

          <button
            onClick={handleReset}
            className="p-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#8a919f] hover:text-white rounded cursor-pointer"
            title="Reset Solver State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sub-Dock (Residuals Table & Real-Time Aerodynamic Coefficients) */}
        <section className="w-[300px] flex flex-col bg-[#1a1c1f] border-r border-[#282a2d] shadow-md shrink-0">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Convergence Equations</span>
            <span className="text-[#00daf3]">6 Variables</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 text-[11px]">
            {/* Table of Residuals */}
            <div className="flex flex-col gap-1">
              {[
                { name: 'Ux (m/s)', cur: '3.42e-05', target: '1.00e-05', status: 'CONVERGING', col: '#3491ff' },
                { name: 'Uy (m/s)', cur: '2.18e-05', target: '1.00e-05', status: 'CONVERGING', col: '#00daf3' },
                { name: 'Uz (m/s)', cur: '4.89e-06', target: '1.00e-05', status: 'CONVERGED', col: '#34c759' },
                { name: 'p (Pressure)', cur: '8.74e-05', target: '1.00e-04', status: 'CONVERGED', col: '#ffb68b' },
                { name: 'k (Turb. Energy)', cur: '1.25e-05', target: '1.00e-05', status: 'CONVERGING', col: '#a8c8ff' },
                { name: 'ω (Dissipation)', cur: '9.81e-06', target: '1.00e-05', status: 'CONVERGED', col: '#34c759' },
              ].map((eq, i) => (
                <div key={i} className="p-1.5 bg-[#1e2023] rounded border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eq.col }} />
                      <span className="font-bold text-white">{eq.name}</span>
                    </div>
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                        eq.status === 'CONVERGED'
                          ? 'bg-[#111316] text-[#34c759] border border-[#34c759]/40'
                          : 'bg-[#111316] text-[#00daf3]'
                      }`}
                    >
                      {eq.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#8a919f] pt-0.5">
                    <span>Cur: <strong className="text-white">{eq.cur}</strong></span>
                    <span>Threshold: {eq.target}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-Time Aerodynamic Coefficients */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Aerodynamic Coefficients (Live)</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">LIFT (Cl)</span>
                  <span className="text-[14px] text-[#00daf3] font-bold">0.5842</span>
                  <span className="text-[8px] text-[#34c759] block">±0.0004 steady</span>
                </div>
                <div className="bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <span className="text-[8px] text-[#8a919f] block">DRAG (Cd)</span>
                  <span className="text-[14px] text-[#ffb68b] font-bold">0.0248</span>
                  <span className="text-[8px] text-[#34c759] block">±0.0001 steady</span>
                </div>
              </div>
              <div className="flex items-center justify-between bg-[#111316] p-1.5 rounded border border-[#282a2d] mt-0.5">
                <span className="text-[#c0c6d6]">L/D Efficiency (Cl/Cd):</span>
                <span className="text-white font-bold text-[12px]">23.55</span>
              </div>
              <div className="flex items-center justify-between bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                <span className="text-[#c0c6d6]">Pitching Moment (Cm):</span>
                <span className="text-[#a8c8ff] font-bold text-[12px]">-0.0412</span>
              </div>
            </div>
          </div>

          <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-t border-[#282a2d] text-[#8a919f] text-[10px]">
            <span>Courant Number (CFL): 0.62</span>
            <span className="text-[#34c759]">STABLE</span>
          </div>
        </section>

        {/* Center: Live Convergence Plot & In-situ Field Visualization */}
        <main className="flex-1 flex flex-col bg-[#0c0e11] overflow-hidden">
          {/* Upper Half: Residual History Curves */}
          <div className="h-1/2 p-3 flex flex-col border-b border-[#282a2d] relative">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#00daf3]" />
                <span className="text-white font-bold">Residual Convergence History (Logarithmic)</span>
              </div>
              <div className="flex items-center gap-3 text-[9px]">
                <span className="flex items-center gap-1 text-[#3491ff]"><span className="w-2 h-0.5 bg-[#3491ff]" /> Ux</span>
                <span className="flex items-center gap-1 text-[#00daf3]"><span className="w-2 h-0.5 bg-[#00daf3]" /> Uy</span>
                <span className="flex items-center gap-1 text-[#ffb68b]"><span className="w-2 h-0.5 bg-[#ffb68b]" /> p</span>
                <span className="flex items-center gap-1 text-[#a8c8ff]"><span className="w-2 h-0.5 bg-[#a8c8ff]" /> k/ω</span>
              </div>
            </div>

            {/* Plot SVG */}
            <div className="flex-1 bg-[#1a1c1f] rounded p-2 relative border border-[#282a2d] overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Horizontal Grid lines (10^0 to 10^-6) */}
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <g key={level}>
                    <line x1="40" y1={30 + level * 30} x2="590" y2={30 + level * 30} stroke="#282a2d" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y={33 + level * 30} fill="#8a919f" fontSize="8" fontFamily="JetBrains Mono">
                      10⁻{level}
                    </text>
                  </g>
                ))}

                {/* Convergence Criteria Line at 10^-5 */}
                <line x1="40" y1="180" x2="590" y2="180" stroke="#34c759" strokeWidth="1.2" strokeDasharray="4 2" />
                <text x="440" y="175" fill="#34c759" fontSize="8" fontFamily="JetBrains Mono">
                  Criterion Threshold: 1.00e-05
                </text>

                {/* Simulated Residuals Curves */}
                {/* Ux */}
                <path
                  d="M 40 35 Q 120 70, 200 110 T 360 145 T 500 168 T 590 174"
                  fill="none"
                  stroke="#3491ff"
                  strokeWidth="2"
                />
                {/* Uy */}
                <path
                  d="M 40 40 Q 140 85, 220 120 T 380 152 T 510 170 T 590 178"
                  fill="none"
                  stroke="#00daf3"
                  strokeWidth="2"
                />
                {/* p */}
                <path
                  d="M 40 30 Q 100 65, 180 95 T 320 125 T 450 148 T 590 162"
                  fill="none"
                  stroke="#ffb68b"
                  strokeWidth="2"
                />
                {/* k/omega */}
                <path
                  d="M 40 45 Q 160 90, 240 130 T 400 160 T 520 175 T 590 182"
                  fill="none"
                  stroke="#a8c8ff"
                  strokeWidth="1.5"
                  strokeDasharray="3 2"
                />

                {/* Current Iteration Indicator Line */}
                <line
                  x1={40 + (currentIteration / maxIterations) * 550}
                  y1="20"
                  x2={40 + (currentIteration / maxIterations) * 550}
                  y2="190"
                  stroke="#00daf3"
                  strokeWidth="1.5"
                />
                <circle
                  cx={40 + (currentIteration / maxIterations) * 550}
                  cy="174"
                  r="3.5"
                  fill="#00daf3"
                />
              </svg>
            </div>
          </div>

          {/* Lower Half: In-Situ Flow Field Probe Visualization */}
          <div className="h-1/2 p-3 flex flex-col relative">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00daf3]" />
                <span className="text-white font-bold">In-Situ Solution Field (Iterative Pressure & Velocity Contour)</span>
              </div>
              <span className="text-[9px] text-[#00daf3] bg-[#1a1c1f] px-1.5 py-0.5 rounded border border-[#282a2d]">
                Live Field Probe @ Z = 60.0 mm
              </span>
            </div>

            <div className="flex-1 bg-[#1a1c1f] rounded relative border border-[#282a2d] flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="pressure-contour" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3491ff" stopOpacity="0.85" />
                    <stop offset="30%" stopColor="#00daf3" stopOpacity="0.8" />
                    <stop offset="55%" stopColor="#ffb68b" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#3491ff" stopOpacity="0.5" />
                  </linearGradient>
                  <radialGradient id="suction-peak" cx="35%" cy="30%" r="40%">
                    <stop offset="0%" stopColor="#00daf3" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#00daf3" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Stagnation pressure zone at LE */}
                <ellipse cx="140" cy="100" rx="35" ry="45" fill="#ffb68b" fillOpacity="0.4" />

                {/* Suction peak over upper surface */}
                <ellipse cx="260" cy="70" rx="90" ry="40" fill="url(#suction-peak)" />

                {/* Wake field downstream */}
                <path d="M 450 95 C 480 85, 540 80, 580 75 L 580 125 C 540 120, 480 115, 450 105 Z" fill="#3491ff" fillOpacity="0.3" />

                {/* NACA 0012 Profile */}
                <path
                  d="M 150 100 C 190 40, 320 50, 450 100 C 330 130, 200 140, 150 100 Z"
                  fill="#111316"
                  stroke="#e2e2e6"
                  strokeWidth="2"
                />

                {/* Velocity Streamlines */}
                <path d="M 50 60 C 140 45, 250 35, 400 65 C 480 80, 550 85, 580 90" fill="none" stroke="#00daf3" strokeWidth="1" strokeDasharray="3 2" />
                <path d="M 50 100 C 120 95, 145 98, 150 100" fill="none" stroke="#ffb68b" strokeWidth="1" />
                <path d="M 50 140 C 140 155, 250 165, 400 135 C 480 120, 550 115, 580 110" fill="none" stroke="#00daf3" strokeWidth="1" strokeDasharray="3 2" />

                {/* Probe Annotation */}
                <text x="120" y="160" fill="#ffb68b" fontSize="9">Stagnation: +1,240 Pa</text>
                <text x="230" y="30" fill="#00daf3" fontSize="9">Suction Peak: -2,850 Pa</text>
              </svg>

              {/* Legend */}
              <div className="absolute bottom-2 right-2 bg-[#111316]/90 px-2 py-1 rounded border border-[#282a2d] text-[8px] flex items-center gap-2">
                <span className="text-[#00daf3]">Min: -2850 Pa</span>
                <div className="w-20 h-2 bg-gradient-to-r from-[#00daf3] via-[#3491ff] to-[#ffb68b] rounded" />
                <span className="text-[#ffb68b]">Max: +1240 Pa</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sub-Dock: Numerical Schemes & Relaxation */}
        <aside className="w-[320px] flex flex-col bg-[#1a1c1f] border-l border-[#282a2d] shadow-md shrink-0 select-none">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Discretization & Schemes</span>
            <span className="text-[#00daf3]">fvSchemes</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-[11px]">
            {/* Numerical Schemes */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Convection Schemes</span>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, U):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss linearUpwind
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, k):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss upwind
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, omega):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss upwind
                </span>
              </div>
            </div>

            {/* Relaxation Factors */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Under-Relaxation Factors</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Pressure (p):</span>
                  <span className="text-[#00daf3] font-bold">0.30</span>
                </div>
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Velocity (U):</span>
                  <span className="text-[#00daf3] font-bold">0.70</span>
                </div>
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Turb. (k):</span>
                  <span className="text-[#00daf3] font-bold">0.70</span>
                </div>
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Dissipation (ω):</span>
                  <span className="text-[#00daf3] font-bold">0.70</span>
                </div>
              </div>
            </div>

            {/* Matrix Solvers */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Matrix Solvers (fvSolution)</span>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Pressure Solver:</span>
                <span className="text-white">GAMG (Agglomeration: faceAreaPair)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Velocity Solver:</span>
                <span className="text-white">smoothSolver (symGaussSeidel)</span>
              </div>
            </div>

            {/* CTA to view results */}
            <div className="pt-2">
              <button
                onClick={onOpenResults}
                className="w-full py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Full Post-Processing Results</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
