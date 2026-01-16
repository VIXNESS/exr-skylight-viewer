import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import EnvironmentSphere from './EnvironmentSphere';
import Model3D from './Model3D';
import FlyCamera from './FlyCamera';
import ScreenshotManager from './ScreenshotManager';
import { InputState } from '../types';

interface ViewerSceneProps {
  fileUrl: string | null;
  exposure: number;
  modelUrl: string | null;
  modelRotation: { x: number; y: number; z: number };
  modelScale: number;
  inputRef: React.MutableRefObject<InputState>;
  onScreenshotRegister: (callback: () => void) => void;
}

const Loader: React.FC = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/70 p-4 rounded-lg backdrop-blur-sm pointer-events-none select-none">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <span className="text-white font-medium text-sm">Loading... {progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
};

const ViewerScene: React.FC<ViewerSceneProps> = ({ 
  fileUrl, 
  exposure, 
  modelUrl, 
  modelRotation,
  modelScale,
  inputRef,
  onScreenshotRegister
}) => {
  return (
    <div className="w-full h-full relative bg-gray-900">
      
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }} // Start back a bit so we can see the model
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: exposure,
          preserveDrawingBuffer: true, // Required for reliable screenshot capture
          alpha: true
        }}
        dpr={[1, 2]}
      >
        <FlyCamera inputRef={inputRef} />
        <ScreenshotManager onRegister={onScreenshotRegister} />
        
        {/* Default lighting when no EXR environment is loaded */}
        {!fileUrl && (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight 
              position={[5, 10, 7]} 
              intensity={1.2} 
              castShadow 
            />
            <directionalLight 
              position={[-5, 5, -5]} 
              intensity={0.5} 
            />
            <hemisphereLight 
              args={['#87ceeb', '#362a1e', 0.6]} 
            />
          </>
        )}
        
        {fileUrl && (
          <Suspense fallback={<Loader />}>
             <EnvironmentSphere url={fileUrl} />
          </Suspense>
        )}

        {/* Default white cube when no model is uploaded */}
        {!modelUrl && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.1} />
          </mesh>
        )}

        {modelUrl && (
          <Suspense fallback={null}>
            <Model3D url={modelUrl} rotation={modelRotation} scale={modelScale} />
          </Suspense>
        )}
      </Canvas>
    </div>
  );
};

export default ViewerScene;