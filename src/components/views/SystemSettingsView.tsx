import React, { useState } from 'react';
import {
  Settings,
  Globe,
  Database,
  Shield,
  Layers,
  Cpu,
  CheckCircle2,
  Sliders,
  Award,
  HardDrive
} from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [activeStandard, setActiveStandard] = useState<'ashrae' | 'eurocode' | 'iec'>('ashrae');
  const [gpuAcceleration, setGpuAcceleration] = useState<boolean>(true);
  const [autoSaveMinutes, setAutoSaveMinutes] = useState<number>(3);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Air (20°C)');

  const materials = [
    { name: 'Air (20°C)', category: 'Fluid', density: '1.204 kg/m³', thermalK: '0.026 W/m·K', viscosity: '1.81e-5 Pa·s' },
    { name: 'Water (Pure, 20°C)', category: 'Fluid', density: '998.2 kg/m³', thermalK: '0.598 W/m·K', viscosity: '1.00e-3 Pa·s' },
    { name: 'Structural Steel (S355)', category: 'Metal', density: '7850 kg/m³', thermalK: '50.0 W/m·K', yieldStrength: '355 MPa' },
    { name: 'Aluminum Alloy (6061-T6)', category: 'Metal', density: '2700 kg/m³', thermalK: '167 W/m·K', yieldStrength: '276 MPa' },
    { name: 'Reinforced Concrete (C30/37)', category: 'Solid', density: '2400 kg/m³', thermalK: '1.65 W/m·K', compStrength: '30 MPa' },
    { name: 'Double Glazed Low-E Glass', category: 'Envelope', density: '2500 kg/m³', thermalK: '0.96 W/m·K', uValue: '1.40 W/m²·K' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-y-auto bg-[#0c0e11] text-[#e2e2e6] select-none font-mono p-4">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-[#282a2d] pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00daf3]" />
            <span className="font-bold text-white text-base">4M Engineering Cloud — System Preferences & Standards</span>
          </div>
          <span className="text-[10px] text-[#34c759] bg-[#111316] px-2 py-1 rounded border border-[#34c759]/40">
            ENGINE VERSION 2026.4
          </span>
        </div>

        {/* Platform & Developer Information Card */}
        <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00daf3]" />
              <span className="font-bold text-white text-[12px]">Platform Architecture & Developer Information</span>
            </div>
            <span className="text-[9px] text-[#34c759] bg-[#111316] px-2 py-0.5 rounded border border-[#34c759]/40">
              OFFICIAL RELEASE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
            <div className="bg-[#111316] p-3 rounded border border-[#3491ff]/30 flex flex-col gap-1">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold tracking-wider">Lead Software Architect & Developer</span>
              <span className="text-[14px] text-[#00daf3] font-bold">Eng. Alaa Mohammed</span>
              <span className="text-[#c0c6d6] text-[10px]">م. علاء محمد — Principal CAE / BIM Systems Engineer</span>
            </div>
            <div className="bg-[#111316] p-3 rounded border border-[#282a2d] flex flex-col gap-1">
              <span className="text-[#8a919f] text-[9px] uppercase font-bold tracking-wider">Engineering Suite</span>
              <span className="text-white font-bold text-[13px]">4M Engineering Cloud 2026</span>
              <span className="text-[#8a919f] text-[10px]">Full-Stack Web CAD, BIM, MEP & Multi-Physics Simulation</span>
            </div>
          </div>
        </div>

        {/* Units Configuration */}
        <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3491ff]" />
              <span className="font-bold text-white text-[12px]">Engineering Unit System</span>
            </div>
            <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d] text-[10px]">
              <button
                onClick={() => setUnitSystem('metric')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unitSystem === 'metric' ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f]'
                }`}
              >
                SI / Metric (m, mm, Pa, kW, °C)
              </button>
              <button
                onClick={() => setUnitSystem('imperial')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  unitSystem === 'imperial' ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f]'
                }`}
              >
                Imperial (ft, in, psi, BTU/h, °F)
              </button>
            </div>
          </div>
          <p className="text-[#8a919f] text-[10px] leading-relaxed">
            All internal solver states utilize SI units (meters, seconds, Pascals, Kilograms). Interactive viewports, dimensions, and reporting tables reflect user preferences.
          </p>
        </div>

        {/* Engineering Standards Engine */}
        <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00daf3]" />
            <span className="font-bold text-white text-[12px]">Regulatory Standards & Design Codes</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            {[
              { id: 'ashrae', name: 'ASHRAE / NFPA / IBC (US & International)', desc: 'ASHRAE 90.1 / 62.1, NFPA 13 Sprinklers, NEC 70' },
              { id: 'eurocode', name: 'Eurocodes / EN Standards', desc: 'EN 1990 - 1999 Structural, EN 12831 Heating, EN 12464 Lighting' },
              { id: 'iec', name: 'IEC / ISO Comprehensive', desc: 'IEC 60364 Low Voltage, ISO 14001, ISO 52000 Energy' },
            ].map((std) => (
              <div
                key={std.id}
                onClick={() => setActiveStandard(std.id as any)}
                className={`p-3 rounded border transition-colors cursor-pointer flex flex-col justify-between gap-1.5 ${
                  activeStandard === std.id
                    ? 'bg-[#1e2023] border-[#00daf3] shadow-sm'
                    : 'bg-[#111316] border-[#282a2d] hover:bg-[#1e2023]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white text-[11px]">
                  <span>{std.name}</span>
                  {activeStandard === std.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#00daf3]" />}
                </div>
                <span className="text-[#8a919f] text-[9px] leading-relaxed">{std.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Certified Materials Database */}
        <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#a8c8ff]" />
              <span className="font-bold text-white text-[12px]">Certified Materials Database</span>
            </div>
            <span className="text-[9px] text-[#00daf3] bg-[#111316] px-2 py-0.5 rounded">6 Active Standards</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#282a2d] text-[#8a919f] text-[9px] font-bold uppercase">
                  <th className="pb-1.5">Material Name</th>
                  <th className="pb-1.5">Category</th>
                  <th className="pb-1.5">Density</th>
                  <th className="pb-1.5">Thermal Cond. (k)</th>
                  <th className="pb-1.5">Key Mechanical / Viscous Property</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282a2d]/50 text-white">
                {materials.map((mat, i) => (
                  <tr
                    key={i}
                    onClick={() => setSelectedMaterial(mat.name)}
                    className={`cursor-pointer transition-colors ${
                      selectedMaterial === mat.name ? 'bg-[#282a2d]' : 'hover:bg-[#1e2023]'
                    }`}
                  >
                    <td className="py-2 text-[#00daf3] font-bold">{mat.name}</td>
                    <td className="py-2 text-[#8a919f]">{mat.category}</td>
                    <td className="py-2 font-mono">{mat.density}</td>
                    <td className="py-2 font-mono">{mat.thermalK}</td>
                    <td className="py-2 font-mono text-[#ffb68b]">
                      {mat.viscosity || mat.yieldStrength || mat.compStrength || mat.uValue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
