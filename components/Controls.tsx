import React, { useRef } from 'react';
import { Upload, RotateCcw, Image, Sun, AlertCircle, Box, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ChevronsUp, ChevronsDown, Maximize, Camera } from 'lucide-react';
import { UIStateProps } from '../types';

const Controls: React.FC<UIStateProps> = ({ 
  viewerState, 
  onUpload, 
  onExposureChange, 
  onReset,
  onUploadModel,
  onModelRotationChange,
  onModelScaleChange,
  inputRef,
  onScreenshot
}) => {
  const exrInputRef = useRef<HTMLInputElement>(null);
  const glbInputRef = useRef<HTMLInputElement>(null);

  const handleExrChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.exr')) {
        alert("Please upload a valid .exr file");
        return;
      }
      onUpload(file);
    }
  };

  const handleGlbChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const name = file.name.toLowerCase();
      if (!name.endsWith('.glb') && !name.endsWith('.gltf')) {
        alert("Please upload a valid .glb or .gltf file");
        return;
      }
      onUploadModel(file);
    }
  };

  // Helper to handle touch/mouse hold for buttons
  const bindInput = (key: keyof typeof inputRef.current) => ({
    onMouseDown: () => { inputRef.current[key] = true; },
    onMouseUp: () => { inputRef.current[key] = false; },
    onMouseLeave: () => { inputRef.current[key] = false; },
    onTouchStart: (e: React.TouchEvent) => { e.preventDefault(); inputRef.current[key] = true; },
    onTouchEnd: (e: React.TouchEvent) => { e.preventDefault(); inputRef.current[key] = false; }
  });

  return (
    <>
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col justify-between p-4 md:p-6 z-20">
      {/* Header Bar */}
      <div className="pointer-events-auto flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-800 w-full md:max-w-sm">
          <h1 className="text-white font-bold text-lg flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-600 rounded-lg">
              <Image size={18} className="text-white" />
            </div>
            EXR Skylight Viewer
          </h1>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {/* Upload EXR */}
            <button
              onClick={() => exrInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg transition-all border border-gray-700 text-xs font-medium"
            >
              <Upload size={16} />
              Upload EXR
            </button>
            <input type="file" ref={exrInputRef} accept=".exr" className="hidden" onChange={handleExrChange} />

            {/* Upload Model */}
            <button
              onClick={() => glbInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-1 bg-gray-800 hover:bg-gray-700 text-gray-200 py-3 rounded-lg transition-all border border-gray-700 text-xs font-medium"
            >
              <Box size={16} />
              Upload GLB
            </button>
            <input type="file" ref={glbInputRef} accept=".glb,.gltf" className="hidden" onChange={handleGlbChange} />
          </div>

          <div className="mt-2 space-y-1">
            {viewerState.fileName && (
              <div className="flex items-center gap-2 text-[10px] text-green-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                 <span className="truncate">{viewerState.fileName}</span>
              </div>
            )}
            {viewerState.modelName && (
              <div className="flex items-center gap-2 text-[10px] text-blue-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                 <span className="truncate">{viewerState.modelName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Model & Exposure Settings Panel */}
        {(viewerState.fileUrl || viewerState.modelUrl) && (
          <div className="bg-gray-900/90 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-gray-800 w-full md:max-w-xs pointer-events-auto max-h-[40vh] overflow-y-auto">
             {/* Exposure - only show when EXR is loaded */}
             {viewerState.fileUrl && (
               <div className="mb-4">
                  <div className="flex items-center justify-between text-gray-300 text-xs mb-2">
                    <span className="flex items-center gap-1.5"><Sun size={14} className="text-yellow-500"/> Exposure</span>
                    <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-mono">{viewerState.exposure.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0" max="5" step="0.05"
                    value={viewerState.exposure}
                    onChange={(e) => onExposureChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
               </div>
             )}

             {/* Model Settings */}
             {viewerState.modelUrl && (
              <div className={`${viewerState.fileUrl ? 'border-t border-gray-800 pt-3' : ''} space-y-4`}>
                 {/* Scale */}
                  <div>
                    <div className="flex items-center justify-between text-gray-300 text-xs mb-2">
                        <span className="flex items-center gap-1.5"><Maximize size={14} className="text-green-500"/> Scale</span>
                        <span className="bg-gray-800 px-1.5 py-0.5 rounded text-[10px] font-mono">{viewerState.modelScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range" min="0.1" max="5.0" step="0.1"
                      value={viewerState.modelScale}
                      onChange={(e) => onModelScaleChange(parseFloat(e.target.value))}
                      className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>

                  {/* Rotation */}
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-300 text-xs font-medium mb-2">
                        <RotateCcw size={14} className="text-blue-500" /> Rotation
                    </div>
                    <div className="space-y-2">
                        {(['x', 'y', 'z'] as const).map(axis => (
                            <div key={axis} className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="uppercase font-bold w-3">{axis}</span>
                            <input
                                type="range" min={-Math.PI} max={Math.PI} step={0.1}
                                value={viewerState.modelRotation[axis]}
                                onChange={(e) => onModelRotationChange(axis, parseFloat(e.target.value))}
                                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            </div>
                        ))}
                    </div>
                  </div>
               </div>
             )}

             <div className="mt-3 pt-2 border-t border-gray-800 flex justify-between items-center">
                {viewerState.modelUrl && (
                  <button onClick={onScreenshot} className="text-[10px] bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md border border-gray-700 transition-colors flex items-center gap-1.5">
                    <Camera size={12} />
                    Screenshot
                  </button>
                )}
                <button onClick={onReset} className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 ml-auto">
                  Reset View
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Touch Controls for Mobile/No-Keyboard */}
      <div className="pointer-events-auto flex justify-between items-end pb-4 md:pb-8">
        
        {/* D-Pad (Left Side) */}
        <div className="grid grid-cols-3 gap-2 bg-gray-900/50 backdrop-blur p-3 rounded-full border border-gray-700/50">
           <div className="col-start-2">
              <button {...bindInput('forward')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
                <ArrowUp size={20} />
              </button>
           </div>
           <div className="col-start-1 row-start-2">
              <button {...bindInput('left')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
                <ArrowLeft size={20} />
              </button>
           </div>
           <div className="col-start-2 row-start-2">
              <button {...bindInput('backward')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
                <ArrowDown size={20} />
              </button>
           </div>
           <div className="col-start-3 row-start-2">
              <button {...bindInput('right')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
                <ArrowRight size={20} />
              </button>
           </div>
        </div>

        {/* Up/Down (Right Side) */}
        <div className="flex flex-col gap-2 bg-gray-900/50 backdrop-blur p-3 rounded-full border border-gray-700/50">
           <button {...bindInput('up')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
             <ChevronsUp size={20} />
           </button>
           <button {...bindInput('down')} className="w-10 h-10 md:w-12 md:h-12 bg-gray-800/80 active:bg-blue-600 rounded-full flex items-center justify-center text-white border border-gray-600 transition-colors">
             <ChevronsDown size={20} />
           </button>
        </div>
      </div>
      
      {/* Help Hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-[10px] pointer-events-none hidden md:block">
        WASD to Move | Space/Ctrl for Elev | Click & Drag to Look
      </div>
    </div>
    </>
  );
};

export default Controls;