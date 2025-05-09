import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import CapsuleCharacter from "./CapsuleCharacter";
import Environment from "./Environment";
import GameHUD from "./GameHUD";
import { PersonalityType } from "../../lib/ai/personality";
import { useCapsuleCharacters } from "../../lib/stores/useCapsuleCharacters";

// Define the capsule character configuration
interface CapsuleConfig {
  position: [number, number, number];
  color: string;
  name: string;
  personalityType: PersonalityType;
}

const Game: React.FC = () => {
  // Game state
  const [obstacles, setObstacles] = useState<THREE.Object3D[]>([]);
  const characterGroupRef = useRef<THREE.Group>(null);
  const { setCharacters } = useCapsuleCharacters();
  const { camera } = useThree();
  
  // Define the capsule characters
  const capsuleConfigs: CapsuleConfig[] = [
    { 
      position: [2, 0.5, 2], 
      color: "#FF5733", 
      name: "Reddy", 
      personalityType: "energetic" 
    },
    { 
      position: [-2, 0.5, -2], 
      color: "#3383FF", 
      name: "Bluie", 
      personalityType: "shy" 
    },
    { 
      position: [3, 0.5, -3], 
      color: "#33FF8D", 
      name: "Greeny", 
      personalityType: "social" 
    },
    { 
      position: [-3, 0.5, 3], 
      color: "#F6FF33", 
      name: "Yellowy", 
      personalityType: "lazy" 
    }
  ];
  
  // Store character references
  useEffect(() => {
    if (characterGroupRef.current) {
      setCharacters(characterGroupRef.current.children);
    }
  }, [setCharacters]);
  
  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <>
      {/* Camera settings */}
      <PerspectiveCamera makeDefault position={[0, 15, 15]} fov={50} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      {/* Environment */}
      <Environment setObstacles={setObstacles} />
      
      {/* Capsule characters */}
      <group ref={characterGroupRef}>
        {capsuleConfigs.map((config, index) => (
          <CapsuleCharacter
            key={index}
            position={config.position}
            color={config.color}
            name={config.name}
            personalityType={config.personalityType}
            obstacles={obstacles}
            otherCharacters={characterGroupRef.current?.children || []}
          />
        ))}
      </group>
      
      {/* HUD overlay */}
      <GameHUD />
    </>
  );
};

export default Game;
