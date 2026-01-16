import React, { useState, useCallback, useEffect, useRef } from 'react';
import ViewerScene from './components/ViewerScene';
import Controls from './components/Controls';
import { ViewerState, InputState } from './types';

const INITIAL_STATE: ViewerState = {
  fileUrl: null,
  fileName: null,
  exposure: 1.0,
  isLoading: false,
  error: null,
  modelUrl: null,
  modelName: null,
  modelRotation: { x: 0, y: 0, z: 0 },
  modelScale: 1.0,
};

const App: React.FC = () => {
  const [state, setState] = useState<ViewerState>(INITIAL_STATE);
  
  // Shared Mutable Ref for Input handling to avoid re-renders on every frame input
  const inputRef = useRef<InputState>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Ref to hold the screenshot function from the Canvas component
  const screenshotHandlerRef = useRef<(() => void) | null>(null);

  // Handle EXR upload
  const handleUpload = useCallback((file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
      const url = URL.createObjectURL(file);
      setState(prev => ({ ...prev, fileUrl: url, fileName: file.name, isLoading: false, exposure: 1.0 }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to load EXR." }));
    }
  }, [state.fileUrl]);

  // Handle Model Upload
  const handleModelUpload = useCallback((file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      if (state.modelUrl) URL.revokeObjectURL(state.modelUrl);
      const url = URL.createObjectURL(file);
      setState(prev => ({ 
        ...prev, 
        modelUrl: url, 
        modelName: file.name, 
        isLoading: false,
        modelRotation: { x: 0, y: 0, z: 0 },
        modelScale: 1.0
      }));
    } catch (err) {
      console.error(err);
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to load Model." }));
    }
  }, [state.modelUrl]);

  const handleExposureChange = useCallback((value: number) => {
    setState(prev => ({ ...prev, exposure: value }));
  }, []);

  const handleModelRotationChange = useCallback((axis: 'x' | 'y' | 'z', value: number) => {
    setState(prev => ({
      ...prev,
      modelRotation: { ...prev.modelRotation, [axis]: value }
    }));
  }, []);

  const handleModelScaleChange = useCallback((value: number) => {
    setState(prev => ({ ...prev, modelScale: value }));
  }, []);

  const handleReset = useCallback(() => {
    setState(prev => ({ ...prev, exposure: 1.0, modelRotation: { x: 0, y: 0, z: 0 }, modelScale: 1.0 }));
  }, []);

  const handleScreenshot = useCallback(() => {
    if (screenshotHandlerRef.current) {
      screenshotHandlerRef.current();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
      if (state.modelUrl) URL.revokeObjectURL(state.modelUrl);
    };
  }, [state.fileUrl, state.modelUrl]);

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="absolute inset-0 z-0">
        <ViewerScene 
          fileUrl={state.fileUrl} 
          exposure={state.exposure} 
          modelUrl={state.modelUrl}
          modelRotation={state.modelRotation}
          modelScale={state.modelScale}
          inputRef={inputRef}
          onScreenshotRegister={(fn) => { screenshotHandlerRef.current = fn; }}
        />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none">
        <Controls 
          viewerState={state}
          onUpload={handleUpload}
          onExposureChange={handleExposureChange}
          onReset={handleReset}
          onUploadModel={handleModelUpload}
          onModelRotationChange={handleModelRotationChange}
          onModelScaleChange={handleModelScaleChange}
          inputRef={inputRef}
          onScreenshot={handleScreenshot}
        />
      </div>
    </div>
  );
};

export default App;