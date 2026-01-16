import React, { useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { EXRLoader } from 'three-stdlib';
import * as THREE from 'three';

interface EnvironmentSphereProps {
  url: string;
}

const EnvironmentSphere: React.FC<EnvironmentSphereProps> = ({ url }) => {
  const texture = useLoader(EXRLoader, url);
  const { scene } = useThree();

  useEffect(() => {
    if (texture) {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      // LinearFilter is better for HDR environment maps
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      // Apply to scene background (visual) and environment (lighting for models)
      scene.background = texture;
      scene.environment = texture;
    }

    return () => {
      // Cleanup when unmounting or changing texture
      scene.background = null;
      scene.environment = null;
      // Texture disposal is handled by useLoader cache usually, 
      // but explicit dispose in parent context or here is good practice if not cached.
    };
  }, [texture, scene]);

  return null; // The background/environment is set on the scene, no mesh needed.
};

export default EnvironmentSphere;