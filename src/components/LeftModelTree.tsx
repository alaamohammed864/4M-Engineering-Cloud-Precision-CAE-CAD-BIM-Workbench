import React, { useState } from 'react';
import {
  FolderTree,
  Filter,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Plane,
  Grid,
  Shield,
  Layers,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  X,
} from 'lucide-react';

interface LeftModelTreeProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectEntity?: (name: string) => void;
}

export const LeftModelTree: React.FC<LeftModelTreeProps> = ({
  collapsed,
  onToggleCollapse,
  onSelectEntity,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    assembly: true,
    wing: true,
  });

  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    wing: true,
    spar: true,
    fluidDomain: false,
  });

  const [showFilter, setShowFilter] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const toggleNode = (node: string) => {
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Real filtering: an item matches when there is no active query, or its
  // label contains the query (case-insensitive). Used below to actually
  // hide/show tree rows rather than leaving the Filter icon decorative.
  const matches = (label: string) =>
    filterQuery.trim() === '' || label.toLowerCase().includes(filterQuery.trim().toLowerCase());

  if (collapsed) {
    return (
      <aside className="fixed left-0 top-[76px] h-[calc(100vh-76px)] w-10 bg-[#1a1c1f] z-40 flex flex-col items-center py-2 border-r border-[#282a2d] select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-[#8a919f] hover:text-white hover:bg-[#282a2d] rounded transition-colors cursor-pointer"
          title="Expand Model Tree"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
        <div className="mt-4 rotate-90 whitespace-nowrap font-mono text-[10px] text-[#8a919f] uppercase tracking-wider">
          Model Tree
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed left-0 top-[76px] h-[calc(100vh-76px)] w-[240px] bg-[#1a1c1f] z-40 flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.4)] border-r border-[#282a2d] select-none">
      {/* Dock Header */}
      <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-b border-[#282a2d]">
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider uppercase text-[#c0c6d6]">
          <FolderTree className="w-3.5 h-3.5 text-[#a8c8ff]" />
          <span>Model Tree</span>
        </div>
        <div className="flex items-center gap-1 text-[#8a919f]">
          <button
            onClick={() => setShowFilter((v) => !v)}
            className={`p-1 hover:text-white hover:bg-[#282a2d] rounded cursor-pointer ${showFilter ? 'text-white bg-[#282a2d]' : ''}`}
            title="Filter Tree"
          >
            <Filter className="w-3 h-3" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:text-white hover:bg-[#282a2d] rounded cursor-pointer"
            title="Collapse Sidebar"
          >
            <ChevronsLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="px-2 py-1.5 bg-[#111316] border-b border-[#282a2d] flex items-center gap-1">
          <input
            autoFocus
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter by name..."
            className="flex-1 bg-[#1a1c1f] border border-[#282a2d] rounded px-1.5 py-0.5 text-[10px] text-white font-mono outline-none focus:border-[#3491ff]"
          />
          {filterQuery && (
            <button onClick={() => setFilterQuery('')} className="text-[#8a919f] hover:text-white cursor-pointer">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1 font-mono text-[11px]">
        {/* Aero_Assembly Root */}
        {matches('Aero_Assembly') && (
          <div
            className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-[#1e2023] text-white cursor-pointer rounded-sm"
            onClick={() => toggleNode('assembly')}
          >
            {expandedNodes.assembly ? <ChevronDown className="w-3.5 h-3.5 text-[#8a919f]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8a919f]" />}
            <span className="material-symbols-outlined text-[14px] text-[#a8c8ff]">domain</span>
            <span className="truncate font-semibold text-[11px]">Aero_Assembly</span>
          </div>
        )}

        {expandedNodes.assembly && (
          <div className="pl-3 flex flex-col gap-1 border-l border-[#282a2d]/60 ml-2">
            {/* Wing_Main_Skin (Solid) */}
            {matches('Wing_Main_Skin') && (
            <div
              className="flex items-center gap-1.5 px-1.5 py-1 bg-[#282a2d] text-[#a8c8ff] rounded-sm cursor-pointer shadow-sm"
              onClick={() => {
                toggleNode('wing');
                onSelectEntity?.('Wing_Main_Skin');
              }}
            >
              {expandedNodes.wing ? <ChevronDown className="w-3.5 h-3.5 text-[#8a919f]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8a919f]" />}
              <Plane className="w-3.5 h-3.5 text-[#00daf3]" />
              <span className="truncate font-medium text-[10px]">Wing_Main_Skin (Solid)</span>
              <button
                onClick={(e) => toggleVisibility('wing', e)}
                className="ml-auto text-[#8a919f] hover:text-white p-0.5"
              >
                {visibility.wing ? <Eye className="w-3 h-3 text-[#a8c8ff]" /> : <EyeOff className="w-3 h-3 text-[#ffb4ab]" />}
              </button>
            </div>
            )}

            {expandedNodes.wing && (
              <div className="pl-3 flex flex-col gap-0.5 text-[#c0c6d6] text-[10px] border-l border-[#282a2d]/40 ml-2">
                {matches('Topology') && (
                <div
                  className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-[#1e2023] cursor-pointer rounded"
                  onClick={() => onSelectEntity?.('Wing_Main_Skin :: Topology (24 Faces)')}
                >
                  <span className="material-symbols-outlined text-[13px] text-[#8a919f]">scatter_plot</span>
                  <span>Topology: 24 Faces</span>
                </div>
                )}
                {matches('Boundary') && (
                <div
                  className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-[#1e2023] cursor-pointer rounded"
                  onClick={() => onSelectEntity?.('Wing_Main_Skin :: Boundary (Inflow_Wall)')}
                >
                  <Shield className="w-3 h-3 text-[#00daf3]" />
                  <span>Boundary: Inflow_Wall</span>
                </div>
                )}
                {matches('Surface Mesh') && (
                <div
                  className="flex items-center gap-1.5 px-1.5 py-0.5 hover:bg-[#1e2023] cursor-pointer rounded"
                  onClick={() => onSelectEntity?.('Wing_Main_Skin :: Surface Mesh (Hexa)')}
                >
                  <Grid className="w-3 h-3 text-[#ffb68b]" />
                  <span>Surface Mesh (Hexa)</span>
                </div>
                )}
              </div>
            )}

            {/* Spar_Internal_Ribs */}
            {matches('Spar_Internal_Ribs') && (
            <div
              className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-[#1e2023] text-[#c0c6d6] cursor-pointer rounded-sm"
              onClick={() => onSelectEntity?.('Spar_Internal_Ribs')}
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#8a919f]" />
              <Layers className="w-3.5 h-3.5 text-[#8a919f]" />
              <span className="truncate text-[10px]">Spar_Internal_Ribs</span>
              <button
                onClick={(e) => toggleVisibility('spar', e)}
                className="ml-auto text-[#8a919f] hover:text-white p-0.5"
              >
                {visibility.spar ? <Eye className="w-3 h-3 text-[#8a919f]" /> : <EyeOff className="w-3 h-3 text-[#8a919f]" />}
              </button>
            </div>
            )}

            {/* Fluid_Domain_Enclosure */}
            {matches('Fluid_Domain_Enclosure') && (
            <div
              className="flex items-center gap-1.5 px-1.5 py-1 hover:bg-[#1e2023] text-[#8a919f] cursor-pointer rounded-sm"
              onClick={() => onSelectEntity?.('Fluid_Domain_Enclosure')}
            >
              <ChevronRight className="w-3.5 h-3.5 text-[#8a919f]" />
              <span className="material-symbols-outlined text-[13px] text-[#8a919f]">air</span>
              <span className="truncate text-[10px]">Fluid_Domain_Enclosure</span>
              <button
                onClick={(e) => toggleVisibility('fluidDomain', e)}
                className="ml-auto text-[#8a919f] hover:text-white p-0.5"
              >
                {visibility.fluidDomain ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </button>
            </div>
            )}
          </div>
        )}
      </div>

      {/* Persistent Selections Footer */}
      <div className="h-7 px-2.5 flex items-center justify-between bg-[#111316] border-t border-[#282a2d] font-mono text-[9px] uppercase tracking-wider text-[#8a919f]">
        <span>Persistent Selections (3)</span>
        <span className="px-1.5 py-0.5 bg-[#1e2023] text-[#00daf3] rounded font-bold">LOCKED</span>
      </div>
    </aside>
  );
};
