'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ChromeHelmetSceneProps {
  className?: string;
}

function ChromeHelmet() {
  const helmetRef = useRef<THREE.Group>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load the helmet GLTF with error handling - using Vercel path
  const { scene: helmetScene } = useGLTF('https://college-football-fantasy-app.vercel.app/chrome-football-helmet.gltf', true);

  useEffect(() => {
    console.log('ChromeHelmet: helmetScene loaded:', !!helmetScene);
    console.log('ChromeHelmet: helmetScene loaded successfully');
    
    // Error handling removed since useGLTF doesn't return errors

    if (helmetScene) {
      console.log('ChromeHelmet: Applying chrome material to helmet');
      // Apply chrome material to all meshes
      helmetScene.traverse((child: any) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 1.0,
            roughness: 0.1,
            envMapIntensity: 1.0
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      setIsLoading(false);
    }
  }, [helmetScene]);

  // Animation loop
  useFrame((state, delta) => {
    if (helmetRef.current) {
      helmetRef.current.rotation.y += 0.005;
    }
  });

  if (isLoading) {
    return (
      <mesh position={[0, 0, -50]} scale={[2, 2, 2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={0x666666}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    );
  }

  if (error || !helmetScene) {
    console.log('ChromeHelmet: Using fallback chrome sphere');
    // Fallback chrome sphere
    return (
      <mesh position={[0, 0, -50]} scale={[2, 2, 2]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          color={0x888888}
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>
    );
  }

  return (
    <primitive 
      ref={helmetRef}
      object={helmetScene} 
      position={[0, 0, -50]}
      scale={[2, 2, 2]}
    />
  );
}

function Background() {
  return (
    <mesh position={[0, 0, -100]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial 
        color={0x1a1a2e}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

function Scene3D() {
  return (
    <Canvas
      camera={{ 
        position: [0, 0, 5], 
        fov: 75,
        near: 0.1,
        far: 1000
      }}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow 
      />
      <pointLight position={[-3, 2, 3]} intensity={0.8} />
      <pointLight position={[3, -2, -3]} intensity={0.6} />
      
      {/* Environment for better chrome reflections */}
      <Environment preset="city" />
      
      {/* Background */}
      <Background />
      
      {/* Chrome Helmet */}
      <ChromeHelmet />
      
      {/* Disable controls since this is background */}
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
}

export default function ChromeHelmetScene({ className = '' }: ChromeHelmetSceneProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ zIndex: -1 }}>
      {isClient ? (
        <Scene3D />
      ) : (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#888',
          fontSize: '14px'
        }}>
          Loading 3D Scene...
        </div>
      )}
    </div>
  );
}

// Preload the GLTF (only on client) - using Vercel path
if (typeof window !== 'undefined') {
  useGLTF.preload('https://college-football-fantasy-app.vercel.app/chrome-football-helmet.gltf');
} 