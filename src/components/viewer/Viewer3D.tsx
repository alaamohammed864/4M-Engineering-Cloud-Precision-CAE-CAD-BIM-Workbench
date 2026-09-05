// Real 3D viewer (Priority 3): actual WebGL rendering via Three.js /
// React Three Fiber, replacing the previous SVG-icon-only "viewer" panels.
// This is genuinely load-bearing - remove <Canvas> below and geometry/
// results views lose all 3D rendering, there is no fallback.
import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Bounds } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

export type ViewerDisplayMode = 'solid' | 'wireframe' | 'solid+wireframe';
export type CameraPreset = 'iso' | 'front' | 'top' | 'right';

interface LoadedGeometryProps {
  url: string;
  displayMode: ViewerDisplayMode;
  color?: string;
}

function LoadedSTLMesh({ url, displayMode, color = '#4f9dde' }: LoadedGeometryProps) {
  const [geom, setGeom] = useState<THREE.BufferGeometry | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        if (cancelled) return;
        const loader = new STLLoader();
        const g = loader.parse(buf);
        g.computeVertexNormals();
        g.center();
        setGeom(g);
      });
    return () => { cancelled = true; };
  }, [url]);

  if (!geom) return null;

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={color}
        wireframe={displayMode === 'wireframe'}
        flatShading
        metalness={0.15}
        roughness={0.6}
      />
      {displayMode === 'solid+wireframe' && (
        <lineSegments>
          <edgesGeometry args={[geom]} />
          <lineBasicMaterial color="#0a2540" />
        </lineSegments>
      )}
    </mesh>
  );
}

export interface Viewer3DProps {
  /** URL of an STL file to load and render. If omitted, shows an empty/demo scene. */
  geometryUrl?: string;
  displayMode?: ViewerDisplayMode;
  cameraPreset?: CameraPreset;
  className?: string;
  emptyStateLabel?: string;
}

/**
 * Real WebGL 3D viewer. When `geometryUrl` is omitted, renders an explicit
 * empty/demo scene (a reference grid, no geometry) rather than implying a
 * model is loaded - this matches Phase 1 sequencing (no geometry exists yet)
 * so the viewer is never mistaken for "broken" when there's simply nothing
 * to show.
 */
export default function Viewer3D({
  geometryUrl,
  displayMode = 'solid',
  cameraPreset = 'iso',
  className,
  emptyStateLabel = 'No geometry loaded — empty scene',
}: Viewer3DProps) {
  const camPos: [number, number, number] =
    cameraPreset === 'front' ? [0, 0, 8]
    : cameraPreset === 'top' ? [0, 8, 0.01]
    : cameraPreset === 'right' ? [8, 0, 0]
    : [5, 5, 5];

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative', background: '#0b1220' }}>
      <Canvas camera={{ position: camPos, fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.1} />
        <Grid infiniteGrid fadeDistance={30} cellColor="#2a3a55" sectionColor="#3d5a8a" />
        <Suspense fallback={null}>
          {geometryUrl ? (
            <Bounds fit clip observe margin={1.2}>
              <LoadedSTLMesh url={geometryUrl} displayMode={displayMode} />
            </Bounds>
          ) : null}
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
      {!geometryUrl && (
        <div style={{
          position: 'absolute', bottom: 12, left: 12, color: '#7d93b8',
          fontSize: 12, fontFamily: 'monospace', pointerEvents: 'none',
        }}>
          {emptyStateLabel}
        </div>
      )}
    </div>
  );
}
