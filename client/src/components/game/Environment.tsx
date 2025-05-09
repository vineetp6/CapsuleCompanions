import React, { useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

interface EnvironmentProps {
  setObstacles: (obstacles: THREE.Object3D[]) => void;
}

export const Environment: React.FC<EnvironmentProps> = ({ setObstacles }) => {
  const obstaclesRef = useRef<THREE.Group>(null);
  
  // Load textures
  const grassTexture = useTexture("/textures/grass.png");
  const woodTexture = useTexture("/textures/wood.jpg");
  
  // Configure textures
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(10, 10);
  
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1, 1);
  
  // Register obstacles when component mounts
  React.useEffect(() => {
    if (obstaclesRef.current) {
      const obstacleObjects = obstaclesRef.current.children;
      setObstacles(obstacleObjects);
    }
  }, [setObstacles]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      {/* Obstacles group */}
      <group ref={obstaclesRef}>
        {/* Trees */}
        <group position={[5, 0, -3]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#2d6a4f" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
            <meshStandardMaterial map={woodTexture} />
          </mesh>
        </group>
        
        <group position={[-6, 0, 4]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshStandardMaterial color="#2d6a4f" />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 3, 16]} />
            <meshStandardMaterial map={woodTexture} />
          </mesh>
        </group>
        
        {/* Rocks */}
        <group position={[3, 0, 4]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#8d99ae" roughness={0.8} />
          </mesh>
        </group>
        
        <group position={[-4, 0, -5]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <dodecahedronGeometry args={[0.7, 0]} />
            <meshStandardMaterial color="#8d99ae" roughness={0.8} />
          </mesh>
        </group>
        
        {/* Fence */}
        <group position={[0, 0, 8]}>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh 
              key={`fence-${i}`} 
              position={[-5 + i * 2.5, 0.5, 0]} 
              castShadow
            >
              <boxGeometry args={[0.2, 1, 0.2]} />
              <meshStandardMaterial map={woodTexture} />
              
              <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[2.3, 0.2, 0.1]} />
                <meshStandardMaterial map={woodTexture} />
              </mesh>
              
              <mesh position={[0, -0.2, 0]}>
                <boxGeometry args={[2.3, 0.2, 0.1]} />
                <meshStandardMaterial map={woodTexture} />
              </mesh>
            </mesh>
          ))}
        </group>
        
        {/* Log */}
        <group position={[-2, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 3, 16]} />
            <meshStandardMaterial map={woodTexture} />
          </mesh>
        </group>
      </group>
    </>
  );
};

export default Environment;
