import React from 'react';

export interface ViewerState {
  fileUrl: string | null;
  fileName: string | null;
  exposure: number;
  isLoading: boolean;
  error: string | null;
  // Model State
  modelUrl: string | null;
  modelName: string | null;
  modelRotation: { x: number; y: number; z: number };
  modelScale: number;
}

export interface UIStateProps {
  viewerState: ViewerState;
  onUpload: (file: File) => void;
  onExposureChange: (value: number) => void;
  onReset: () => void;
  // Model Actions
  onUploadModel: (file: File) => void;
  onModelRotationChange: (axis: 'x' | 'y' | 'z', value: number) => void;
  onModelScaleChange: (value: number) => void;
  // Input Ref for Mobile Controls
  inputRef: React.MutableRefObject<InputState>;
  // Screenshot
  onScreenshot: () => void;
}

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}