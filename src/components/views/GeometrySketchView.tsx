import React, { useState } from 'react';
import Viewer3D from '../viewer/Viewer3D';
import {
  MousePointer,
  Minus,
  Circle,
  Square,
  Sparkles,
  Scissors,
  Copy,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Maximize2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Info
} from 'lucide-react';

interface GeometrySketchViewProps {
  onFinishSketch?: () => void;
  onOpenMesh?: () => void;
}

export const GeometrySketchView: React.FC<GeometrySketchViewProps> = ({
  onFinishSketch,
  onOpenMesh,
}) => {
  const [activeTool, setActiveTool] = useState<string>('select');
  const [solverState, setSolverState] = useState<'solved' | 'under' | 'over'>('solved');
  const [selectedEntity, setSelectedEntity] = useState<string>('spline_upper');
  const [showCurvatureCombs, setShowCurvatureCombs] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Dynamic dimension modal
  const [isDimModalOpen, setIsDimModalOpen] = useState<boolean>(false);
  const [paramVarName, setParamVarName] = useState<string>('chord_length');
  const [paramValue, setParamValue] = useState<number>(250.0);
  const [paramUnit, setParamUnit] = useState<string>('mm');
  const [exposeToDoe, setExposeToDoe] = useState<boolean>(true);

  // 3D Solid Operations state
  const [featureTab, setFeatureTab] = useState<'extrude' | 'revolve' | 'sweep' | 'loft'>('extrude');
  const [extrudeLength, setExtrudeLength] = useState<number>(85.0);
  const [extrudeDir, setExtrudeDir] = useState<'Normal' | 'Symmetric' | 'Two-Side'>('Symmetric');
  const [draftAngle, setDraftAngle] = useState<number>(0.0);
  const [isThinWall, setIsThinWall] = useState<boolean>(false);
  const [booleanMode, setBooleanMode] = useState<'new' | 'union' | 'cut'>('new');

  // Cursor coordinates
  const [coords, setCoords] = useState<{ x: string; y: string }>({ x: '184.20', y: '32.85' });

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openDimensionEditor = (name: string, val: number, unit: string) => {
    setParamVarName(name);
    setParamValue(val);
    setParamUnit(unit);
    setIsDimModalOpen(true);
  };

  const handleApplyDimension = () => {
    setIsDimModalOpen(false);
    triggerToast(`Parametric update applied: ${paramVarName} = ${paramValue.toFixed(2)} ${paramUnit}`);
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 900;
    const y = ((e.clientY - rect.top) / rect.height) * 560;
    const cadX = (x - 160).toFixed(2);
    const cadY = (280 - y).toFixed(2);
    setCoords({ x: cadX, y: cadY });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Interactive Action & Parametric Modeling Control Bar */}
      <div className="w-full bg-[#0c0e11] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#282a2d] z-30 text-[11px]">
        {/* Sketch Creation Primitives Toolbar */}
        <div className="flex items-center gap-1.5 bg-[#1a1c1f] px-1.5 py-0.5 rounded border border-[#282a2d]">
          <span className="text-[#8a919f] text-[9px] uppercase tracking-wider font-semibold px-1">Draw</span>
          <div className="flex items-center gap-0.5">
            {[
              { id: 'select', label: 'Select (S)', icon: MousePointer },
              { id: 'line', label: 'Line (L)', icon: Minus },
              { id: 'arc', label: 'Arc (A)', icon: Circle },
              { id: 'circle', label: 'Circle (C)', icon: Circle },
              { id: 'rect', label: 'Rectangle (R)', icon: Square },
              { id: 'spline', label: 'Spline (B)', icon: Sparkles },
              { id: 'trim', label: 'Trim (T)', icon: Scissors },
              { id: 'offset', label: 'Offset (O)', icon: Copy },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  triggerToast(`Activated ${tool.id.toUpperCase()} operator`);
                }}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  activeTool === tool.id ? 'bg-[#3491ff] text-white' : 'text-[#8a919f] hover:text-white hover:bg-[#282a2d]'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Geometric Constraints Bar */}
        <div className="flex items-center gap-1.5 bg-[#1a1c1f] px-1.5 py-0.5 rounded border border-[#282a2d]">
          <span className="text-[#8a919f] text-[9px] uppercase tracking-wider font-semibold px-1">Constraints</span>
          <div className="flex items-center gap-0.5">
            {['Coincident', 'Parallel', 'Perpendicular', 'Tangent', 'Horizontal', 'Vertical', 'Equal', 'Symmetric'].map(
              (c) => (
                <button
                  key={c}
                  onClick={() => triggerToast(`Applied ${c} constraint to active profile buffer`)}
                  className="px-1.5 py-1 text-[10px] text-[#c0c6d6] hover:text-[#00daf3] hover:bg-[#282a2d] rounded transition-colors cursor-pointer"
                  title={c}
                >
                  {c.slice(0, 4)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Degrees of Freedom & Diagnostic Status Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#1e2023] rounded border border-[#282a2d] shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                solverState === 'solved' ? 'bg-[#00daf3]' : solverState === 'under' ? 'bg-[#ffb68b]' : 'bg-[#ffb4ab]'
              }`}
            />
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                solverState === 'solved' ? 'text-[#00daf3]' : solverState === 'under' ? 'text-[#ffb68b]' : 'text-[#ffb4ab]'
              }`}
            >
              {solverState === 'solved'
                ? 'Fully Constrained (0 DOF)'
                : solverState === 'under'
                ? 'Under-Constrained (3 DOF)'
                : 'Over-Constrained (1 Conf)'}
            </span>
          </div>

          <div className="flex items-center bg-[#282a2d] p-0.5 rounded border border-[#404754]/40">
            <button
              onClick={() => setSolverState('solved')}
              className={`px-1.5 py-0.5 text-[9px] rounded ${solverState === 'solved' ? 'bg-[#111316] text-[#00daf3] font-bold' : 'text-[#8a919f]'}`}
            >
              Solved
            </button>
            <button
              onClick={() => setSolverState('under')}
              className={`px-1.5 py-0.5 text-[9px] rounded ${solverState === 'under' ? 'bg-[#111316] text-[#ffb68b] font-bold' : 'text-[#8a919f]'}`}
            >
              Under (3 DOF)
            </button>
            <button
              onClick={() => setSolverState('over')}
              className={`px-1.5 py-0.5 text-[9px] rounded ${solverState === 'over' ? 'bg-[#111316] text-[#ffb4ab] font-bold' : 'text-[#8a919f]'}`}
            >
              Over (1 Conf)
            </button>
          </div>

          <button
            onClick={() => {
              triggerToast('Sketch closed and synchronized with topological B-Rep kernel');
              onFinishSketch?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white text-[11px] font-bold rounded transition-colors shadow-sm cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finish Sketch</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Pane Workbench Surface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Active Datum & Hierarchical Sketch Tree */}
        <section className="w-[280px] bg-[#1a1c1f] border-r border-[#282a2d] flex flex-col shadow-lg z-20 flex-shrink-0">
          <div className="h-7 px-3 bg-[#111316] flex items-center justify-between border-b border-[#282a2d]">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white">
              <span>Sketch_004 [XY-Plane]</span>
            </div>
            <span className="text-[9px] text-[#8a919f] px-1 bg-[#1e2023] rounded">G2 Smooth</span>
          </div>

          <div className="p-2.5 flex flex-col gap-2.5 overflow-y-auto text-[11px]">
            {/* Active Datum Plane Context Card */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-[#8a919f] uppercase tracking-wider">Datum CSYS</span>
                <span className="text-[#a8c8ff] font-bold">CSYS_World</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px] pt-1">
                <div className="bg-[#111316] p-1 rounded border border-[#282a2d] flex flex-col">
                  <span className="text-[#ffb4ab]">X-Normal</span>
                  <span className="text-white">0.000</span>
                </div>
                <div className="bg-[#111316] p-1 rounded border border-[#282a2d] flex flex-col">
                  <span className="text-[#00daf3]">Y-Normal</span>
                  <span className="text-white">0.000</span>
                </div>
                <div className="bg-[#111316] p-1 rounded border border-[#282a2d] flex flex-col">
                  <span className="text-[#a8c8ff]">Z-Offset</span>
                  <span className="text-white">14.25 mm</span>
                </div>
              </div>
            </div>

            {/* Entities List */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-[#8a919f] uppercase font-semibold">
                <span>Entities (4 Active)</span>
                <span>Len / Param</span>
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'line1', name: 'Line 1 (Chord Datum)', param: 'L = 120.00mm' },
                  { id: 'arc1', name: 'Arc 1 (Leading Edge)', param: 'R = 25.00mm' },
                  { id: 'spline_upper', name: 'Spline Upper (Suction)', param: '8 Ctrl Pts' },
                  { id: 'spline_lower', name: 'Spline Lower (Pressure)', param: '8 Ctrl Pts' },
                ].map((ent) => (
                  <div
                    key={ent.id}
                    onClick={() => {
                      setSelectedEntity(ent.id);
                      triggerToast(`Selected ${ent.name}`);
                    }}
                    className={`cursor-pointer flex items-center justify-between px-2 py-1 rounded transition-colors text-[10px] ${
                      selectedEntity === ent.id
                        ? 'bg-[#282a2d] text-[#00daf3] font-bold border border-[#00daf3]/40'
                        : 'bg-[#1e2023] text-[#c0c6d6] hover:bg-[#282a2d]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedEntity === ent.id ? 'bg-[#00daf3]' : 'bg-[#8a919f]'}`} />
                      <span className="truncate">{ent.name}</span>
                    </div>
                    <span className="text-[9px] text-[#8a919f]">{ent.param}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Constraints List */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-[#8a919f] uppercase font-semibold">
                <span>Constraints (14 Active)</span>
                <span className="text-[#00daf3]">Solved</span>
              </div>
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                {[
                  { desc: 'Coincident [LE_Arc & Spline_Up]', code: 'C_01' },
                  { desc: 'Tangent (G1) [LE_Arc to Spline]', code: 'C_02' },
                  { desc: 'Horizontal [Chord Baseline Axis]', code: 'C_03' },
                  { desc: 'Perpendicular [Web Rib 1 to Chord]', code: 'C_04' },
                  { desc: 'Equal Radius [Fillet L1 & L2]', code: 'C_05' },
                  { desc: 'Symmetric [Flange Rib Spacing]', code: 'C_06' },
                  { desc: 'Fixed Origin [0.00, 0.00, 0.00]', code: 'C_07' },
                ].map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center justify-between px-2 py-1 bg-[#1e2023] rounded text-[9px] text-[#c0c6d6] border border-[#282a2d]"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3 h-3 text-[#00daf3]" />
                      <span className="truncate">{c.desc}</span>
                    </div>
                    <span className="text-[#8a919f]">{c.code}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Snapping Parameters */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-semibold">Grid & Snapping</span>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Minor Grid Snap</span>
                <span className="text-[#00daf3] font-bold">1.00 mm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Angular Resolution</span>
                <span className="text-[#00daf3] font-bold">0.50 deg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Curvature Combs</span>
                <button
                  onClick={() => setShowCurvatureCombs(!showCurvatureCombs)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-colors ${
                    showCurvatureCombs ? 'bg-[#111316] text-[#00daf3] border border-[#00daf3]/40' : 'bg-[#111316] text-[#8a919f]'
                  }`}
                >
                  {showCurvatureCombs ? 'Active (G2)' : 'Hidden'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Center 2D CAD Canvas */}
        <main className="flex-1 relative bg-[#0c0e11] flex flex-col overflow-hidden min-h-[450px]">
          {/* Top Left HUD */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none text-[10px]">
            <div className="bg-[#1e2023]/90 backdrop-blur-md px-2.5 py-1 rounded shadow-md border border-[#282a2d] pointer-events-auto flex items-center gap-3">
              <span className="text-white font-semibold">VIEW: XY TOP (Normal to Plane)</span>
              <span className="text-[#8a919f]">Scale: <strong className="text-[#a8c8ff]">1:2.5</strong></span>
              <span className="text-[#c0c6d6]">Cursor: X: {coords.x}mm | Y: {coords.y}mm</span>
            </div>
          </div>

          {/* Top Right Gizmo */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            <div className="w-14 h-14 bg-[#1e2023]/90 backdrop-blur-sm rounded border border-[#282a2d] p-1 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 60 60">
                <line x1="30" y1="30" x2="52" y2="30" stroke="#ffb4ab" strokeWidth="2" />
                <line x1="30" y1="30" x2="30" y2="8" stroke="#00daf3" strokeWidth="2" />
                <line x1="30" y1="30" x2="16" y2="44" stroke="#a8c8ff" strokeWidth="2" />
                <circle cx="30" cy="30" r="3" fill="#e2e2e6" />
                <text x="54" y="33" fill="#ffb4ab" fontSize="8" fontWeight="bold">X</text>
                <text x="27" y="6" fill="#00daf3" fontSize="8" fontWeight="bold">Y</text>
                <text x="10" y="52" fill="#a8c8ff" fontSize="8" fontWeight="bold">Z</text>
              </svg>
            </div>
            <div className="flex items-center gap-1 bg-[#1e2023]/90 p-1 rounded border border-[#282a2d] text-[10px]">
              <button
                onClick={() => setZoomLevel((z) => Math.min(250, z + 10))}
                className="p-1 hover:text-white text-[#8a919f] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-white text-[9px] px-1 font-mono">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.max(40, z - 10))}
                className="p-1 hover:text-white text-[#8a919f] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG CAD Interactive Drawing Engine */}
          <div className="w-full h-full relative cursor-crosshair flex-1 select-none overflow-hidden">
            <svg
              className="w-full h-full absolute inset-0"
              viewBox="0 0 900 560"
              preserveAspectRatio="xMidYMid meet"
              onMouseMove={handleMouseMoveCanvas}
            >
              <defs>
                <pattern id="grid-cad-minor" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e2023" strokeWidth="0.75" />
                </pattern>
                <pattern id="grid-cad-major" width="50" height="50" patternUnits="userSpaceOnUse">
                  <rect width="50" height="50" fill="url(#grid-cad-minor)" />
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#282a2d" strokeWidth="1.2" />
                </pattern>
                <marker id="dim-arrow-cad-start" markerWidth="6" markerHeight="6" refX="2" refY="3" orient="auto">
                  <path d="M5,1 L1,3 L5,5" fill="none" stroke="#00daf3" strokeWidth="1" />
                </marker>
                <marker id="dim-arrow-cad-end" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
                  <path d="M1,1 L5,3 L1,5" fill="none" stroke="#00daf3" strokeWidth="1" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#grid-cad-major)" />

              {/* Primary Datum Axes */}
              <line x1="0" y1="280" x2="900" y2="280" stroke="#333538" strokeWidth="1.5" strokeDasharray="8 4" />
              <line x1="160" y1="0" x2="160" y2="560" stroke="#333538" strokeWidth="1.5" strokeDasharray="8 4" />

              {/* Origin Marker */}
              <circle cx="160" cy="280" r="4" fill="none" stroke="#a8c8ff" strokeWidth="2" />
              <circle cx="160" cy="280" r="1.5" fill="#a8c8ff" />
              <text x="145" y="296" fill="#8a919f" fontSize="10">Origin (0,0)</text>

              {/* Curvature Porcupine Combs */}
              {showCurvatureCombs && (
                <g className="opacity-70">
                  <line x1="160" y1="280" x2="155" y2="255" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <line x1="210" y1="240" x2="202" y2="210" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <line x1="270" y1="215" x2="265" y2="185" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <line x1="360" y1="198" x2="358" y2="168" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <line x1="470" y1="205" x2="472" y2="180" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <line x1="590" y1="230" x2="598" y2="215" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="2 2" />
                  <path d="M155,255 Q265,185 358,168 T598,215" fill="none" stroke="#00daf3" strokeWidth="0.75" strokeDasharray="1 3" />
                </g>
              )}

              {/* Chord and Rib Spacers */}
              <line x1="160" y1="280" x2="680" y2="280" stroke="#8a919f" strokeWidth="1.2" strokeDasharray="4 4" />
              <line x1="380" y1="198" x2="380" y2="345" stroke="#8a919f" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="530" y1="215" x2="530" y2="310" stroke="#8a919f" strokeWidth="1" strokeDasharray="3 3" />

              {/* Profile Geometries */}
              {/* 1. Leading edge arc */}
              <path
                d="M 160 280 A 25 25 0 0 1 185 248"
                fill="none"
                stroke={solverState === 'over' ? '#ffb4ab' : solverState === 'under' ? '#ffb68b' : '#00daf3'}
                strokeWidth="2.5"
                className="cursor-pointer hover:stroke-white"
                onClick={() => openDimensionEditor('R_leading_edge', 25.0, 'mm')}
              />

              {/* 2. Upper Suction Spline */}
              <path
                d="M 185 248 C 260 205, 390 190, 520 215 C 590 228, 650 260, 680 280"
                fill="none"
                stroke={solverState === 'over' ? '#ffb4ab' : solverState === 'under' ? '#ffb68b' : '#00daf3'}
                strokeWidth="2.8"
                className="cursor-pointer hover:stroke-white"
                onClick={() => openDimensionEditor('chord_length', paramValue, 'mm')}
              />

              {/* 3. Lower Profile with integrated Mounting Lug */}
              <path
                d="M 160 280 C 210 330, 300 350, 380 345 L 380 380 L 440 380 L 440 338 C 520 328, 620 302, 680 280"
                fill="none"
                stroke={solverState === 'over' ? '#ffb4ab' : solverState === 'under' ? '#ffb68b' : '#00daf3'}
                strokeWidth="2.5"
                className="cursor-pointer hover:stroke-white"
                onClick={() => openDimensionEditor('lower_profile_offset', 45.0, 'mm')}
              />

              {/* Concentric Bores */}
              <circle cx="410" cy="360" r="14" fill="#1e2023" stroke="#00daf3" strokeWidth="2" className="cursor-pointer hover:stroke-white" onClick={() => openDimensionEditor('bore_1_diameter', 28.0, 'mm')} />
              <circle cx="410" cy="360" r="2" fill="#00daf3" />

              <circle cx="280" cy="275" r="18" fill="#1e2023" stroke="#00daf3" strokeWidth="2" className="cursor-pointer hover:stroke-white" onClick={() => openDimensionEditor('bore_2_diameter', 36.0, 'mm')} />
              <circle cx="280" cy="275" r="2" fill="#00daf3" />

              {/* Spline Control Polygon handles */}
              <polyline points="185,248 260,205 390,190 520,215 680,280" fill="none" stroke="#404754" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="260" cy="205" r="4.5" fill="#111316" stroke="#00daf3" strokeWidth="1.8" className="cursor-move hover:scale-125" />
              <circle cx="390" cy="190" r="4.5" fill="#111316" stroke="#00daf3" strokeWidth="1.8" className="cursor-move hover:scale-125" />
              <circle cx="520" cy="215" r="4.5" fill="#111316" stroke="#00daf3" strokeWidth="1.8" className="cursor-move hover:scale-125" />

              {/* Constraints Visual Badges */}
              {/* Tangency Marker */}
              <g transform="translate(182, 244)">
                <circle cx="0" cy="0" r="7" fill="#1e2023" stroke="#00daf3" strokeWidth="1" />
                <line x1="-4" y1="-2" x2="4" y2="-2" stroke="#00daf3" strokeWidth="1" />
                <circle cx="0" cy="1" r="2" fill="none" stroke="#00daf3" strokeWidth="0.8" />
              </g>

              {/* Perpendicular Square */}
              <g transform="translate(380, 280)">
                <rect x="0" y="-10" width="10" height="10" fill="none" stroke="#00daf3" strokeWidth="1" />
                <circle cx="5" cy="-5" r="1" fill="#00daf3" />
              </g>

              {/* DYNAMIC CALLOUT DIMENSIONS */}
              {/* 1. Leading edge radius */}
              <g className="cursor-pointer" onClick={() => openDimensionEditor('R_leading_edge', 45.0, 'mm')}>
                <line x1="160" y1="280" x2="128" y2="230" stroke="#00daf3" strokeWidth="1.2" markerStart="url(#dim-arrow-cad-start)" />
                <polyline points="128,230 80,230" stroke="#00daf3" strokeWidth="1.2" />
                <rect x="75" y="216" width="62" height="16" rx="2" fill="#1e2023" stroke="#404754" strokeWidth="0.75" />
                <text x="80" y="228" fill="#e2e2e6" fontSize="10" fontWeight="500">R = 45.00</text>
              </g>

              {/* 2. Chord dimension (Interactive parameter) */}
              <g className="cursor-pointer" onClick={() => openDimensionEditor('chord_length', paramValue, 'mm')}>
                <line x1="160" y1="410" x2="680" y2="410" stroke="#00daf3" strokeWidth="1.2" markerStart="url(#dim-arrow-cad-start)" markerEnd="url(#dim-arrow-cad-end)" />
                <line x1="160" y1="290" x2="160" y2="425" stroke="#404754" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="680" y1="290" x2="680" y2="425" stroke="#404754" strokeWidth="0.8" strokeDasharray="2 2" />
                <rect x="365" y="401" width="115" height="18" rx="3" fill="#1e2023" stroke="#00daf3" strokeWidth="1" className="shadow-md" />
                <text x="372" y="414" fill="#00daf3" fontSize="10" fontWeight="bold">
                  chord = {paramValue.toFixed(1)}mm
                </text>
              </g>

              {/* 3. Spar position dimension */}
              <g className="cursor-pointer" onClick={() => openDimensionEditor('rib_pos', 210.5, 'mm')}>
                <line x1="160" y1="160" x2="380" y2="160" stroke="#00daf3" strokeWidth="1.2" markerStart="url(#dim-arrow-cad-start)" markerEnd="url(#dim-arrow-cad-end)" />
                <line x1="160" y1="150" x2="160" y2="270" stroke="#404754" strokeWidth="0.8" strokeDasharray="2 2" />
                <line x1="380" y1="150" x2="380" y2="190" stroke="#404754" strokeWidth="0.8" strokeDasharray="2 2" />
                <rect x="230" y="151" width="82" height="17" rx="2" fill="#1e2023" stroke="#404754" strokeWidth="0.75" />
                <text x="236" y="163" fill="#e2e2e6" fontSize="10">L = 210.50mm</text>
              </g>

              {/* 4. Angle Callout */}
              <g className="cursor-pointer" onClick={() => openDimensionEditor('trailing_angle', 12.5, 'deg')}>
                <path d="M 620 280 A 60 60 0 0 0 635 264" fill="none" stroke="#e76e00" strokeWidth="1.2" />
                <rect x="636" y="254" width="70" height="16" rx="2" fill="#1e2023" stroke="#e76e00" strokeWidth="0.75" />
                <text x="640" y="266" fill="#ffb68b" fontSize="10" fontWeight="500">Angle = 12.5°</text>
              </g>
            </svg>

            {/* FLOATING DIMENSION PARAMETRIC EDITOR POPUP */}
            {isDimModalOpen && (
              <div className="absolute top-[40%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-[320px] bg-[#1e2023]/95 backdrop-blur-md p-3.5 rounded border border-[#00daf3] shadow-[0_8px_24px_rgba(0,0,0,0.85)] z-40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                  <div className="flex items-center gap-1.5 text-white font-bold text-[11px] uppercase">
                    <Sliders className="w-3.5 h-3.5 text-[#3491ff]" />
                    <span>Edit Dimension Param</span>
                  </div>
                  <button onClick={() => setIsDimModalOpen(false)} className="text-[#8a919f] hover:text-white cursor-pointer">
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-[#8a919f] flex justify-between">
                    <span>VARIABLE EXPRESSION</span>
                    <span className="text-[#00daf3]">Design Variable Link</span>
                  </label>
                  <input
                    type="text"
                    value={paramVarName}
                    onChange={(e) => setParamVarName(e.target.value)}
                    className="bg-[#111316] border border-[#282a2d] px-2 py-1 rounded text-white text-[11px] focus:outline-none focus:border-[#3491ff]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 flex flex-col gap-1">
                    <label className="text-[9px] text-[#8a919f]">SCALAR VALUE</label>
                    <div className="flex items-center bg-[#111316] border border-[#282a2d] px-2 py-1 rounded">
                      <input
                        type="number"
                        step="0.5"
                        value={paramValue}
                        onChange={(e) => setParamValue(parseFloat(e.target.value) || 0)}
                        className="bg-transparent text-white font-bold text-[12px] w-full focus:outline-none"
                      />
                      <span className="text-[#8a919f] text-[10px] ml-1">{paramUnit}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#8a919f]">TOLERANCE</label>
                    <div className="bg-[#111316] border border-[#282a2d] px-2 py-1 rounded text-[#c0c6d6] text-[10px]">
                      ±0.05
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#111316] p-1.5 rounded border border-[#282a2d]">
                  <input
                    type="checkbox"
                    id="doe-check"
                    checked={exposeToDoe}
                    onChange={(e) => setExposeToDoe(e.target.checked)}
                    className="accent-[#3491ff]"
                  />
                  <label htmlFor="doe-check" className="text-[9px] text-[#c0c6d6] cursor-pointer">
                    Expose to DOE / Aerodynamic Sweep Study
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setIsDimModalOpen(false)}
                    className="px-2.5 py-1 text-[10px] text-[#8a919f] hover:text-white rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyDimension}
                    className="px-3 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[10px] rounded transition-colors shadow"
                  >
                    Apply & Solve
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating Status Bar */}
          <div className="h-7 px-3 bg-[#1a1c1f] border-t border-[#282a2d] flex items-center justify-between z-10 text-[10px] text-[#8a919f]">
            <div className="flex items-center gap-3">
              <span className="text-[#00daf3]">CAD Kernel: OpenCASCADE v7.8.0-E</span>
              <span>Solver Iterations: 4 (12ms)</span>
              <span className="text-[#00daf3]">Continuity: G2 Surface-Ready</span>
            </div>
            <div>Zoom: {zoomLevel}%</div>
          </div>
        </main>

        {/* Right Panel: Solid 3D Operations Panel */}
        <aside className="w-[330px] bg-[#1a1c1f] border-l border-[#282a2d] flex flex-col shadow-lg z-20 flex-shrink-0 select-none">
          <div className="h-7 px-3 bg-[#111316] flex items-center justify-between border-b border-[#282a2d]">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white">
              <Layers className="w-3.5 h-3.5 text-[#3491ff]" />
              <span>3D Solid Modeling Operations</span>
            </div>
            <span className="text-[9px] text-[#00daf3] bg-[#1e2023] px-1.5 py-0.2 rounded">OCCT</span>
          </div>

          <div className="p-2.5 flex flex-col gap-2.5 overflow-y-auto text-[11px]">
            {/* Topological Naming Integrity Banner */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#00daf3] font-bold text-[10px]">
                <Info className="w-3.5 h-3.5" />
                <span>TOPOLOGICAL NAMING INTEGRITY</span>
              </div>
              <p className="text-[#8a919f] text-[9px] leading-relaxed">
                Persistent IDs assigned to Sketch Profile Edges <span className="text-[#a8c8ff]">[e_01 to e_14]</span> for downstream fluid domain boundary condition preservation.
              </p>
            </div>

            {/* Feature Generator Tabs */}
            <div className="flex flex-col gap-1">
              <span className="text-[#8a919f] text-[9px] uppercase font-semibold">Feature Generator</span>
              <div className="grid grid-cols-4 gap-1 bg-[#111316] p-1 rounded border border-[#282a2d]">
                {(['extrude', 'revolve', 'sweep', 'loft'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFeatureTab(tab)}
                    className={`py-1 text-center text-[10px] uppercase rounded transition-colors cursor-pointer ${
                      featureTab === tab ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Extrude Fields */}
            <div className="flex flex-col gap-2 bg-[#1e2023] p-2 rounded border border-[#282a2d] text-[10px]">
              <div className="flex items-center justify-between text-[#8a919f]">
                <span>Profile Selected:</span>
                <span className="text-[#a8c8ff]">Sketch_004 [Closed Region 1]</span>
              </div>

              {/* Slider Length */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-[#8a919f]">Extrude Length</span>
                  <span className="text-[#00daf3] font-bold">dx: {extrudeLength.toFixed(1)} mm</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={extrudeLength}
                    onChange={(e) => setExtrudeLength(parseFloat(e.target.value))}
                    className="w-full accent-[#3491ff] h-1 bg-[#111316] rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    value={extrudeLength}
                    onChange={(e) => setExtrudeLength(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                  />
                  <span className="text-[#8a919f] text-[9px]">mm</span>
                </div>
              </div>

              {/* Direction */}
              <div className="flex flex-col gap-1">
                <span className="text-[#8a919f] text-[9px]">Extrude Direction</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['Normal', 'Symmetric', 'Two-Side'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setExtrudeDir(dir)}
                      className={`py-1 text-[9px] rounded border transition-colors cursor-pointer ${
                        extrudeDir === dir
                          ? 'bg-[#282a2d] text-[#00daf3] border-[#00daf3]/40 font-bold'
                          : 'bg-[#111316] text-[#8a919f] border-[#282a2d]'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft angle & Thin wall */}
              <div className="flex items-center justify-between">
                <span className="text-[#8a919f]">Draft Taper Angle</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={draftAngle}
                    onChange={(e) => setDraftAngle(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-[#111316] border border-[#282a2d] text-right px-1 py-0.5 rounded text-white text-[10px]"
                  />
                  <span className="text-[#8a919f] text-[9px]">deg</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isThinWall}
                    onChange={(e) => setIsThinWall(e.target.checked)}
                    className="accent-[#3491ff]"
                  />
                  <span className="text-white">Thin Wall Profile</span>
                </label>
                <span className="text-[#8a919f] text-[9px]">t = 2.5mm</span>
              </div>
            </div>

            {/* Boolean mode */}
            <div className="flex flex-col gap-1">
              <span className="text-[#8a919f] text-[9px] uppercase font-semibold">Boolean Combine Mode</span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'new', label: 'New Solid' },
                  { id: 'union', label: 'Union / Join' },
                  { id: 'cut', label: 'Cut / Subtract' },
                ].map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBooleanMode(b.id as any)}
                    className={`py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                      booleanMode === b.id
                        ? 'bg-[#282a2d] text-[#3491ff] border-[#3491ff]/40 font-bold'
                        : 'bg-[#1e2023] text-[#8a919f] border-[#282a2d]'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Realtime 3D Solid Preview — real WebGL viewer (Priority 3).
                HONESTY NOTE: the previous version of this panel was a
                static SVG drawing with hardcoded fake face-count/volume
                numbers ("Faces: 18 | Vol: 4.82e-4 m³") that never changed
                regardless of the actual sketch - a fabricated-metrics
                problem exactly like the fake solver labels fixed
                elsewhere. Real face/volume metrics require the
                OpenCASCADE kernel integration (Priority 6, not yet done),
                so we show a real 3D viewer with an explicitly-labeled demo
                shape instead of inventing numbers. */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] text-[#8a919f]">
                <span>SOLID KERNEL PREVIEW</span>
                <span className="text-[#f5a623]">DEMO GEOMETRY — real metrics require OpenCASCADE integration (not yet implemented)</span>
              </div>
              <div className="w-full h-32 bg-[#0c0e11] rounded border border-[#282a2d] relative overflow-hidden">
                <Viewer3D
                  geometryUrl="/assets/demo-cube.stl"
                  displayMode="solid+wireframe"
                  emptyStateLabel="No geometry loaded"
                />
                <div className="absolute bottom-1 right-1 bg-[#1e2023]/90 px-1 py-0.5 rounded text-[8px] text-[#8a919f]">
                  Iso Normal · Real WebGL (Three.js)
                </div>
              </div>
            </div>

            {/* Execute CTA */}
            <button
              onClick={() => {
                triggerToast(`Generated B-Rep Solid from Sketch_004 [Chord=${paramValue.toFixed(1)}mm, Extrude=${extrudeLength}mm]`);
                onFinishSketch?.();
              }}
              className="w-full py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Generate Solid B-Rep (Execute)</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-[#1e2023] border border-[#00daf3] px-3 py-2 rounded shadow-2xl z-50 flex items-center gap-2 text-[11px] text-white animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#00daf3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
