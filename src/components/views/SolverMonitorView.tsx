import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Activity,
  Zap,
  Send,
  Cpu,
  BarChart3,
  Clock,
  Square,
  AlertTriangle,
} from 'lucide-react';
import { SolverStatus } from '../../types';

interface SolverMonitorViewProps {
  solverStatus: SolverStatus;
  onSetSolverStatus: (status: SolverStatus) => void;
  currentIteration: number;
  onSetCurrentIteration: (iter: number) => void;
  onOpenResults?: (results?: { pressureDropPa: number; wallShearStressPa: number }) => void;
  onOpenCopilot?: () => void;
}

type ResidualField = 'Ux' | 'Uy' | 'Uz' | 'p' | 'k' | 'epsilon';
const TRACKED_FIELDS: ResidualField[] = ['Ux', 'Uy', 'Uz', 'p', 'k', 'epsilon'];
const FIELD_COLORS: Record<ResidualField, string> = {
  Ux: '#3491ff', Uy: '#00daf3', Uz: '#a8c8ff', p: '#ffb68b', k: '#34c759', epsilon: '#e76e00',
};
const CONVERGENCE_THRESHOLD = 1e-4; // matches SIMPLE.residualControl in the real fvSolution
const MAX_ITERATIONS = 300; // matches end_time in openfoam_case_generator.py

interface ResidualPoint { iteration: number; residual: number; }
interface SolveResults { pressureDropPa: number; wallShearStressPa: number; }

