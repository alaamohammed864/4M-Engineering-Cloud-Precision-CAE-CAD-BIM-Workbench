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
  AlertTriangle,
  Compass,
  FileSpreadsheet,
  HelpCircle,
  FileCheck,
  ShieldCheck,
  Fuel,
  ArrowUpDown,
  Search,
  Eye,
  Check,
  Layout,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { BoqItem } from '../../types';

type BimMepTab =
  | 'arch'
  | 'hvac'
  | 'electrical'
  | 'plumbing'
  | 'fire'
  | 'gas'
  | 'elevator'
  | 'clash'
  | 'energy'
  | 'sheets'
  | 'boq';

interface ClashItem {
  id: string;
  itemA: string;
  itemB: string;
  disciplineA: 'Architecture' | 'Structure' | 'HVAC' | 'Plumbing' | 'Electrical' | 'Fire';
  disciplineB: 'Architecture' | 'Structure' | 'HVAC' | 'Plumbing' | 'Electrical' | 'Fire';
  location: string;
  level: string;
  severity: 'Critical' | 'Moderate' | 'Minor';
  status: 'Open' | 'Resolved' | 'Ignored';
  clearanceMm: number;
}

export const BimMepView: React.FC = () => {
  const [activeMepTab, setActiveMepTab] = useState<BimMepTab>('arch');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'IQD'>('USD');

  // Currency multiplier
  const currencyRate = currency === 'USD' ? 1.0 : currency === 'EUR' ? 0.92 : 1310;
  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'IQD ';

  // ==========================================
  // ARCHITECTURAL BIM & 3-FLOOR DEMO STATE
  // ==========================================
  const [selectedLevel, setSelectedLevel] = useState<'L0' | 'L1' | 'L2' | 'Roof'>('L1');
  const [selectedBimElement, setSelectedBimElement] = useState<string>('WALL-L01-EXT-01');

  const demoLevels = [
    { id: 'L0', name: 'Level 00 (Ground Floor)', elevation: '0.00 m', height: '3.80 m', area: '450 m²', rooms: 6 },
    { id: 'L1', name: 'Level 01 (First Floor)', elevation: '+3.80 m', height: '3.50 m', area: '450 m²', rooms: 8 },
    { id: 'L2', name: 'Level 02 (Executive & Lab)', elevation: '+7.30 m', height: '3.50 m', area: '450 m²', rooms: 7 },
    { id: 'Roof', name: 'Roof & Plant Room', elevation: '+10.80 m', height: '3.00 m', area: '450 m²', rooms: 2 },
  ];

  const demoRooms = [
    { id: 'RM-101', name: 'Mechanical Plant / Server Room', area: 45, occupancy: 2, fcu: 'FCU-101', lux: 400, floor: 'Vinyl Conductive' },
    { id: 'RM-102', name: 'Open Office Workspace', area: 180, occupancy: 24, fcu: 'FCU-102 / 103', lux: 500, floor: 'Carpet Tile' },
    { id: 'RM-103', name: 'Executive Conference Hall', area: 65, occupancy: 16, fcu: 'FCU-104', lux: 450, floor: 'Parquet Hardwood' },
    { id: 'RM-104', name: 'Engineering R&D CAD Lab', area: 90, occupancy: 12, fcu: 'FCU-105', lux: 600, floor: 'Anti-Static Epoxy' },
    { id: 'RM-105', name: 'Restrooms & Wet Services', area: 35, occupancy: 4, fcu: 'Exhaust Fan', lux: 300, floor: 'Ceramic Tile Non-Slip' },
    { id: 'RM-106', name: 'Stairwell & Lift Lobby', area: 35, occupancy: 6, fcu: 'Pressurized', lux: 200, floor: 'Polished Granite' },
  ];

  // ==========================================
  // HVAC CALCULATOR STATE
  // ==========================================
  const [roomArea, setRoomArea] = useState<number>(120); // m²
  const [roomHeight, setRoomHeight] = useState<number>(3.5); // m
  const [occupancy, setOccupancy] = useState<number>(18); // persons
  const [outdoorTemp, setOutdoorTemp] = useState<number>(46); // °C
  const [indoorTemp, setIndoorTemp] = useState<number>(23); // °C
  const [ductAirflow, setDuctAirflow] = useState<number>(2400); // m³/h
  const [ductVelocity, setDuctVelocity] = useState<number>(6.5); // m/s
  const [ductShape, setDuctShape] = useState<'rectangular' | 'circular'>('rectangular');

  // HVAC calculations
  const roomVolume = roomArea * roomHeight;
  const sensCoolingKw = ((roomArea * 95) + (occupancy * 125) + (roomVolume * (outdoorTemp - indoorTemp) * 1.2 * 1.005 / 3.6)) / 1000;
  const latentCoolingKw = (occupancy * 70) / 1000;
  const totalCoolingKw = sensCoolingKw + latentCoolingKw;
  const totalTons = totalCoolingKw / 3.517;

  // Duct sizing
  const flowM3s = ductAirflow / 3600;
  const ductAreaM2 = flowM3s / ductVelocity;
  const ductHeightMm = 300;
  const ductWidthMm = Math.round((ductAreaM2 / (ductHeightMm / 1000)) * 1000);
  const circularDuctDiamMm = Math.round(Math.sqrt((4 * ductAreaM2) / Math.PI) * 1000);
  const hydraulicDiam = Math.round((2 * ductWidthMm * ductHeightMm) / (ductWidthMm + ductHeightMm));
  const frictionLossPaPerM = (0.02 * (1.2 * Math.pow(ductVelocity, 2)) / (2 * (hydraulicDiam / 1000))).toFixed(2);

  // ==========================================
  // ELECTRICAL CALCULATOR STATE
  // ==========================================
  const [loadKw, setLoadKw] = useState<number>(55); // kW
  const [voltage, setVoltage] = useState<number>(400); // V
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [cableLength, setCableLength] = useState<number>(75); // m
  const [allowableVdrop, setAllowableVdrop] = useState<number>(3.0); // %

  const currentAmp = (loadKw * 1000) / (Math.sqrt(3) * voltage * powerFactor);
  const vDropPct = ((Math.sqrt(3) * currentAmp * (cableLength / 1000) * 0.46 * powerFactor) / voltage) * 100;
  const recommendedBreaker = Math.ceil((currentAmp * 1.25) / 10) * 10;
  const recommendedCable =
    currentAmp > 160 ? '4x95 mm² Cu/XLPE' : currentAmp > 120 ? '4x70 mm² Cu/XLPE' : currentAmp > 80 ? '4x50 mm² Cu/XLPE' : '4x35 mm² Cu/XLPE';

  // ==========================================
  // PLUMBING & SANITARY DESIGN STATE
  // ==========================================
  const [fixtureUnitsWSFU, setFixtureUnitsWSFU] = useState<number>(85); // WSFU
  const [buildingOccupants, setBuildingOccupants] = useState<number>(120); // persons
  const [waterPressureBar, setWaterPressureBar] = useState<number>(3.5); // bar
  const [drainageDFU, setDrainageDFU] = useState<number>(140); // DFU

  // Plumbing equations
  // Hunter curve approx: Q (L/s) ≈ 0.25 * sqrt(WSFU) for flush valves
  const waterDemandLs = (0.28 * Math.sqrt(fixtureUnitsWSFU)).toFixed(2);
  const waterDemandM3h = (parseFloat(waterDemandLs) * 3.6).toFixed(2);
  // Domestic water daily storage: 150 L/person/day for commercial + 20% safety factor
  const dailyConsumptionLiters = buildingOccupants * 140;
  const storageTankCapacityM3 = (dailyConsumptionLiters / 1000) * 1.2;
  // Water supply pipe sizing at 1.8 m/s:
  const pipeInternalDiamMm = Math.round(Math.sqrt((4 * (parseFloat(waterDemandLs) / 1000)) / (Math.PI * 1.8)) * 1000);
  const recommendedWaterPipeDN = pipeInternalDiamMm <= 20 ? 'DN25 (1")' : pipeInternalDiamMm <= 32 ? 'DN40 (1½")' : pipeInternalDiamMm <= 50 ? 'DN50 (2")' : 'DN65 (2½")';
  const boosterPumpHeadMeters = (waterPressureBar * 10.2 + 10.8 * 1.2).toFixed(1); // pressure head + static lift + friction

  // ==========================================
  // FIRE PROTECTION (NFPA 13) STATE
  // ==========================================
  const [hazardClass, setHazardClass] = useState<'light' | 'ordinary1' | 'ordinary2'>('ordinary1');
  const [fireAreaM2, setFireAreaM2] = useState<number>(1350); // Total floor coverage m²

  const hazardConfig = {
    light: { name: 'Light Hazard (Offices, Schools)', densityGpm: 0.10, densityMmMin: 4.1, areaOfOperationM2: 139, sprinklerSpacingM2: 15.0 },
    ordinary1: { name: 'Ordinary Hazard Group 1 (Commercial/Labs)', densityGpm: 0.15, densityMmMin: 6.1, areaOfOperationM2: 139, sprinklerSpacingM2: 12.0 },
    ordinary2: { name: 'Ordinary Hazard Group 2 (Storage/Manufacturing)', densityGpm: 0.20, densityMmMin: 8.2, areaOfOperationM2: 139, sprinklerSpacingM2: 10.0 },
  };

  const currentHazard = hazardConfig[hazardClass];
  const requiredSprinklers = Math.ceil(fireAreaM2 / currentHazard.sprinklerSpacingM2);
  // Fire Pump flow: Q = Area of Operation * Density + Hose stream allowance
  const designFlowGpm = Math.round((currentHazard.areaOfOperationM2 * 10.764 * currentHazard.densityGpm) + 250);
  const designFlowLs = (designFlowGpm * 0.06309).toFixed(1);
  const fireWaterTankVolumeM3 = Math.round((designFlowGpm * 3.785 * 60) / 1000); // 60 minutes duration

  // ==========================================
  // FUEL GAS SYSTEM STATE
  // ==========================================
  const [gasLoadKw, setGasLoadKw] = useState<number>(180); // Commercial kitchen + boilers
  const [gasSupplyPressureMbar, setGasSupplyPressureMbar] = useState<number>(25); // 20-30 mbar low pressure
  const [gasPipeLengthM, setGasPipeLengthM] = useState<number>(45);

  // Gas flow: Q (m³/h) = Gas Load (kW) / (10.5 kWh/m³ natural gas calorific value)
  const gasFlowM3h = (gasLoadKw / 10.5).toFixed(1);
  const gasPipeDN = parseFloat(gasFlowM3h) > 25 ? 'DN50 (2") Schedule 40' : parseFloat(gasFlowM3h) > 12 ? 'DN40 (1½") Schedule 40' : 'DN32 (1¼") Schedule 40';

  // ==========================================
  // ELEVATOR / LIFT DESIGN STATE
  // ==========================================
  const [liftCapacityPersons, setLiftCapacityPersons] = useState<number>(13); // 1000 kg
  const [liftSpeedMs, setLiftSpeedMs] = useState<number>(1.75); // m/s
  const [liftFloors, setLiftFloors] = useState<number>(4);
  const [travelHeightM, setTravelHeightM] = useState<number>(10.8);

  const roundTripTimeSec = Math.round((2 * travelHeightM) / liftSpeedMs + (liftFloors * 7.5) + (liftCapacityPersons * 1.8));
  const fiveMinHandlingCapacity = Math.round(((300 * liftCapacityPersons) / roundTripTimeSec) * 0.8);
  const liftWaitingTimeSec = Math.round(roundTripTimeSec / 2); // 2 cars bank

  // ==========================================
  // CLASH DETECTION MATRIX STATE
  // ==========================================
  const [clashes, setClashes] = useState<ClashItem[]>([
    { id: 'CLASH-01', itemA: 'Duct-HVAC-Supply-600x350', itemB: 'Structural-Beam-SB-04', disciplineA: 'HVAC', disciplineB: 'Structure', location: 'Grid C-3 / Level 01', level: 'Level 01', severity: 'Critical', status: 'Open', clearanceMm: -45 },
    { id: 'CLASH-02', itemA: 'PPR-Cold-Water-DN50', itemB: 'Cable-Tray-EL-300', disciplineA: 'Plumbing', disciplineB: 'Electrical', location: 'Corridor Corridor-102', level: 'Level 01', severity: 'Moderate', status: 'Open', clearanceMm: 12 },
    { id: 'CLASH-03', itemA: 'Fire-Sprinkler-Branch-DN32', itemB: 'False-Ceiling-Drop-Gypsum', disciplineA: 'Fire', disciplineB: 'Architecture', location: 'Executive Conf Room 103', level: 'Level 01', severity: 'Minor', status: 'Resolved', clearanceMm: 65 },
    { id: 'CLASH-04', itemA: 'Sanitary-Drain-Soil-DN100', itemB: 'Reinforced-Concrete-Column-C2', disciplineA: 'Plumbing', disciplineB: 'Structure', location: 'Restroom Wet Duct 105', level: 'Level 00', severity: 'Critical', status: 'Open', clearanceMm: -80 },
  ]);

  // ==========================================
  // DRAWING SHEETS STATE
  // ==========================================
  const [sheetSize, setSheetSize] = useState<'A0' | 'A1' | 'A2' | 'A3'>('A1');
  const [drawingScale, setDrawingScale] = useState<string>('1:100');
  const [sheetTitle, setSheetTitle] = useState<string>('LEVEL 01 — INTEGRATED HVAC & MEP COMPOSITE PLAN');
  const [drawingNumber, setDrawingNumber] = useState<string>('4M-MEP-L01-1002');
  const [drawingRevision, setDrawingRevision] = useState<string>('REV B');

  // ==========================================
  // BOQ ITEMS
  // ==========================================
  const [boqList, setBoqList] = useState<BoqItem[]>([
    { id: '1', item: 'CW-01', description: 'Curtain Wall Double Glazed Low-E U=1.4', unit: 'm²', quantity: 450, unitPrice: 180, total: 81000, category: 'Structural' },
    { id: '2', item: 'HVAC-01', description: 'Galvanized Sheet Steel Ductwork 0.8mm', unit: 'm²', quantity: 820, unitPrice: 42, total: 34440, category: 'HVAC' },
    { id: '3', item: 'HVAC-02', description: 'VRF Outdoor Heat Recovery Unit 28HP', unit: 'EA', quantity: 2, unitPrice: 14500, total: 29000, category: 'HVAC' },
    { id: '4', item: 'ELEC-01', description: 'XLPE/PVC/SWA Copper Cable 4x35 mm²', unit: 'm', quantity: 320, unitPrice: 38, total: 12160, category: 'Electrical' },
    { id: '5', item: 'PLUMB-01', description: 'PPR Hot & Cold Water Supply Pipe DN32', unit: 'm', quantity: 480, unitPrice: 12, total: 5760, category: 'Plumbing' },
    { id: '6', item: 'FIRE-01', description: 'Pendant Quick Response Sprinklers K=80', unit: 'EA', quantity: 140, unitPrice: 22, total: 3080, category: 'Fire Protection' },
    { id: '7', item: 'LIFT-01', description: 'MRL Passenger Traction Elevator 1000kg 1.75m/s', unit: 'SET', quantity: 2, unitPrice: 38000, total: 76000, category: 'Structural' },
    { id: '8', item: 'GAS-01', description: 'Schedule 40 Carbon Steel Gas Piping DN50 with Regulators', unit: 'm', quantity: 75, unitPrice: 45, total: 3375, category: 'Plumbing' },
  ]);

  const totalBoqCostUsd = boqList.reduce((acc, curr) => acc + curr.total, 0);
  const totalBoqConverted = (totalBoqCostUsd * currencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-[#0c0e11] text-[#e2e2e6] select-none font-mono">
      {/* Secondary Context & Disciplines Ribbon */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1a1c1f] border-b border-[#282a2d] z-10 text-[11px]">
        <div className="flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 bg-[#1e2023] px-2 py-0.5 rounded border border-[#282a2d] shrink-0">
            <Building2 className="w-3.5 h-3.5 text-[#00daf3]" />
            <span className="text-[#e2e2e6] font-medium">4M ENGINEERING CLOUD — CAD / BIM / MEP PLATFORM</span>
            <span className="text-[9px] px-1 py-0.2 bg-[#37393d] text-[#00daf3] rounded font-mono">
              SUITE 2026
            </span>
          </div>

          {/* Sub-tabs for BIM/MEP */}
          <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d] text-[10px] shrink-0">
            {[
              { id: 'arch', label: 'Arch BIM & 3D Levels', icon: Layers },
              { id: 'hvac', label: 'HVAC Design', icon: Wind },
              { id: 'electrical', label: 'Electrical', icon: Zap },
              { id: 'plumbing', label: 'Plumbing & Sanitary', icon: Droplets },
              { id: 'fire', label: 'Fire Safety (NFPA)', icon: Flame },
              { id: 'gas', label: 'Fuel Gas', icon: Fuel },
              { id: 'elevator', label: 'Elevator / Lift', icon: ArrowUpDown },
              { id: 'clash', label: 'Clash Detection', icon: AlertTriangle },
              { id: 'energy', label: 'Energy Rating', icon: Sun },
              { id: 'sheets', label: 'Drawing Sheets', icon: Layout },
              { id: 'boq', label: 'Quantity Takeoff / BOQ', icon: Table },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMepTab(tab.id as BimMepTab)}
                className={`px-2 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap ${
                  activeMepTab === tab.id ? 'bg-[#3491ff] text-white font-bold shadow-sm' : 'text-[#8a919f] hover:text-white'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[10px] shrink-0">
          <span className="text-[#8a919f]">Codes:</span>
          <span className="text-[#00daf3] bg-[#111316] px-1.5 py-0.5 rounded border border-[#282a2d]">
            ASHRAE 90.1 / NFPA 13 / IEC 60364 / IPC 2024
          </span>
        </div>
      </div>

      {/* Mandatory Engineering Disclaimer Notice (Section 112) */}
      <div className="bg-[#1e1a14] border-b border-[#ffb68b]/30 px-3 py-1 flex items-center justify-between text-[9px] text-[#ffb68b]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#ffb68b] shrink-0" />
          <span>
            <strong>PROFESSIONAL ENGINEERING DISCLAIMER:</strong> All engineering calculations (HVAC, Electrical, Plumbing, Fire, Energy) are design aids subject to formal verification, review, and stamp by a licensed professional engineer (PE) according to applicable national and regional building codes.
          </span>
        </div>
        <span className="text-[8px] bg-black/40 px-1.5 py-0.5 rounded text-[#a8c8ff]">NON-CERTIFIED DRAFT</span>
      </div>

      {/* Main Module Body */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* ==================================================== */}
        {/* TAB: ARCHITECTURAL BIM & 3-FLOOR DEMO MODEL         */}
        {/* ==================================================== */}
        {activeMepTab === 'arch' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Left: Level Hierarchy & Room Tree */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                <span className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#00daf3]" />
                  Building Levels Hierarchy
                </span>
                <span className="text-[9px] text-[#34c759] bg-[#111316] px-1.5 py-0.5 rounded">4 STOREYS</span>
              </div>

              <div className="flex flex-col gap-1.5">
                {demoLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id as any)}
                    className={`p-2 rounded border text-left flex flex-col gap-0.5 text-[10px] cursor-pointer transition-colors ${
                      selectedLevel === lvl.id
                        ? 'bg-[#282a2d] border-[#00daf3] text-white font-bold'
                        : 'bg-[#111316] border-[#282a2d] text-[#8a919f] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white">{lvl.name}</span>
                      <span className="text-[#00daf3]">{lvl.elevation}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-[#8a919f]">
                      <span>Height: {lvl.height}</span>
                      <span>{lvl.rooms} Rooms | {lvl.area}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Element Properties Inspector */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-2 text-[10px]">
                <span className="text-white font-bold border-b border-[#282a2d] pb-1">BIM Element Inspector</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Selected Element:</span>
                  <span className="text-[#00daf3] font-bold">{selectedBimElement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Type:</span>
                  <span className="text-white">Exterior Insulated Cavity Wall</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Thickness:</span>
                  <span className="text-white">280 mm (100mm Block + 80mm PIR + 100mm Brick)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Thermal U-Value:</span>
                  <span className="text-[#34c759] font-bold">0.18 W/m²·K (Passes ASHRAE 90.1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Fire Resistance:</span>
                  <span className="text-white">REI 120 (2 Hours)</span>
                </div>
              </div>
            </div>

            {/* Center: 2D/3D Architectural Floor Plan Interactive Canvas */}
            <div className="col-span-2 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-2 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-[12px]">
                    Interactive BIM Floor Plan: {demoLevels.find((l) => l.id === selectedLevel)?.name}
                  </span>
                  <span className="text-[9px] text-[#a8c8ff] bg-[#111316] px-1.5 py-0.5 rounded">
                    SCALE 1:100
                  </span>
                </div>
                <span className="text-[9px] text-[#8a919f]">Click room or wall to inspect parameters</span>
              </div>

              {/* Architectural Plan SVG */}
              <div className="h-[380px] bg-[#0c0e11] rounded border border-[#282a2d] relative overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 650 360">
                  <defs>
                    <pattern id="arch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f2226" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="650" height="360" fill="url(#arch-grid)" />

                  {/* Structural Grids Lines */}
                  {['A', 'B', 'C', 'D'].map((g, i) => (
                    <g key={g}>
                      <line x1={80 + i * 160} y1="20" x2={80 + i * 160} y2="340" stroke="#33383f" strokeDasharray="4 4" strokeWidth="1" />
                      <circle cx={80 + i * 160} cy="20" r="10" fill="#1e2023" stroke="#8a919f" />
                      <text x={80 + i * 160} y="24" fill="#00daf3" fontSize="9" fontWeight="bold" textAnchor="middle">{g}</text>
                    </g>
                  ))}
                  {['1', '2', '3'].map((n, i) => (
                    <g key={n}>
                      <line x1="40" y1={60 + i * 120} x2="600" y2={60 + i * 120} stroke="#33383f" strokeDasharray="4 4" strokeWidth="1" />
                      <circle cx="40" cy={60 + i * 120} r="10" fill="#1e2023" stroke="#8a919f" />
                      <text x="40" y={64 + i * 120} fill="#00daf3" fontSize="9" fontWeight="bold" textAnchor="middle">{n}</text>
                    </g>
                  ))}

                  {/* Exterior Perimeter Walls */}
                  <rect x="80" y="60" width="480" height="240" fill="none" stroke="#ffffff" strokeWidth="6" />

                  {/* Interior Partitions */}
                  <line x1="240" y1="60" x2="240" y2="300" stroke="#a8c8ff" strokeWidth="4" />
                  <line x1="400" y1="60" x2="400" y2="300" stroke="#a8c8ff" strokeWidth="4" />
                  <line x1="80" y1="180" x2="240" y2="180" stroke="#a8c8ff" strokeWidth="4" />
                  <line x1="400" y1="180" x2="560" y2="180" stroke="#a8c8ff" strokeWidth="4" />

                  {/* Door Openings & Swings */}
                  {/* Door 1 */}
                  <line x1="140" y1="180" x2="165" y2="180" stroke="#0c0e11" strokeWidth="5" />
                  <path d="M 140 180 A 25 25 0 0 1 165 155" fill="none" stroke="#00daf3" strokeWidth="1.5" strokeDasharray="2 2" />
                  {/* Door 2 */}
                  <line x1="240" y1="120" x2="240" y2="145" stroke="#0c0e11" strokeWidth="5" />
                  <path d="M 240 120 A 25 25 0 0 1 265 145" fill="none" stroke="#00daf3" strokeWidth="1.5" strokeDasharray="2 2" />

                  {/* Window Openings */}
                  <line x1="120" y1="60" x2="180" y2="60" stroke="#00daf3" strokeWidth="4" />
                  <line x1="280" y1="60" x2="360" y2="60" stroke="#00daf3" strokeWidth="4" />
                  <line x1="440" y1="60" x2="520" y2="60" stroke="#00daf3" strokeWidth="4" />

                  {/* Room Tags & Labels */}
                  <g transform="translate(160, 110)">
                    <rect x="-60" y="-18" width="120" height="34" rx="3" fill="#1e2023" stroke="#282a2d" opacity="0.9" />
                    <text x="0" y="-4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">RM-101 (Server)</text>
                    <text x="0" y="10" fill="#00daf3" fontSize="8" textAnchor="middle">45.0 m² | FCU-101</text>
                  </g>

                  <g transform="translate(320, 170)">
                    <rect x="-70" y="-20" width="140" height="38" rx="3" fill="#1e2023" stroke="#282a2d" opacity="0.9" />
                    <text x="0" y="-6" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">RM-102 (Open Office)</text>
                    <text x="0" y="8" fill="#34c759" fontSize="8" textAnchor="middle">180.0 m² | 24 Persons</text>
                  </g>

                  <g transform="translate(480, 110)">
                    <rect x="-65" y="-18" width="130" height="34" rx="3" fill="#1e2023" stroke="#282a2d" opacity="0.9" />
                    <text x="0" y="-4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">RM-103 (Conference)</text>
                    <text x="0" y="10" fill="#00daf3" fontSize="8" textAnchor="middle">65.0 m² | 16 Persons</text>
                  </g>

                  <g transform="translate(160, 240)">
                    <rect x="-60" y="-18" width="120" height="34" rx="3" fill="#1e2023" stroke="#282a2d" opacity="0.9" />
                    <text x="0" y="-4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">RM-104 (R&D Lab)</text>
                    <text x="0" y="10" fill="#00daf3" fontSize="8" textAnchor="middle">90.0 m² | Anti-Static</text>
                  </g>

                  <g transform="translate(480, 240)">
                    <rect x="-60" y="-18" width="120" height="34" rx="3" fill="#1e2023" stroke="#282a2d" opacity="0.9" />
                    <text x="0" y="-4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">RM-105 (Services)</text>
                    <text x="0" y="10" fill="#ffb68b" fontSize="8" textAnchor="middle">35.0 m² | Wet Duct</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Right: Room Schedule & Area Takeoff */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-2 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-1.5">
                Room Schedule & Finishes
              </span>

              <div className="flex-1 overflow-y-auto max-h-[380px] flex flex-col gap-2">
                {demoRooms.map((rm) => (
                  <div key={rm.id} className="bg-[#111316] p-2 rounded border border-[#282a2d] text-[10px] flex flex-col gap-0.5">
                    <div className="flex justify-between font-bold">
                      <span className="text-[#00daf3]">{rm.id}: {rm.name}</span>
                      <span className="text-white">{rm.area} m²</span>
                    </div>
                    <div className="flex justify-between text-[#8a919f] text-[9px]">
                      <span>Occupants: {rm.occupancy}</span>
                      <span>Target Lux: {rm.lux} lm/m²</span>
                    </div>
                    <div className="text-[9px] text-[#c0c6d6]">
                      Finish: <span className="text-[#a8c8ff]">{rm.floor}</span> | HVAC: <span className="text-[#34c759]">{rm.fcu}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 1: HVAC DESIGN & CALCULATIONS                   */}
        {/* ==================================================== */}
        {activeMepTab === 'hvac' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                  <span className="text-[#8a919f]">Indoor Setpoint DB:</span>
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
                <span className="text-[#00daf3] font-bold">LOAD CALCULATION BREAKDOWN</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Sensible Heat Load:</span>
                  <span className="text-white font-bold">{sensCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Latent Heat Load:</span>
                  <span className="text-white font-bold">{latentCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between border-t border-[#282a2d] pt-1">
                  <span className="text-white font-bold">Total Space Cooling:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">{totalCoolingKw.toFixed(2)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white font-bold">Refrigeration Tonnage:</span>
                  <span className="text-[#00daf3] font-bold text-[12px]">{totalTons.toFixed(2)} TR</span>
                </div>
              </div>
            </div>

            {/* Center: Duct Sizing Engine */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
                <span className="font-bold text-white text-[12px] flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-[#00daf3]" />
                  Duct Sizing & Aerodynamics
                </span>
                <div className="flex items-center gap-1 text-[9px]">
                  <button
                    onClick={() => setDuctShape('rectangular')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${ductShape === 'rectangular' ? 'bg-[#3491ff] text-white' : 'bg-[#111316] text-[#8a919f]'}`}
                  >
                    Rect
                  </button>
                  <button
                    onClick={() => setDuctShape('circular')}
                    className={`px-1.5 py-0.5 rounded cursor-pointer ${ductShape === 'circular' ? 'bg-[#3491ff] text-white' : 'bg-[#111316] text-[#8a919f]'}`}
                  >
                    Round
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Airflow Volume (Q):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="100"
                      value={ductAirflow}
                      onChange={(e) => setDuctAirflow(parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m³/h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Design Velocity (V):</span>
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

              {/* Sizing Results */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">OPTIMIZED DUCT CROSS-SECTION</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Recommended Size:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">
                    {ductShape === 'rectangular' ? `${ductWidthMm} × ${ductHeightMm} mm` : `Ø ${circularDuctDiamMm} mm Spiral`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Hydraulic Diameter:</span>
                  <span className="text-white font-bold">{hydraulicDiam} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Friction Pressure Loss:</span>
                  <span className="text-[#ffb68b] font-bold">{frictionLossPaPerM} Pa/m</span>
                </div>
              </div>

              {/* Duct Graphic Visualization */}
              <div className="h-28 bg-[#111316] rounded border border-[#282a2d] flex items-center justify-center">
                <svg className="w-full h-full max-w-[240px]" viewBox="0 0 240 100">
                  <rect x="30" y="20" width="180" height="60" fill="#1e2023" stroke="#00daf3" strokeWidth="2" rx="4" />
                  <line x1="30" y1="50" x2="210" y2="50" stroke="#3491ff" strokeDasharray="3 3" strokeWidth="1" />
                  <polygon points="120,47 130,50 120,53" fill="#3491ff" />
                  <text x="120" y="40" fill="#ffffff" fontSize="9" textAnchor="middle">
                    {ductAirflow} m³/h @ {ductVelocity} m/s
                  </text>
                  <text x="120" y="70" fill="#00daf3" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {ductShape === 'rectangular' ? `${ductWidthMm}W × ${ductHeightMm}H` : `Ø ${circularDuctDiamMm} mm`}
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

                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#34c759]">
                    <span>CHILLER-01 (Air-Cooled Screw)</span>
                    <span>PASS</span>
                  </div>
                  <div className="text-[#8a919f]">Capacity: 250 TR (880 kW) | COP: 3.42 | Refrigerant R1234ze</div>
                  <div className="text-[#c0c6d6]">Dual Variable-Speed Compressors</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: ELECTRICAL DESIGN & LOAD SIZING              */}
        {/* ==================================================== */}
        {activeMepTab === 'electrical' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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
                  <tbody className="divide-y divide-[#282a2d]/50 text-white font-mono">
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
                    <tr>
                      <td className="py-1 text-[#00daf3]">C-05</td>
                      <td>Passenger Elevator Traction Drive</td>
                      <td>L1, L2, L3</td>
                      <td>18.5</td>
                      <td>40A 3P</td>
                      <td>4x16 mm² Cu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: PLUMBING & SANITARY DESIGN                   */}
        {/* ==================================================== */}
        {activeMepTab === 'plumbing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Water Supply Engine */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#00daf3]" />
                Potable Water Supply & Storage Engine
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Fixture Units (WSFU):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fixtureUnitsWSFU}
                      onChange={(e) => setFixtureUnitsWSFU(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">FU</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Building Occupants:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={buildingOccupants}
                      onChange={(e) => setBuildingOccupants(parseInt(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">persons</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Residual Pressure Required:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.5"
                      value={waterPressureBar}
                      onChange={(e) => setWaterPressureBar(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">bar</span>
                  </div>
                </div>
              </div>

              {/* Water Supply Outputs */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">HYDRAULIC SUPPLY SPECIFICATION</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Peak Water Demand:</span>
                  <span className="text-white font-bold">{waterDemandLs} L/s ({waterDemandM3h} m³/h)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Main Supply Header:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">{recommendedWaterPipeDN} PPR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Booster Pump Duty:</span>
                  <span className="text-[#00daf3] font-bold">{waterDemandM3h} m³/h @ {boosterPumpHeadMeters} m Head</span>
                </div>
                <div className="flex justify-between border-t border-[#282a2d] pt-1">
                  <span className="text-white font-bold">Domestic Water Tank:</span>
                  <span className="text-[#ffb68b] font-bold text-[12px]">{storageTankCapacityM3.toFixed(1)} m³ (1 Day)</span>
                </div>
              </div>
            </div>

            {/* Drainage & Sewer Sizing */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#a8c8ff]" />
                Drainage, Waste & Vent (IPC / EN 12056)
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Drainage Fixture Units (DFU):</span>
                  <input
                    type="number"
                    value={drainageDFU}
                    onChange={(e) => setDrainageDFU(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                  />
                </div>
              </div>

              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">DRAINAGE SIZING MATRIX</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Soil Stack Pipe:</span>
                  <span className="text-white font-bold">DN100 (4") uPVC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Main Building Drain:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">DN150 (6") @ 1.5% Slope</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Vent Stack Through Roof:</span>
                  <span className="text-white font-bold">DN75 (3") uPVC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Grease Interceptor:</span>
                  <span className="text-[#ffb68b] font-bold">50 GPM (Cafeteria Drain)</span>
                </div>
              </div>
            </div>

            {/* Plumbing Equipment & Fixture Schedule */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2">
                Plumbing Equipment Schedule
              </span>
              <div className="flex flex-col gap-2 text-[10px]">
                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="font-bold text-[#00daf3]">PUMP-BOOST-01 (Duplex Booster Set)</span>
                  <span className="text-[#8a919f]">Flow: {waterDemandM3h} m³/h | Head: {boosterPumpHeadMeters}m | VFD Controlled</span>
                </div>
                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="font-bold text-[#34c759]">TANK-DOM-01 (Sectional GRP Water Tank)</span>
                  <span className="text-[#8a919f]">Capacity: {storageTankCapacityM3.toFixed(1)} m³ | Food-grade WRAS Certified</span>
                </div>
                <div className="bg-[#1e2023] p-2 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="font-bold text-[#a8c8ff]">HEATER-CAL-01 (Commercial Calorifier)</span>
                  <span className="text-[#8a919f]">Volume: 1,500 L | Heating Capacity: 45 kW Electric Elements</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: FIRE PROTECTION & NFPA 13                    */}
        {/* ==================================================== */}
        {activeMepTab === 'fire' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* NFPA 13 Hazard Engine */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#ff4d4d]" />
                NFPA 13 Hydraulic Calculation Engine
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[#8a919f]">Occupancy Hazard Classification:</span>
                  {(['light', 'ordinary1', 'ordinary2'] as const).map((hz) => (
                    <button
                      key={hz}
                      onClick={() => setHazardClass(hz)}
                      className={`p-1.5 rounded border text-left text-[10px] cursor-pointer ${
                        hazardClass === hz
                          ? 'bg-[#282a2d] border-[#ff4d4d] text-white font-bold'
                          : 'bg-[#111316] border-[#282a2d] text-[#8a919f]'
                      }`}
                    >
                      {hazardConfig[hz].name}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-1">
                  <span className="text-[#8a919f]">Protected Floor Area:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={fireAreaM2}
                      onChange={(e) => setFireAreaM2(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m²</span>
                  </div>
                </div>
              </div>

              {/* Hydraulic Outputs */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#ff4d4d] font-bold">FIRE HYDRAULIC RESULTS (NFPA 13)</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Design Density:</span>
                  <span className="text-white font-bold">{currentHazard.densityGpm} gpm/ft² ({currentHazard.densityMmMin} mm/min)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Total Sprinkler Heads:</span>
                  <span className="text-[#00daf3] font-bold text-[12px]">{requiredSprinklers} Heads (K=80)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Fire Pump Flow Demand:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">{designFlowGpm} GPM ({designFlowLs} L/s)</span>
                </div>
                <div className="flex justify-between border-t border-[#282a2d] pt-1">
                  <span className="text-white font-bold">Fire Water Reservoir:</span>
                  <span className="text-[#ff4d4d] font-bold text-[12px]">{fireWaterTankVolumeM3} m³ (60 Mins)</span>
                </div>
              </div>
            </div>

            {/* Fire System Pipe Schedules & Standpipes */}
            <div className="col-span-2 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2">
                Fire Protection Pipe Schedule & Fire Equipment
              </span>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5">
                  <span className="text-[#00daf3] font-bold">SPRINKLER PIPE NETWORK</span>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Branch Lines:</span>
                    <span className="text-white font-bold">DN25 (1") Black Steel Sch 40</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Cross Mains:</span>
                    <span className="text-white font-bold">DN65 (2½") Grooved Sch 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Riser Main:</span>
                    <span className="text-[#34c759] font-bold">DN100 (4") Grooved Sch 10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Zone Control Valve:</span>
                    <span className="text-white">DN100 Butterfly Valve + Flow Switch</span>
                  </div>
                </div>

                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5">
                  <span className="text-[#ff4d4d] font-bold">FIRE PUMP SET (NFPA 20)</span>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Main Duty Pump:</span>
                    <span className="text-white font-bold">Electric Driven 750 GPM @ 10 Bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Standby Pump:</span>
                    <span className="text-white font-bold">Diesel Engine 750 GPM @ 10 Bar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Jockey Pressure Pump:</span>
                    <span className="text-[#00daf3] font-bold">25 GPM @ 11 Bar (Maintain 10 Bar)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8a919f]">Fire Department Connection:</span>
                    <span className="text-white">Breeching Inlet 4-Way 65mm Storz</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: FUEL GAS SYSTEM DESIGN                       */}
        {/* ==================================================== */}
        {activeMepTab === 'gas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-[#ffb68b]" />
                Fuel Gas Pipe Sizing (NFPA 54 / EN 1775)
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Total Gas Connected Load:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={gasLoadKw}
                      onChange={(e) => setGasLoadKw(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">kW</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Main Run Length:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={gasPipeLengthM}
                      onChange={(e) => setGasPipeLengthM(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#ffb68b] font-bold">GAS PIPING RESULTS</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Natural Gas Flow Rate:</span>
                  <span className="text-white font-bold">{gasFlowM3h} m³/h (Calorific 10.5 kWh/m³)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Recommended Main Pipe:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">{gasPipeDN}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Gas Meter Selection:</span>
                  <span className="text-[#00daf3] font-bold">G-16 Diaphragm Rotary Meter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Emergency Shutoff:</span>
                  <span className="text-[#ffb4ab] font-bold">Solenoid Valve tied to Gas Detection</span>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2">
                Gas Appliances & Safety Systems
              </span>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="font-bold text-[#00daf3]">BOILER-GAS-01 (Condensing Gas Boiler)</span>
                  <span className="text-[#8a919f]">Input: 120 kW | Efficiency: 96% | Dual Low-NOx Burner</span>
                  <span className="text-[#c0c6d6]">Supply Pressure: 20 mbar | Pipe: DN40 Flanged</span>
                </div>
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="font-bold text-[#ffb68b]">KITCHEN-GAS-01 (Commercial Cooking Line)</span>
                  <span className="text-[#8a919f]">Input: 60 kW | Interlocked with Canopy Exhaust Fan</span>
                  <span className="text-[#c0c6d6]">Gas Detector: Catalytic Sensor with Audible Alarm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: ELEVATOR / LIFT TRAFFIC ANALYSIS             */}
        {/* ==================================================== */}
        {activeMepTab === 'elevator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#00daf3]" />
                Elevator Traffic & Shaft Sizing (EN 81-20)
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Car Rated Capacity:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={liftCapacityPersons}
                      onChange={(e) => setLiftCapacityPersons(parseInt(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">persons (1000 kg)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Rated Speed (v):</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.25"
                      value={liftSpeedMs}
                      onChange={(e) => setLiftSpeedMs(parseFloat(e.target.value) || 0)}
                      className="w-16 bg-[#111316] border border-[#282a2d] px-1 py-0.5 rounded text-white text-right font-mono"
                    />
                    <span className="text-[#8a919f] text-[10px]">m/s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8a919f]">Travel Height:</span>
                  <span className="text-white font-mono">{travelHeightM} m ({liftFloors} Floors)</span>
                </div>
              </div>

              {/* Lift Outputs */}
              <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1.5 text-[10px]">
                <span className="text-[#00daf3] font-bold">TRAFFIC HANDLING PERFORMANCE</span>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Round Trip Time (RTT):</span>
                  <span className="text-white font-bold">{roundTripTimeSec} seconds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">Average Waiting Interval:</span>
                  <span className="text-[#34c759] font-bold text-[12px]">{liftWaitingTimeSec} s (Target &lt; 35s: PASS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8a919f]">5-Min Handling Capacity:</span>
                  <span className="text-white font-bold">{fiveMinHandlingCapacity} persons (13.5% of pop.)</span>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2">
                Shaft & Cabin Geometry Specification
              </span>
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="text-[#00daf3] font-bold">HOISTWAY / SHAFT DIMENSIONS</span>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Shaft Width:</span><span className="text-white">2,000 mm</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Shaft Depth:</span><span className="text-white">2,100 mm</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Pit Depth:</span><span className="text-white">1,500 mm</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Overhead Clearance:</span><span className="text-[#34c759] font-bold">4,200 mm</span></div>
                </div>
                <div className="bg-[#111316] p-2.5 rounded border border-[#282a2d] flex flex-col gap-1">
                  <span className="text-[#34c759] font-bold">CABIN SPECIFICATION</span>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Cabin Width:</span><span className="text-white">1,400 mm</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Cabin Depth:</span><span className="text-white">1,600 mm</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Door Opening:</span><span className="text-white">900 mm Center Opening</span></div>
                  <div className="flex justify-between"><span className="text-[#8a919f]">Drive:</span><span className="text-[#00daf3] font-bold">Gearless PM Motor MRL</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: BIM CLASH DETECTION MATRIX                   */}
        {/* ==================================================== */}
        {activeMepTab === 'clash' && (
          <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ffb68b]" />
                <span className="font-bold text-white text-[13px]">BIM Automated Multidisciplinary Clash Matrix</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#ffb4ab] bg-[#2b1616] px-2 py-0.5 rounded border border-[#ff8b8b]/30">
                  {clashes.filter((c) => c.status === 'Open').length} Open Clashes
                </span>
                <button
                  onClick={() => alert('Running full 3D clash test across Architecture, Structure, HVAC, Plumbing, Fire...')}
                  className="flex items-center gap-1 px-3 py-1 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white text-[10px] font-bold rounded shadow transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Re-Run Clash Audit</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-[#282a2d] text-[#8a919f] text-[9px] uppercase font-bold">
                    <th className="pb-1.5">Clash ID</th>
                    <th className="pb-1.5">Element A (Discipline)</th>
                    <th className="pb-1.5">Element B (Discipline)</th>
                    <th className="pb-1.5">Location</th>
                    <th className="pb-1.5">Severity</th>
                    <th className="pb-1.5">Clearance / Penetration</th>
                    <th className="pb-1.5">Status</th>
                    <th className="pb-1.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282a2d]/50 text-white font-mono">
                  {clashes.map((c) => (
                    <tr key={c.id} className="hover:bg-[#1e2023] transition-colors">
                      <td className="py-2 text-[#00daf3] font-bold">{c.id}</td>
                      <td className="py-2">
                        <div>{c.itemA}</div>
                        <span className="text-[9px] text-[#8a919f]">{c.disciplineA}</span>
                      </td>
                      <td className="py-2">
                        <div>{c.itemB}</div>
                        <span className="text-[9px] text-[#8a919f]">{c.disciplineB}</span>
                      </td>
                      <td className="py-2 text-[#a8c8ff]">{c.location}</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            c.severity === 'Critical'
                              ? 'bg-[#ff4d4d]/20 text-[#ff8b8b] border border-[#ff4d4d]/40'
                              : c.severity === 'Moderate'
                              ? 'bg-[#ff9900]/20 text-[#ffb68b] border border-[#ff9900]/40'
                              : 'bg-[#3491ff]/20 text-[#a8c8ff] border border-[#3491ff]/40'
                          }`}
                        >
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-2 font-bold text-[#ff8b8b]">{c.clearanceMm} mm</td>
                      <td className="py-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] ${
                            c.status === 'Open' ? 'text-[#ffb4ab] bg-red-950/40' : 'text-[#34c759] bg-green-950/40'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => {
                            setClashes((prev) =>
                              prev.map((item) =>
                                item.id === c.id ? { ...item, status: item.status === 'Open' ? 'Resolved' : 'Open' } : item
                              )
                            );
                          }}
                          className="px-2 py-0.5 bg-[#1e2023] hover:bg-[#282a2d] text-[#00daf3] rounded border border-[#282a2d] text-[9px] cursor-pointer"
                        >
                          {c.status === 'Open' ? 'Mark Resolved' : 'Re-open'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: DRAWING SHEETS & TITLE BLOCKS                */}
        {/* ==================================================== */}
        {activeMepTab === 'sheets' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* Sheet Setup */}
            <div className="bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
              <span className="font-bold text-white text-[12px] border-b border-[#282a2d] pb-2 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-[#00daf3]" />
                Drawing Sheet Layout Parameters
              </span>

              <div className="flex flex-col gap-2 text-[11px]">
                <div className="flex flex-col gap-1">
                  <span className="text-[#8a919f]">Paper Size:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['A0', 'A1', 'A2', 'A3'] as const).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSheetSize(sz)}
                        className={`py-1 rounded border text-[10px] font-bold cursor-pointer ${
                          sheetSize === sz
                            ? 'bg-[#3491ff] text-white border-[#3491ff]'
                            : 'bg-[#111316] text-[#8a919f] border-[#282a2d]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[#8a919f]">Drawing Scale:</span>
                  <select
                    value={drawingScale}
                    onChange={(e) => setDrawingScale(e.target.value)}
                    className="bg-[#111316] border border-[#282a2d] p-1 rounded text-white text-[10px]"
                  >
                    <option value="1:50">1:50 (Detailed Plan)</option>
                    <option value="1:100">1:100 (Standard Floor Plan)</option>
                    <option value="1:200">1:200 (Site / Overall)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[#8a919f]">Drawing Title:</span>
                  <input
                    type="text"
                    value={sheetTitle}
                    onChange={(e) => setSheetTitle(e.target.value)}
                    className="bg-[#111316] border border-[#282a2d] px-1.5 py-1 rounded text-white text-[10px]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[#8a919f]">Drawing Number:</span>
                  <input
                    type="text"
                    value={drawingNumber}
                    onChange={(e) => setDrawingNumber(e.target.value)}
                    className="bg-[#111316] border border-[#282a2d] px-1.5 py-1 rounded text-white text-[10px]"
                  />
                </div>

                <button
                  onClick={() => alert(`Exporting Sheet ${drawingNumber} (${sheetSize} @ ${drawingScale}) to vector PDF...`)}
                  className="mt-2 py-2 bg-[#3491ff] hover:bg-[#a8c8ff] hover:text-[#003061] text-white text-[10px] font-bold rounded shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Export PDF Sheet</span>
                </button>
              </div>
            </div>

            {/* Interactive Sheet Preview Canvas with Title Block */}
            <div className="col-span-3 bg-[#1a1c1f] p-3 rounded border border-[#282a2d] flex flex-col gap-2 shadow-md">
              <div className="flex items-center justify-between border-b border-[#282a2d] pb-1">
                <span className="font-bold text-white text-[12px]">Drawing Sheet Preview ({sheetSize} Layout)</span>
                <span className="text-[#00daf3] text-[10px]">{drawingNumber} | {drawingRevision}</span>
              </div>

              {/* Sheet Canvas Container */}
              <div className="h-[420px] bg-[#22252a] rounded border border-[#282a2d] p-3 flex items-center justify-center">
                <div className="w-full h-full max-w-[680px] max-h-[380px] bg-white text-black rounded border-2 border-black p-3 relative flex flex-col justify-between font-sans shadow-2xl">
                  {/* Drawing Area */}
                  <div className="flex-1 border border-gray-400 p-2 relative flex flex-col justify-between">
                    <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                      <span>PROJECT: 4M ENGINEERING CLOUD DEMO BUILDING</span>
                      <span>GRID SYSTEM: A-D / 1-3</span>
                    </div>

                    {/* Schematics preview inside sheet */}
                    <div className="flex items-center justify-center text-gray-400 font-mono text-[10px]">
                      [ VECTOR COMPOSITE MEP DRAWING VIEWPORT — SCALE {drawingScale} ]
                    </div>

                    {/* North Arrow */}
                    <div className="absolute top-4 right-4 flex flex-col items-center">
                      <div className="w-4 h-4 border-l-2 border-b-2 border-black rotate-45" />
                      <span className="text-[9px] font-bold">N</span>
                    </div>
                  </div>

                  {/* Standard Engineering Title Block at Bottom Right */}
                  <div className="mt-2 border-2 border-black flex text-[9px]">
                    <div className="w-1/3 p-1.5 border-r border-black flex flex-col justify-between">
                      <div className="font-bold text-[10px] tracking-wider text-[#003061]">4M ENGINEERING CLOUD</div>
                      <div className="text-[8px] text-gray-600">CONSULTING ENGINEERS & ARCHITECTS</div>
                      <div className="text-[7.5px] text-[#003061] font-bold mt-0.5">DEV: ENG. ALAA MOHAMMED</div>
                    </div>

                    <div className="w-1/3 p-1.5 border-r border-black flex flex-col justify-between">
                      <div className="text-[8px] text-gray-600 uppercase">DRAWING TITLE</div>
                      <div className="font-bold text-[10px] leading-tight">{sheetTitle}</div>
                      <div className="text-[7.5px] text-gray-600">LEAD ENG: Eng. Alaa Mohammed</div>
                    </div>

                    <div className="flex-1 p-1.5 flex flex-col justify-between font-mono text-[8px]">
                      <div className="flex justify-between"><span>DWG:</span><strong>{drawingNumber}</strong></div>
                      <div className="flex justify-between"><span>SCALE:</span><span>{drawingScale}</span></div>
                      <div className="flex justify-between"><span>DESIGNER:</span><strong>Eng. Alaa Mohammed</strong></div>
                      <div className="flex justify-between"><span>REV:</span><strong>{drawingRevision}</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: ENERGY RATING & CO2 DASHBOARD                */}
        {/* ==================================================== */}
        {activeMepTab === 'energy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
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

        {/* ==================================================== */}
        {/* TAB 10: QUANTITY TAKEOFF / BOQ GENERATOR            */}
        {/* ==================================================== */}
        {activeMepTab === 'boq' && (
          <div className="bg-[#1a1c1f] p-4 rounded border border-[#282a2d] flex flex-col gap-3 shadow-md">
            <div className="flex items-center justify-between border-b border-[#282a2d] pb-2">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#00daf3]" />
                <span className="font-bold text-white text-[13px]">BIM Automated Bill of Quantities (BOQ)</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Currency selector: USD, EUR, IQD */}
                <div className="flex items-center bg-[#111316] p-0.5 rounded border border-[#282a2d] text-[10px]">
                  {(['USD', 'EUR', 'IQD'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                        currency === curr ? 'bg-[#3491ff] text-white' : 'text-[#8a919f] hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>

                <span className="text-white font-bold text-[13px]">
                  TOTAL ESTIMATE: <span className="text-[#00daf3]">{currencySymbol}{totalBoqConverted}</span>
                </span>
                <button
                  onClick={() => alert(`Exporting ${boqList.length} items to Excel-compatible CSV & PDF (${currency})...`)}
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
                    <th className="pb-2 text-right">Unit Price ({currencySymbol})</th>
                    <th className="pb-2 text-right">Total Price ({currencySymbol})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282a2d]/60 text-white font-mono">
                  {boqList.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1e2023] transition-colors">
                      <td className="py-2 text-[#00daf3] font-bold">{row.item}</td>
                      <td className="py-2">{row.description}</td>
                      <td className="py-2 text-[#8a919f]">{row.category}</td>
                      <td className="py-2">{row.unit}</td>
                      <td className="py-2 text-right">{row.quantity.toLocaleString()}</td>
                      <td className="py-2 text-right">{(row.unitPrice * currencyRate).toFixed(currency === 'IQD' ? 0 : 2)}</td>
                      <td className="py-2 text-right font-bold text-[#a8c8ff]">
                        {(row.total * currencyRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
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
