import React from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import * as THREE from 'three';

interface Model3DProps {
  url: string;
  rotation: { x: number; y: number; z: number };
  scale: number;
}

const Model3D: React.FC<Model3DProps> = ({ url, rotation, scale }) => {
  const gltf = useLoader(GLTFLoader, url);

  // Apply rotation and scale
  // We use a group to wrap the model so we can easily control transform
  return (
    <group 
      rotation={[rotation.x, rotation.y, rotation.z]} 
      scale={[scale, scale, scale]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
};

export default Model3D;