export const SolverMonitorView: React.FC<SolverMonitorViewProps> = ({
  solverStatus,
  onSetSolverStatus,
  currentIteration,
  onSetCurrentIteration,
  onOpenResults,
  onOpenCopilot,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [history, setHistory] = useState<Record<ResidualField, ResidualPoint[]>>(
    () => Object.fromEntries(TRACKED_FIELDS.map((f) => [f, []])) as Record<ResidualField, ResidualPoint[]>
  );
  const [latestResidual, setLatestResidual] = useState<Record<ResidualField, number | null>>(
    () => Object.fromEntries(TRACKED_FIELDS.map((f) => [f, null])) as Record<ResidualField, number | null>
  );
  const [results, setResults] = useState<SolveResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (solverStatus === 'running') {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [solverStatus]);

  const resetRun = useCallback(() => {
    setHistory(Object.fromEntries(TRACKED_FIELDS.map((f) => [f, []])) as Record<ResidualField, ResidualPoint[]>);
    setLatestResidual(Object.fromEntries(TRACKED_FIELDS.map((f) => [f, null])) as Record<ResidualField, number | null>);
    setResults(null);
    setErrorMessage(null);
    setElapsedSeconds(0);
    onSetCurrentIteration(0);
  }, [onSetCurrentIteration]);

  const handleStart = useCallback(() => {
    resetRun();
    onSetSolverStatus('running');

    // Real WebSocket connection to the backend built in Priority 4 - every
    // value rendered below comes from parsing the actual simpleFoam
    // subprocess's live stdout on the server, not a local timer.
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/solve/cfd/pipe-flow`);
    wsRef.current = ws;

    ws.onopen = () => {
      // Default pipe-flow parameters; a future pass can source these from
      // the actual project's boundary-condition inputs instead of defaults.
      ws.send(JSON.stringify({}));
    };

    ws.onmessage = (msg) => {
      const evt = JSON.parse(msg.data);
      switch (evt.event) {
        case 'solver.iteration':
          onSetCurrentIteration(evt.iteration);
          break;
        case 'solver.residual': {
          const field = evt.field as ResidualField;
          if (!TRACKED_FIELDS.includes(field)) break;
          setLatestResidual((prev) => ({ ...prev, [field]: evt.residual }));
          setHistory((prev) => ({
            ...prev,
            [field]: [...prev[field], { iteration: evt.iteration, residual: evt.residual }].slice(-500),
          }));
          break;
        }
        case 'simulation.completed':
          setResults(evt.results);
          onSetSolverStatus('converged');
          break;
        case 'simulation.failed':
          setErrorMessage(evt.message || `Solve failed at stage: ${evt.stage}`);
          onSetSolverStatus('idle');
          break;
        case 'simulation.cancelled':
          onSetSolverStatus('idle');
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      setErrorMessage('Could not reach the solver backend over WebSocket. Is the backend/ service running?');
      onSetSolverStatus('idle');
    };
  }, [onSetSolverStatus, onSetCurrentIteration, resetRun]);

  const handleCancel = useCallback(() => {
    // HONESTY NOTE: the real backend subprocess can be cancelled (closing
    // the connection kills the solver process server-side, see
    // openfoam_adapter.solve_pipe_flow_streaming's CancelledError handling)
    // but cannot be truly paused-and-resumed - a partially-converged SIMPLE
    // iteration can't be frozen and restarted from JS. We label this
    // "Cancel", not "Pause", so the control does what it says.
    wsRef.current?.close();
    onSetSolverStatus('idle');
  }, [onSetSolverStatus]);

  useEffect(() => () => wsRef.current?.close(), []);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Real log-scale mapping of an actual residual value to a chart y-pixel,
  // covering 10^0 (top) down to 10^-8 (bottom) over a 0-200 viewBox.
  const residualToY = (residual: number) => {
    const clamped = Math.max(1e-8, Math.min(1, residual));
    const logVal = Math.log10(clamped); // 0 to -8
    return 20 + (-logVal / 8) * 170; // 20px top margin, 190px bottom
  };
  const iterationToX = (iteration: number) => 40 + (iteration / MAX_ITERATIONS) * 550;

  const buildPolyline = (field: ResidualField) =>
    history[field].map((pt) => `${iterationToX(pt.iteration)},${residualToY(pt.residual)}`).join(' ');

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Context Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Cpu className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">Pipe Flow (DN100, 5m) — Real OpenFOAM Solve</span>
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
                  ? `RUNNING • Iter ${currentIteration} / ${MAX_ITERATIONS}`
                  : solverStatus === 'converged'
                  ? 'SOLVER COMPLETED'
                  : 'SOLVER IDLE'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-[#8a919f]">
              <Clock className="w-3 h-3 text-[#a8c8ff]" />
              <span>Elapsed: {formatTime(elapsedSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Solver Controls */}
        <div className="flex items-center gap-1.5">
          {solverStatus === 'running' ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#e76e00] hover:bg-[#ff8b24] text-black font-bold text-[10px] rounded cursor-pointer shadow"
              title="Cancels the real running solver process - a SIMPLE iteration can't be paused and resumed"
            >
              <Square className="w-3 h-3" />
              <span>Cancel</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[10px] rounded cursor-pointer shadow"
            >
              <Play className="w-3 h-3" />
              <span>Start Solver (Real OpenFOAM)</span>
            </button>
          )}

          <button
            onClick={resetRun}
            className="p-1 bg-[#1e2023] hover:bg-[#282a2d] text-[#8a919f] hover:text-white rounded cursor-pointer"
            title="Clear results"
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

      {errorMessage && (
        <div className="px-3 py-2 bg-[#3d1f1f] border-b border-[#5a2a2a] text-[#ffb4ab] text-[11px] flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sub-Dock: real per-field latest residuals */}
        <section className="w-[300px] flex flex-col bg-[#1a1c1f] border-r border-[#282a2d] shadow-md shrink-0">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Convergence Equations</span>
            <span className="text-[#00daf3]">{TRACKED_FIELDS.length} Variables (Real)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 text-[11px]">
            <div className="flex flex-col gap-1">
              {TRACKED_FIELDS.map((field) => {
                const val = latestResidual[field];
                const converged = val !== null && val < CONVERGENCE_THRESHOLD;
                return (
                  <div key={field} className="p-1.5 bg-[#1e2023] rounded border border-[#282a2d] flex flex-col gap-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: FIELD_COLORS[field] }} />
                        <span className="font-bold text-white">{field}</span>
                      </div>
                      <span
                        className={`text-[8px] px-1 py-0.2 rounded font-bold ${
                          val === null ? 'bg-[#111316] text-[#8a919f]'
                          : converged ? 'bg-[#111316] text-[#34c759] border border-[#34c759]/40'
                          : 'bg-[#111316] text-[#00daf3]'
                        }`}
                      >
                        {val === null ? 'WAITING' : converged ? 'CONVERGED' : 'CONVERGING'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#8a919f] pt-0.5">
                      <span>Cur: <strong className="text-white">{val === null ? '—' : val.toExponential(2)}</strong></span>
                      <span>Threshold: {CONVERGENCE_THRESHOLD.toExponential(0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Real solved results, once available */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Solved Results (Real)</span>
              {results ? (
                <>
                  <div className="flex items-center justify-between bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                    <span className="text-[#c0c6d6]">Pressure Drop:</span>
                    <span className="text-[#00daf3] font-bold text-[12px]">{results.pressureDropPa.toFixed(1)} Pa</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                    <span className="text-[#c0c6d6]">Wall Shear Stress:</span>
                    <span className="text-[#a8c8ff] font-bold text-[12px]">{results.wallShearStressPa.toFixed(2)} Pa</span>
                  </div>
                </>
              ) : (
                <span className="text-[#8a919f] text-[10px] italic">Run the solver to see real results here.</span>
              )}
            </div>
          </div>
        </section>

        {/* Center: real live convergence plot built from actual data */}
        <main className="flex-1 flex flex-col bg-[#0c0e11] overflow-hidden">
          <div className="h-full p-3 flex flex-col relative">
            <div className="flex items-center justify-between mb-1 text-[11px]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#00daf3]" />
                <span className="text-white font-bold">Residual Convergence History (Real, Logarithmic)</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] flex-wrap">
                {TRACKED_FIELDS.map((field) => (
                  <span key={field} className="flex items-center gap-1" style={{ color: FIELD_COLORS[field] }}>
                    <span className="w-2 h-0.5" style={{ backgroundColor: FIELD_COLORS[field] }} /> {field}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-[#1a1c1f] rounded p-2 relative border border-[#282a2d] overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
                  <g key={level}>
                    <line x1="40" y1={20 + (level / 8) * 170} x2="590" y2={20 + (level / 8) * 170} stroke="#282a2d" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="5" y={23 + (level / 8) * 170} fill="#8a919f" fontSize="8" fontFamily="JetBrains Mono">
                      10⁻{level}
                    </text>
                  </g>
                ))}

                <line
                  x1="40" y1={residualToY(CONVERGENCE_THRESHOLD)} x2="590" y2={residualToY(CONVERGENCE_THRESHOLD)}
                  stroke="#34c759" strokeWidth="1.2" strokeDasharray="4 2"
                />
                <text x="420" y={residualToY(CONVERGENCE_THRESHOLD) - 4} fill="#34c759" fontSize="8" fontFamily="JetBrains Mono">
                  Criterion Threshold: {CONVERGENCE_THRESHOLD.toExponential(0)}
                </text>

                {TRACKED_FIELDS.map((field) => (
                  history[field].length > 1 && (
                    <polyline
                      key={field}
                      points={buildPolyline(field)}
                      fill="none"
                      stroke={FIELD_COLORS[field]}
                      strokeWidth="1.5"
                    />
                  )
                ))}

                {history.Ux.length === 0 && solverStatus !== 'running' && (
                  <text x="200" y="100" fill="#8a919f" fontSize="11" fontFamily="JetBrains Mono">
                    Click "Start Solver" to run a real OpenFOAM solve and see live residuals
                  </text>
                )}
              </svg>
            </div>
          </div>
        </main>

        {/* Right Sub-Dock: numerical schemes actually used by the real case
            (see backend/app/openfoam_case_generator.py - kept in sync with
            that file, not independently invented values) */}
        <aside className="w-[320px] flex flex-col bg-[#1a1c1f] border-l border-[#282a2d] shadow-md shrink-0 select-none">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Discretization & Schemes</span>
            <span className="text-[#00daf3]">fvSchemes (Real)</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-[11px]">
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Convection Schemes</span>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, U):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss upwind
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, k):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss upwind
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">div(phi, epsilon):</span>
                <span className="text-white bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
                  bounded Gauss upwind
                </span>
              </div>
            </div>

            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Under-Relaxation Factors</span>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Velocity (U):</span>
                  <span className="text-[#00daf3] font-bold">0.90</span>
                </div>
                <div className="flex items-center justify-between bg-[#111316] px-2 py-1 rounded">
                  <span className="text-[#8a919f]">Turb. (k, ε):</span>
                  <span className="text-[#00daf3] font-bold">0.90</span>
                </div>
              </div>
              <span className="text-[8px] text-[#8a919f] italic">SIMPLE consistent (SIMPLEC) mode — see fvSolution</span>
            </div>

            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Matrix Solvers (fvSolution)</span>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Pressure Solver:</span>
                <span className="text-white">GAMG (GaussSeidel smoother)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">U / k / epsilon Solver:</span>
                <span className="text-white">smoothSolver (GaussSeidel)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Turbulence Model:</span>
                <span className="text-white">RAS kEpsilon</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onOpenResults?.(results ?? undefined)}
                disabled={!results}
                className="w-full py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
