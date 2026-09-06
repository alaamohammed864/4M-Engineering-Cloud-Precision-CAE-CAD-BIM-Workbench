import React, { useState } from 'react';
import {
  Grid,
  Layers,
  Box,
  Check,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
  Maximize2,
  Download,
  Send,
  Zap,
  Activity,
  AlertCircle,
  Eye,
  Info,
  Shield
} from 'lucide-react';

interface MeshGeneratorViewProps {
  onProceedToSolver?: () => void;
  onOpenCopilot?: () => void;
}

export const MeshGeneratorView: React.FC<MeshGeneratorViewProps> = ({
  onProceedToSolver,
  onOpenCopilot,
}) => {
  const [minSize, setMinSize] = useState<number>(0.25);
  const [maxSize, setMaxSize] = useState<number>(18.0);
  const [growthRate, setGrowthRate] = useState<number>(1.15);

  const [enableInflation, setEnableInflation] = useState<boolean>(true);
  const [firstLayerHeight, setFirstLayerHeight] = useState<number>(0.012);
  const [numLayers, setNumLayers] = useState<number>(15);
  const [expansionRatio, setExpansionRatio] = useState<number>(1.20);

  const [colorField, setColorField] = useState<'quality' | 'skewness' | 'aspect' | 'size'>('quality');
  const [elementType, setElementType] = useState<'all' | 'hexa' | 'tetra' | 'prism'>('all');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [meshProgress, setMeshProgress] = useState<number>(100);
  const [clipZ, setClipZ] = useState<number>(50);

  // HONESTY NOTE: this simulates a meshing progress UI locally (setTimeout
  // chain) - there is no real Gmsh process behind it. See the DEMO badge
  // rendered above. Real mesh generation exists today via the OpenFOAM
  // (blockMesh) and CalculiX pipelines in backend/app/ (Priority 1).
  const handleGenerateMesh = () => {
    setIsGenerating(true);
    setMeshProgress(15);
    setTimeout(() => setMeshProgress(45), 400);
    setTimeout(() => setMeshProgress(80), 800);
    setTimeout(() => {
      setMeshProgress(100);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Context Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Grid className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">WING_EXTRUDE_SOLID_01 [Gmsh 3D Mesh]</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-[#3d2f1a] text-[#ffb68b] rounded border border-[#ffb68b]/40 font-bold" title="This meshing UI is a demo simulation - no Gmsh backend service is wired in yet. Real meshing exists today only inside the OpenFOAM (blockMesh) and CalculiX pipelines built in Priority 1.">DEMO — Gmsh backend not yet integrated</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#c0c6d6] rounded">AP242</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[10px] text-[#8a919f]">
            <span>ENGINE:</span>
            <span className="flex items-center gap-1 bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d] text-[#00daf3]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00daf3] animate-pulse" />
              GMSH v4.11.1 (OCC Pipeline Active)
            </span>
            <span className="text-[#c0c6d6]">Topology: 24 Faces, 68 Edges, 48 Vertices</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Main Multi-Pane Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sub-Dock (Model Tree & Boundaries) */}
        <section className="w-[280px] flex flex-col bg-[#1a1c1f] border-r border-[#282a2d] shadow-md shrink-0">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d] text-[10px] text-[#8a919f]">
            <span className="font-semibold text-white uppercase">Mesh Domains & Groups</span>
            <span className="text-[#00daf3]">3 Zones</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 text-[11px]">
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold text-white text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3 h-3 text-[#00daf3]" />
                  <span>Fluid_Domain_Enclosure</span>
                </div>
                <span className="text-[9px] bg-[#111316] text-[#00daf3] px-1 rounded">3D Tetra + Prism</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[9px] text-[#8a919f] mt-1">
                <div>Cells: <strong className="text-white">448,210</strong></div>
                <div>Nodes: <strong className="text-white">98,450</strong></div>
                <div>Prisms: <strong className="text-white">128,400</strong></div>
                <div>Tetras: <strong className="text-white">319,810</strong></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[#8a919f] text-[9px] uppercase font-semibold">Boundary Mesh Patches</span>
              {[
                { name: 'Inlet_Boundary (Face 104)', type: 'Quad/Tri', count: '4,120 faces', col: '#3491ff' },
                { name: 'Outlet_Boundary (Face 108)', type: 'Quad/Tri', count: '3,890 faces', col: '#00daf3' },
                { name: 'Airfoil_Wall (Faces 101, 102)', type: 'Fine Quad', count: '24,800 faces', col: '#ffb68b' },
                { name: 'Symm_Top_Bottom (Faces 105, 106)', type: 'Structured', count: '12,400 faces', col: '#c0c6d6' },
              ].map((p, i) => (
                <div key={i} className="p-1.5 bg-[#1e2023] rounded border border-[#282a2d] flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: p.col }} />
                      <span className="font-semibold text-white">{p.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-[#8a919f]">
                    <span>{p.type}</span>
                    <span className="text-white">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1 text-[9px] text-[#8a919f]">
              <span className="text-[#00daf3] font-bold">Y+ ESTIMATOR (CFD)</span>
              <p className="leading-relaxed">
                Based on U = 45 m/s, chord = 1.0 m, ν = 1.5e-5 m²/s: estimated y+ with first height 0.012 mm is <strong className="text-white">y+ ≈ 0.94</strong> (Optimal for SST resolving viscous sublayer without wall functions).
              </p>
            </div>
          </div>

          <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-t border-[#282a2d] text-[#8a919f] text-[10px]">
            <span>Gmsh Mesh Format: MSH 4.1</span>
            <span className="text-[#00daf3]">PARSED</span>
          </div>
        </section>

        {/* Center 3D Mesh Canvas */}
        <main className="flex-1 relative bg-[#0c0e11] flex flex-col overflow-hidden">
          {/* Top HUD Banner */}
          <div className="absolute top-2.5 left-3 right-3 z-30 flex items-center justify-between bg-[#282a2d]/90 backdrop-blur-md px-3 py-1.5 rounded shadow-lg border border-[#404754]/40 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00daf3] animate-pulse" />
              <span className="text-white font-medium">
                Meshing Engine Active: Gmsh 4.11 (Frontal-Delaunay 3D). Total Elements: 448,210 | Nodes: 98,450
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[#00daf3]">Quality Metric:</span>
              <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d]">
                {(['quality', 'skewness', 'aspect', 'size'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setColorField(m)}
                    className={`px-2 py-0.5 rounded text-[9px] uppercase cursor-pointer ${
                      colorField === m ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Canvas SVG Grid & Interactive 3D Mesh Projection */}
          <div className="relative w-full h-full flex items-center justify-center cursor-crosshair overflow-hidden">
            {/* Background Grid */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="mesh-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2023" strokeWidth="0.75" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mesh-grid)" />
            </svg>

            {/* Mesh 3D Structure Graphic */}
            <div className="relative w-[700px] h-[450px]">
              <svg className="w-full h-full" viewBox="0 0 700 450">
                <defs>
                  <linearGradient id="mesh-field-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3491ff" stopOpacity="0.8" />
                    <stop offset="35%" stopColor="#00daf3" stopOpacity="0.7" />
                    <stop offset="70%" stopColor="#ffb68b" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Outer Fluid Boundary Enclosure Frame */}
                <rect x="40" y="40" width="620" height="370" fill="none" stroke="#404754" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="50" y="60" fill="#8a919f" fontSize="10">Fluid Domain Boundary [-2.0c to +5.0c]</text>

                {/* Boundary Layer Prisms Overlay along Airfoil */}
                {/* 15 inflation layer bands */}
                {[...Array(12)].map((_, idx) => {
                  const offset = idx * 2.2;
                  return (
                    <path
                      key={idx}
                      d={`M ${120 - offset} ${220} C ${180 - offset} ${110 - offset}, ${360} ${120 - offset}, ${520 + offset * 1.5} ${210} C ${380} ${260 + offset}, ${200} ${280 + offset}, ${120 - offset} ${220}`}
                      fill="none"
                      stroke={idx === 0 ? '#00daf3' : '#3491ff'}
                      strokeWidth="0.8"
                      strokeOpacity={0.8 - idx * 0.05}
                    />
                  );
                })}

                {/* Airfoil Solid Core */}
                <path
                  d="M 120 220 C 180 110, 360 120, 520 210 C 380 260, 200 280, 120 220 Z"
                  fill="#111316"
                  stroke="#e2e2e6"
                  strokeWidth="2"
                />

                {/* Tetrahedral Delaunay Triangulation Network in Fluid */}
                <g stroke="#3491ff" strokeWidth="0.6" strokeOpacity="0.35" fill="none">
                  {/* Inlet to Airfoil Triangles */}
                  <line x1="40" y1="120" x2="100" y2="170" />
                  <line x1="40" y1="180" x2="100" y2="170" />
                  <line x1="40" y1="240" x2="100" y2="240" />
                  <line x1="40" y1="300" x2="100" y2="270" />
                  <line x1="100" y1="170" x2="120" y2="220" />
                  <line x1="100" y1="240" x2="120" y2="220" />
                  <line x1="100" y1="170" x2="160" y2="140" />
                  <line x1="160" y1="140" x2="220" y2="100" />
                  <line x1="220" y1="100" x2="40" y2="40" />
                  <line x1="220" y1="100" x2="320" y2="80" />
                  <line x1="320" y1="80" x2="440" y2="80" />
                  <line x1="440" y1="80" x2="660" y2="40" />

                  {/* Wake Refinement Region Box Behind Trailing Edge */}
                  <line x1="520" y1="210" x2="560" y2="200" />
                  <line x1="520" y1="210" x2="560" y2="220" />
                  <line x1="560" y1="200" x2="600" y2="195" />
                  <line x1="560" y1="220" x2="600" y2="225" />
                  <line x1="560" y1="200" x2="560" y2="220" />
                  <line x1="600" y1="195" x2="660" y2="190" />
                  <line x1="600" y1="225" x2="660" y2="230" />
                  <line x1="600" y1="195" x2="600" y2="225" />
                  <line x1="660" y1="190" x2="660" y2="230" />

                  {/* Diagonal interconnects */}
                  <line x1="200" y1="120" x2="260" y2="160" />
                  <line x1="300" y1="110" x2="380" y2="150" />
                  <line x1="400" y1="120" x2="480" y2="170" />
                  <line x1="240" y1="250" x2="320" y2="230" />
                  <line x1="340" y1="260" x2="420" y2="220" />
                </g>

                {/* Wake Box Highlight */}
                <rect x="520" y="180" width="140" height="60" fill="#00daf3" fillOpacity="0.08" stroke="#00daf3" strokeWidth="1" strokeDasharray="2 2" />
                <text x="530" y="175" fill="#00daf3" fontSize="9">Wake Refinement Box [0.35 mm]</text>

                {/* Leading Edge Refinement Sphere */}
                <circle cx="120" cy="220" r="35" fill="#ffb68b" fillOpacity="0.08" stroke="#ffb68b" strokeWidth="1" strokeDasharray="2 2" />
                <text x="80" y="270" fill="#ffb68b" fontSize="9">LE Sphere Refinement</text>
              </svg>

              {/* Quality Legend Overlay */}
              <div className="absolute bottom-4 left-4 bg-[#1e2023]/90 backdrop-blur-sm p-2 rounded border border-[#282a2d] flex flex-col gap-1 text-[9px]">
                <span className="text-white font-bold">Orthogonal Quality Spectrum</span>
                <div className="w-40 h-3 rounded bg-gradient-to-r from-[#ffb4ab] via-[#ffb68b] via-[#3491ff] to-[#00daf3]" />
                <div className="flex justify-between text-[#8a919f]">
                  <span>0.0 (Poor)</span>
                  <span>0.5 (Fair)</span>
                  <span>1.0 (Optimal)</span>
                </div>
              </div>

              {/* Interactive Section Clipping Slider */}
              <div className="absolute bottom-4 right-4 bg-[#1e2023]/90 backdrop-blur-sm p-2 rounded border border-[#282a2d] flex items-center gap-2 text-[10px]">
                <span className="text-[#8a919f]">Clip Z:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={clipZ}
                  onChange={(e) => setClipZ(parseInt(e.target.value))}
                  className="w-24 accent-[#00daf3] h-1 bg-[#111316] rounded"
                />
                <span className="text-white">{clipZ}%</span>
              </div>
            </div>
          </div>

          {/* Progress Bar when Generating */}
          {isGenerating && (
            <div className="absolute inset-x-0 bottom-0 bg-[#111316] border-t border-[#00daf3] p-2 flex items-center gap-3 z-40">
              <span className="text-[#00daf3] text-[10px] font-bold animate-pulse">
                Gmsh 4.11 Delaunay Tetra Mesher Executing... ({meshProgress}%)
              </span>
              <div className="flex-1 h-2 bg-[#282a2d] rounded-full overflow-hidden">
                <div className="h-full bg-[#00daf3] transition-all duration-300" style={{ width: `${meshProgress}%` }} />
              </div>
            </div>
          )}
        </main>

        {/* Right Sub-Dock: Mesh Setup & Generation Controls */}
        <aside className="w-[330px] flex flex-col bg-[#1a1c1f] border-l border-[#282a2d] shadow-md shrink-0 select-none">
          <div className="h-7 px-3 flex items-center justify-between bg-[#111316] border-b border-[#282a2d]">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-white">
              <Sliders className="w-3.5 h-3.5 text-[#00daf3]" />
              <span>Mesh Generator Controls</span>
            </div>
            <span className="text-[9px] text-[#00daf3]">v4.11</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2.5 text-[11px]">
            {/* Global Element Sizing */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-2 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Global Element Sizing</span>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Min Element Size:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    value={minSize}
                    onChange={(e) => setMinSize(parseFloat(e.target.value) || 0.1)}
                    className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                  />
                  <span className="text-[#8a919f] text-[9px]">mm</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Max Element Size:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={maxSize}
                    onChange={(e) => setMaxSize(parseFloat(e.target.value) || 1.0)}
                    className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                  />
                  <span className="text-[#8a919f] text-[9px]">mm</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Curvature Growth Rate:</span>
                <input
                  type="number"
                  step="0.05"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(parseFloat(e.target.value) || 1.1)}
                  className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                />
              </div>
            </div>

            {/* Boundary Layer Inflation */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-2 text-[10px]">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableInflation}
                    onChange={(e) => setEnableInflation(e.target.checked)}
                    className="accent-[#00daf3]"
                  />
                  <span className="font-bold text-white text-[10px]">Boundary Layer Inflation</span>
                </label>
                <span className="text-[9px] text-[#00daf3] bg-[#111316] px-1 rounded">y+ ≈ 1</span>
              </div>

              {enableInflation && (
                <div className="flex flex-col gap-1.5 pt-1 border-t border-[#282a2d]/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">First Layer Height:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.002"
                        value={firstLayerHeight}
                        onChange={(e) => setFirstLayerHeight(parseFloat(e.target.value) || 0.01)}
                        className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                      />
                      <span className="text-[#8a919f] text-[9px]">mm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Number of Layers:</span>
                    <input
                      type="number"
                      value={numLayers}
                      onChange={(e) => setNumLayers(parseInt(e.target.value) || 5)}
                      className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8a919f]">Expansion Ratio:</span>
                    <input
                      type="number"
                      step="0.05"
                      value={expansionRatio}
                      onChange={(e) => setExpansionRatio(parseFloat(e.target.value) || 1.1)}
                      className="w-14 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right text-[10px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Mesh Quality Statistics Card */}
            <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold">Mesh Quality Verification</span>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Min Orthogonal Quality:</span>
                <span className="text-[#00daf3] font-bold">0.824 (Pass &gt; 0.15)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Max Skewness:</span>
                <span className="text-[#a8c8ff] font-bold">0.281 (Pass &lt; 0.85)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Max Aspect Ratio:</span>
                <span className="text-[#ffb68b] font-bold">18.4 (Boundary Layer)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#c0c6d6]">Negative Volumes:</span>
                <span className="text-[#00daf3] font-bold">0 (0.00%)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5 pt-1">
              <button
                onClick={handleGenerateMesh}
                disabled={isGenerating}
                className="w-full py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white font-bold text-[11px] rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Meshing in Progress...' : 'Generate Complete Mesh'}</span>
              </button>

              <button
                onClick={onProceedToSolver}
                className="w-full py-1.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#00daf3] border border-[#00daf3]/40 font-bold text-[10px] rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Proceed to CFD Monitor (OpenFOAM planned)</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Diagnostic Histogram Tray */}
      <footer className="h-32 bg-[#1a1c1f] border-t border-[#282a2d] p-2 flex items-center justify-between gap-4 font-mono text-[10px]">
        <div className="flex flex-col gap-1 w-64">
          <span className="text-white font-bold">Quality Metric Histogram</span>
          <span className="text-[#8a919f] text-[9px]">Distribution of cell orthogonal quality across 448,210 elements.</span>
          <div className="flex items-center gap-2 text-[9px] text-[#00daf3]">
            <CheckCircle2 className="w-3 h-3" />
            <span>Ready for high-Re RANS simulation</span>
          </div>
        </div>

        {/* Dynamic Histogram Bars */}
        <div className="flex-1 h-20 bg-[#0c0e11] rounded p-1 flex items-end justify-between gap-1 border border-[#282a2d]">
          {[
            { range: '0.0-0.2', pct: 1, col: '#ffb4ab' },
            { range: '0.2-0.4', pct: 4, col: '#ffb68b' },
            { range: '0.4-0.6', pct: 12, col: '#a8c8ff' },
            { range: '0.6-0.8', pct: 35, col: '#3491ff' },
            { range: '0.8-1.0', pct: 48, col: '#00daf3' },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end gap-1">
              <span className="text-[8px] text-[#8a919f]">{bar.pct}%</span>
              <div
                className="w-full rounded-t transition-all duration-500"
                style={{ height: `${bar.pct * 1.8}px`, backgroundColor: bar.col }}
              />
              <span className="text-[8px] text-[#8a919f]">{bar.range}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};
