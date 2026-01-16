import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ScreenshotManagerProps {
  onRegister: (callback: () => void) => void;
}

const ScreenshotManager: React.FC<ScreenshotManagerProps> = ({ onRegister }) => {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    onRegister(() => {
      // 1. Save current state
      const prevBackground = scene.background;
      const prevClearColor = new THREE.Color();
      gl.getClearColor(prevClearColor);
      const prevClearAlpha = gl.getClearAlpha();

      // 2. Prepare for transparent screenshot
      scene.background = null; // Hide the environment sphere/background
      gl.setClearColor(0x000000, 0); // Set clear color to transparent black

      // 3. Render the scene
      gl.render(scene, camera);

      // 4. Capture the data URL
      const dataURL = gl.domElement.toDataURL('image/png');

      // 5. Restore state
      scene.background = prevBackground;
      gl.setClearColor(prevClearColor, prevClearAlpha);

      // 6. Download the image
      const link = document.createElement('a');
      link.download = `screenshot_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    });
  }, [gl, scene, camera, onRegister]);

  return null;
};

export default ScreenshotManager;