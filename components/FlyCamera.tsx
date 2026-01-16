import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { InputState } from '../types';

interface FlyCameraProps {
  inputRef: React.MutableRefObject<InputState>;
}

const FlyCamera: React.FC<FlyCameraProps> = ({ inputRef }) => {
  const { camera, gl } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const isDragging = useRef(false);
  const previousTouch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Force camera to look at center (0,0,0) where the model is
    camera.lookAt(0, 0, 0);
    // Sync the euler angles reference with the new camera rotation
    euler.current.setFromQuaternion(camera.quaternion, 'YXZ');

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': inputRef.current.forward = true; break;
        case 'KeyS': inputRef.current.backward = true; break;
        case 'KeyA': inputRef.current.left = true; break;
        case 'KeyD': inputRef.current.right = true; break;
        case 'Space': inputRef.current.up = true; break;
        case 'ControlLeft': 
        case 'ControlRight': inputRef.current.down = true; break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW': inputRef.current.forward = false; break;
        case 'KeyS': inputRef.current.backward = false; break;
        case 'KeyA': inputRef.current.left = false; break;
        case 'KeyD': inputRef.current.right = false; break;
        case 'Space': inputRef.current.up = false; break;
        case 'ControlLeft': 
        case 'ControlRight': inputRef.current.down = false; break;
      }
    };

    // Look controls (Mouse)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) isDragging.current = true; // Left click to drag view
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const sensitivity = 0.002;
        euler.current.y -= e.movementX * sensitivity;
        euler.current.x -= e.movementY * sensitivity;
        euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    // Look controls (Touch)
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging.current = true;
        previousTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = () => {
      isDragging.current = false;
      previousTouch.current = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging.current && previousTouch.current && e.touches.length === 1) {
        const touch = e.touches[0];
        const movementX = touch.clientX - previousTouch.current.x;
        const movementY = touch.clientY - previousTouch.current.y;
        previousTouch.current = { x: touch.clientX, y: touch.clientY };

        const sensitivity = 0.005;
        euler.current.y -= movementX * sensitivity;
        euler.current.x -= movementY * sensitivity;
        euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    // Attach listeners to canvas for look controls to avoid conflict with UI
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [camera, gl.domElement, inputRef]);

  useFrame((state, delta) => {
    const speed = 2.0 * delta; // units per second
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, 0);
    const sideVector = new THREE.Vector3(0, 0, 0);
    const upVector = new THREE.Vector3(0, 1, 0);

    const { forward, backward, left, right, up, down } = inputRef.current;

    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(camera.rotation);

    camera.position.add(direction);

    // Vertical movement (absolute up/down)
    if (up) camera.position.addScaledVector(upVector, speed);
    if (down) camera.position.addScaledVector(upVector, -speed);
  });

  return null;
};

export default FlyCamera;