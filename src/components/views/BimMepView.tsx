import React, { useState } from 'react';
import {
  Building2,
  Wind,
  Zap,
  Droplets,
  Flame,
  Sun,
  Layers,
  Calculator,
  Table,
  CheckCircle2,
  Sliders,
  Maximize2,
  Download,
  Printer,
  Plus,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { BoqItem } from '../../types';

export const BimMepView: React.FC = () => {
  const [activeMepTab, setActiveMepTab] = useState<'hvac' | 'electrical' | 'plumbing' | 'fire' | 'energy' | 'boq'>('hvac');

  // HVAC Calculator State
  const [roomArea, setRoomArea] = useState<number>(120); // m²
  const [roomHeight, setRoomHeight] = useState<number>(3.5); // m
  const [occupancy, setOccupancy] = useState<number>(18); // persons
  const [outdoorTemp, setOutdoorTemp] = useState<number>(45); // °C
  const [indoorTemp, setIndoorTemp] = useState<number>(23); // °C
  const [ductAirflow, setDuctAirflow] = useState<number>(2400); // m³/h
  const [ductVelocity, setDuctVelocity] = useState<number>(6.5); // m/s

  // Electrical Calculator State
  const [loadKw, setLoadKw] = useState<number>(45); // kW
  const [voltage, setVoltage] = useState<number>(400); // V (3-phase)
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [cableLength, setCableLength] = useState<number>(65); // m
  const [allowableVdrop, setAllowableVdrop] = useState<number>(3.0); // %

  // BOQ Items
  const [boqList, setBoqList] = useState<BoqItem[]>([
    { id: '1', item: 'CW-01', description: 'Curtain Wall Double Glazed Low-E U=1.4', unit: 'm²', quantity: 450, unitPrice: 180, total: 81000, category: 'Architecture' },
    { id: '2', item: 'HVAC-01', description: 'Galvanized Sheet Steel Ductwork 0.8mm', unit: 'm²', quantity: 820, unitPrice: 42, total: 34440, category: 'HVAC' },
    { id: '3', item: 'HVAC-02', description: 'VRF Outdoor Heat Recovery Unit 28HP', unit: 'EA', quantity: 2, unitPrice: 14500, total: 29000, category: 'HVAC' },
    { id: '4', item: 'ELEC-01', description: 'XLPE/PVC/SWA Copper Cable 4x35 mm²', unit: 'm', quantity: 320, unitPrice: 38, total: 12160, category: 'Electrical' },
    { id: '5', item: 'PLUMB-01', description: 'PPR Hot & Cold Water Supply Pipe DN32', unit: 'm', quantity: 480, unitPrice: 12, total: 5760, category: 'Plumbing' },
    { id: '6', item: 'FIRE-01', description: 'Pendant Quick Response Sprinklers K=80', unit: 'EA', quantity: 140, unitPrice: 22, total: 3080, category: 'Fire' },
  ]);

  // HVAC Calculations
  const roomVolume = roomArea * roomHeight;
  const sensCoolingKw = ((roomArea * 90) + (occupancy * 120) + (roomVolume * (outdoorTemp - indoorTemp) * 1.2 * 1.005 / 3.6)) / 1000;
  const latentCoolingKw = (occupancy * 65) / 1000;
  const totalCoolingKw = sensCoolingKw + latentCoolingKw;
  const totalTons = totalCoolingKw / 3.517;

  // Duct Sizing
  // Q (m³/s) = Airflow / 3600; Area = Q / Velocity
  const flowM3s = ductAirflow / 3600;
  const ductAreaM2 = flowM3s / ductVelocity;
  const ductHeightMm = 300;
  const ductWidthMm = Math.round((ductAreaM2 / (ductHeightMm / 1000)) * 1000);
  const hydraulicDiam = Math.round((2 * ductWidthMm * ductHeightMm) / (ductWidthMm + ductHeightMm));
  const frictionLossPaPerM = (0.02 * (1.2 * Math.pow(ductVelocity, 2)) / (2 * (hydraulicDiam / 1000))).toFixed(2);

  // Electrical Calculations
  // I = P / (sqrt(3) * V * pf)
  const currentAmp = (loadKw * 1000) / (Math.sqrt(3) * voltage * powerFactor);
  // Voltage drop approx: Delta V% = (sqrt(3) * I * L * (R cos phi + X sin phi) / V) * 100
  // Copper R ~ 0.52 ohm/km for 35mm2
  const vDropPct = ((Math.sqrt(3) * currentAmp * (cableLength / 1000) * 0.52 * powerFactor) / voltage) * 100;
  const recommendedBreaker = Math.ceil(currentAmp * 1.25 / 10) * 10;
  const recommendedCable = currentAmp > 120 ? '4x70 mm² Cu' : currentAmp > 80 ? '4x50 mm² Cu' : '4x35 mm² Cu';

  // Total BOQ Sum
  const totalBoqCost = boqList.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Ribbon */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d]">
            <Building2 className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">4M ENGINEERING CLOUD — BIM & MEP SUITE</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#00daf3] rounded">STANDARDS ENGINE</span>
          </div>

          {/* Sub-tabs for BIM/MEP */}
          <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d] text-[10px]">
            {[
              { id: 'hvac', label: 'HVAC Design', icon: Wind },
              { id: 'electrical', label: 'Electrical', icon: Zap },
              { id: 'plumbing', label: 'Plumbing', icon: Droplets },
              { id: 'fire', label: 'Fire Safety', icon: Flame },
              { id: 'energy', label: 'Energy Rating', icon: Sun },
              { id: 'boq', label: 'Quantity Takeoff / BOQ', icon: Table },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMepTab(tab.id as any)}
                className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  activeMepTab === tab.id ? 'bg-[#3491ff] text-white font-bold' : 'text-[#8a919f] hover:text-white'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#8a919f]">Standard:</span>
          <span className="text-[#00daf3] bg-[#111316] px-2 py-0.5 rounded border border-[#282a2d]">
            ASHRAE 90.1 / NFPA 13 / IEC 60364
          </span>
        </div>
      </div>

      {/* Main Module Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* TAB 1: HVAC DESIGN & CALCULATIONS */}
        {activeMepTab === 'hvac' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Room Cooling Load Inputs */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                <span className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#00daf3]" />
                  Cooling & Heating Load Engine
                </span>
                <span className="text-[9px] text-[#00daf3] bg-[#111316] px-1.5 py-0.5 rounded">ASHRAE RTS</span>
              </div>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Room Floor Area:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={roomArea}
                      onChange={(e) => setRoomArea(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m²</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Clear Ceiling Height:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      value={roomHeight}
                      onChange={(e) => setRoomHeight(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Occupancy (Design):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={occupancy}
                      onChange={(e) => setOccupancy(parseInt(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">persons</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Outdoor Summer DB:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={outdoorTemp}
                      onChange={(e) => setOutdoorTemp(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">°C</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Indoor Design Setpoint:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={indoorTemp}
                      onChange={(e) => setIndoorTemp(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">°C</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">CALCULATED COOLING CAPACITY</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Sensible Heat Gain:</span>
                  <span className="text-white font-bold">{sensCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Latent Heat Gain:</span>
                  <span className="text-white font-bold">{latentCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between border-t border-[#282a2d] pt-1">
                  <span className="text-white font-bold">Total Heat Load:</span>
                  <span className="text-[#00daf3] font-bold text-[12px]">{totalCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Required Capacity:</span>
                  <span className="text-[#ffb68b] font-bold">{totalTons.toFixed(2)} TR (Tons)</span>
                </div>
              </div>
            </div>

            {/* Center: Duct Sizing & Aerodynamics */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                <span className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-[#a8c8ff]" />
                  Duct Sizing & Equal Friction Method
                </span>
                <span className="text-[9px] text-[#a8c8ff] bg-[#111316] px-1.5 py-0.5 rounded">SMACNA</span>
              </div>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Design Airflow Rate:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="50"
                      value={ductAirflow}
                      onChange={(e) => setDuctAirflow(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m³/h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Max Allowed Velocity:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={ductVelocity}
                      onChange={(e) => setDuctVelocity(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m/s</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-2 text-[10px]">
                <span className="text-[#a8c8ff] font-bold">OPTIMIZED DUCT DIMENSIONS</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#1e2023] p-1.5 rounded border border-[#282a2d]">
                    <span className="text-[#8a919f] text-[9px] block">WIDTH (W)</span>
                    <span className="text-[14px] text-[#00daf3] font-bold">{ductWidthMm} mm</span>
                  </div>
                  <div className="bg-[#1e2023] p-1.5 rounded border border-[#282a2d]">
                    <span className="text-[#8a919f] text-[9px] block">HEIGHT (H)</span>
                    <span className="text-[14px] text-white font-bold">{ductHeightMm} mm</span>
                  </div>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-[#8a919f]">Hydraulic Diameter (Dh):</span>
                  <span className="text-white font-bold">{hydraulicDiam} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Specific Pressure Loss:</span>
                  <span className="text-[#00daf3] font-bold">{frictionLossPaPerM} Pa/m</span>
                </div>
              </div>

              {/* 3D Duct Cross Section Preview */}
              <div className="h-28 bg-[#111316] rounded border border-[#282a2d] flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 260 100">
                  <rect x="50" y="20" width="160" height="60" fill="#1e2023" stroke="#00daf3" strokeWidth="1.5" />
                  <line x1="50" y1="20" x2="80" y2="5" stroke="#3491ff" strokeWidth="1" />
                  <line x1="210" y1="20" x2="240" y2="5" stroke="#3491ff" strokeWidth="1" />
                  <line x1="80" y1="5" x2="240" y2="5" stroke="#3491ff" strokeWidth="1" />
                  <line x1="210" y1="80" x2="240" y2="65" stroke="#3491ff" strokeWidth="1" />
                  <line x1="240" y1="5" x2="240" y2="65" stroke="#3491ff" strokeWidth="1" />
                  <text x="115" y="55" fill="#00daf3" fontSize="11" fontWeight="bold">
                    {ductWidthMm} × {ductHeightMm}
                  </text>
                </svg>
              </div>
            </div>

            {/* Right: Selected Equipment Schedule */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2">
                HVAC Equipment Selection
              </span>

              <div className="flex flex-col gap-2 text-[10px]">
                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#00daf3]">
                    <span>FCU-L01-01 (Fan Coil Unit)</span>
                    <span>PASS</span>
                  </div>
                  <div className="text-[#8a919f]">Cooling: 14.5 kW | Airflow: 2,450 m³/h | ESP: 75 Pa</div>
                  <div className="text-[#c0c6d6]">Refrigerant: R410A / EC Brushless Motor</div>
                </div>

                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#a8c8ff]">
                    <span>AHU-ROOF-01 (Air Handling Unit)</span>
                    <span>PASS</span>
                  </div>
                  <div className="text-[#8a919f]">Cooling: 120 kW | Airflow: 18,000 m³/h | Heat Recovery 78%</div>
                  <div className="text-[#c0c6d6]">VAV Inverter Fan / F7+H13 Filtration</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ELECTRICAL DESIGN */}
        {activeMepTab === 'electrical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#00daf3]" />
                Three-Phase Load & Sizing Engine
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Total Connected Load:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={loadKw}
                      onChange={(e) => setLoadKw(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">kW</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Nominal Voltage:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={voltage}
                      onChange={(e) => setVoltage(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">V</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Power Factor (cos φ):</span>
                  <input
                    type="number"
                    step="0.05"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(parseFloat(e.target.value) || 0.8)}
                    className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Circuit Run Length:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={cableLength}
                      onChange={(e) => setCableLength(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m</span>
                  </div>
                </div>
              </div>

              {/* Electrical Outputs */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">CIRCUIT ANALYSIS (IEC 60364)</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Design Current (Ib):</span>
                  <span className="text-white font-bold">{currentAmp.toFixed(1)} A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Voltage Drop (ΔV%):</span>
                  <span className={`font-bold ${vDropPct <= allowableVdrop ? 'text-[#34c759]' : 'text-[#ffb4ab]'}`}>
                    {vDropPct.toFixed(2)}% (Max {allowableVdrop}%)
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#282a2d] pt-1">
                  <span className="text-white font-bold">Recommended Breaker:</span>
                  <span className="text-[#00daf3] font-bold text-[12px]">{recommendedBreaker}A MCCB 3P</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">Recommended Conductor:</span>
                  <span className="text-[#ffb68b] font-bold">{recommendedCable}</span>
                </div>
              </div>
            </div>

            {/* Distribution Panel Schedule */}
            <div className="col-span-2 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                <span className="font-bold text-white text-[12px]">Main Distribution Panel (MDB-01 Schedule)</span>
                <span className="text-[9px] text-[#00daf3] bg-[#111316] px-2 py-0.5 rounded">3P+N+PE 400V</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-[#282a2d] text-[#8a919f]">
                      <th className="pb-1">Circuit ID</th>
                      <th className="pb-1">Description</th>
                      <th className="pb-1">Phase</th>
                      <th className="pb-1">Load (kW)</th>
                      <th className="pb-1">Breaker</th>
                      <th className="pb-1">Cable Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282a2d]/50 text-white">
                    <tr>
                      <td className="py-1 text-[#00daf3]">C-01</td>
                      <td>HVAC Chiller Compressor</td>
                      <td>L1, L2, L3</td>
                      <td>45.0</td>
                      <td>80A 3P</td>
                      <td>4x35 mm² Cu</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-[#00daf3]">C-02</td>
                      <td>Level 1 Lighting & Controls</td>
                      <td>L1</td>
                      <td>6.5</td>
                      <td>20A 1P</td>
                      <td>3x4 mm² Cu</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-[#00daf3]">C-03</td>
                      <td>Clean Room Sockets & Server Rack</td>
                      <td>L2</td>
                      <td>8.2</td>
                      <td>25A 1P</td>
                      <td>3x6 mm² Cu</td>
                    </tr>
                    <tr>
                      <td className="py-1 text-[#00daf3]">C-04</td>
                      <td>Fire Pump Duty Feeder</td>
                      <td>L1, L2, L3</td>
                      <td>30.0</td>
                      <td>63A 3P Fire-Rated</td>
                      <td>4x25 mm² FP200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ENERGY RATING DASHBOARD */}
        {activeMepTab === 'energy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col items-center justify-center gap-3 shadow-md">
              <span className="text-white font-bold text-[14px]">Building Energy Efficiency Certificate</span>
              <div className="w-24 h-24 rounded-full bg-[#34c759] flex items-center justify-center text-black text-4xl font-extrabold shadow-[0_0_24px_rgba(52,199,89,0.5)]">
                A
              </div>
              <span className="text-[#34c759] font-bold text-[12px]">ENERGY CLASS A (HIGH EFFICIENCY)</span>
              <span className="text-[#8a919f] text-[10px] text-center">
                Energy Use Intensity: <strong className="text-white">68.4 kWh/m²·year</strong> (Baseline: 140 kWh/m²·year)
              </span>
            </div>

            <div className="col-span-2 bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="text-white font-bold text-[12px] border-b border-[#282a2d] pb-2">
                Annual Consumption Breakdown & CO₂ Emissions
              </span>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d]">
                  <span className="text-[#8a919f] block">COOLING & HEATING</span>
                  <span className="text-[16px] text-[#00daf3] font-bold">34.2 kWh/m²</span>
                  <span className="text-[#8a919f]">50.0% of total</span>
                </div>
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d]">
                  <span className="text-[#8a919f] block">LIGHTING (LED)</span>
                  <span className="text-[16px] text-[#a8c8ff] font-bold">14.8 kWh/m²</span>
                  <span className="text-[#8a919f]">21.6% of total</span>
                </div>
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d]">
                  <span className="text-[#8a919f] block">ANNUAL CO₂ SAVINGS</span>
                  <span className="text-[16px] text-[#34c759] font-bold">-42.5 Tons</span>
                  <span className="text-[#34c759]">Net Zero Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: QUANTITY TAKEOFF / BOQ GENERATOR */}
        {activeMepTab === 'boq' && (
          <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#00daf3]" />
                <span className="font-bold text-white text-[13px]">BIM Automated Bill of Quantities (BOQ)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-[13px]">
                  TOTAL ESTIMATED COST: <span className="text-[#00daf3]">${totalBoqCost.toLocaleString()} USD</span>
                </span>
                <button
                  onClick={() => alert('Exporting BOQ to Excel-compatible CSV & PDF...')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white text-[10px] font-bold rounded shadow transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export BOQ (.csv / .xlsx)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#282a2d] text-[#8a919f] font-bold uppercase text-[9px]">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Unit</th>
                    <th className="pb-2 text-right">Quantity</th>
                    <th className="pb-2 text-right">Unit Price ($)</th>
                    <th className="pb-2 text-right">Total Price ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282a2d]/60 text-white">
                  {boqList.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1e2023] transition-colors">
                      <td className="py-2 text-[#00daf3] font-bold">{row.item}</td>
                      <td className="py-2">{row.description}</td>
                      <td className="py-2 text-[#8a919f]">{row.category}</td>
                      <td className="py-2">{row.unit}</td>
                      <td className="py-2 text-right font-mono">{row.quantity.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono">${row.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-mono font-bold text-[#a8c8ff]">${row.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
