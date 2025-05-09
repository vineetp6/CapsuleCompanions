import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import CapsuleCharacter from "./CapsuleCharacter";
import Environment from "./Environment";
import GameHUD from "./GameHUD";
import { PersonalityType } from "../../lib/ai/personality";
import { useCapsuleCharacters } from "../../lib/stores/useCapsuleCharacters";
import { Character, db } from "../../lib/db/database";
import { useGame } from "../../lib/stores/useGame";

// Define the capsule character configuration
interface CapsuleConfig {
  position: [number, number, number];
  color: string;
  name: string;
  personalityType: PersonalityType;
  id?: number;
  parentId?: number;
  learningProgress?: number;
  experiences?: string[];
}

// Generate a random name based on parent name
const generateChildName = (parentName: string): string => {
  const suffixes = ["Jr", "II", "III", "Child", "Kid", "Mini", "Little", "Baby"];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  return `${parentName} ${randomSuffix}`;
};

// Generate a slightly mutated color from parent color
const generateChildColor = (parentColor: string): string => {
  // Convert hex to RGB
  const r = parseInt(parentColor.slice(1, 3), 16);
  const g = parseInt(parentColor.slice(3, 5), 16);
  const b = parseInt(parentColor.slice(5, 7), 16);
  
  // Add random mutation with limits
  const mutation = 30; // Max color shift
  const newR = Math.max(0, Math.min(255, r + Math.floor(Math.random() * mutation * 2) - mutation));
  const newG = Math.max(0, Math.min(255, g + Math.floor(Math.random() * mutation * 2) - mutation));
  const newB = Math.max(0, Math.min(255, b + Math.floor(Math.random() * mutation * 2) - mutation));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// Default characters if none in database
const defaultCharacters: CapsuleConfig[] = [
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

const Game: React.FC = () => {
  // Game state
  const [obstacles, setObstacles] = useState<THREE.Object3D[]>([]);
  const [characters, setCharactersState] = useState<CapsuleConfig[]>([]);
  const characterGroupRef = useRef<THREE.Group>(null);
  const { setCharacters } = useCapsuleCharacters();
  const { camera } = useThree();
  const { phase } = useGame();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load characters from database
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setIsLoading(true);
        
        // Get characters from database
        const dbCharacters = await db.getAllCharacters();
        
        if (dbCharacters.length > 0) {
          // Convert database characters to configs
          const characterConfigs = dbCharacters.map(char => ({
            id: char.id,
            position: char.position,
            color: char.color,
            name: char.name,
            personalityType: char.personality,
            parentId: char.parentId,
            learningProgress: char.learningProgress,
            experiences: char.experiences
          }));
          
          setCharactersState(characterConfigs);
          console.log(`Loaded ${characterConfigs.length} characters from database`);
        } else {
          // If no characters in database, create default ones
          console.log('No characters found in database, creating defaults');
          
          // Save default characters to database
          for (const char of defaultCharacters) {
            const id = await db.addCharacter({
              name: char.name,
              personality: char.personalityType,
              color: char.color,
              position: char.position,
              createdAt: new Date(),
              learningProgress: 0,
              experiences: []
            });
            
            char.id = id;
          }
          
          setCharactersState(defaultCharacters);
        }
      } catch (error) {
        console.error('Error loading characters:', error);
        setCharactersState(defaultCharacters);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCharacters();
  }, []);
  
  // Store character references in the global store
  useEffect(() => {
    if (characterGroupRef.current) {
      setCharacters(characterGroupRef.current.children);
    }
  }, [characters.length, setCharacters]);
  
  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 15, 15);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  // Handle reproduction from a character
  const handleReproduce = async (
    position: THREE.Vector3, 
    parentColor: string, 
    parentPersonality: PersonalityType,
    parentName: string,
    parentId?: number
  ) => {
    // Generate a random position near the parent
    const randomOffset = 0.5; // Distance from parent
    const newPosition: [number, number, number] = [
      position.x + (Math.random() * 2 - 1) * randomOffset,
      position.y,
      position.z + (Math.random() * 2 - 1) * randomOffset
    ];
    
    // Generate name, color and personality for the child
    const childName = generateChildName(parentName);
    const childColor = generateChildColor(parentColor);
    
    // 80% chance to inherit parent personality, 20% chance for random one
    let childPersonality = parentPersonality;
    if (Math.random() < 0.2) {
      const personalities: PersonalityType[] = ["energetic", "lazy", "shy", "social"];
      childPersonality = personalities[Math.floor(Math.random() * personalities.length)];
    }
    
    // Create new character in database
    const newCharacter: Character = {
      name: childName,
      personality: childPersonality,
      color: childColor,
      position: newPosition,
      createdAt: new Date(),
      parentId: parentId,
      learningProgress: 0,
      experiences: []
    };
    
    try {
      // Add to database and get ID
      const id = await db.addCharacter(newCharacter);
      
      // Add to state
      const newCharacterConfig: CapsuleConfig = {
        ...newCharacter,
        id,
        personalityType: newCharacter.personality
      };
      
      setCharactersState(prev => [...prev, newCharacterConfig]);
      console.log(`New character created: ${childName} (${id})`);
    } catch (error) {
      console.error('Error creating new character:', error);
    }
  };
  
  if (isLoading) {
    return null; // Don't render anything while loading
  }
  
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
        {characters.map((config) => (
          <CapsuleCharacter
            key={config.id || `temp-${config.name}`}
            position={config.position}
            color={config.color}
            name={config.name}
            personalityType={config.personalityType}
            obstacles={obstacles}
            otherCharacters={characterGroupRef.current?.children || []}
            onReproduce={handleReproduce}
            id={config.id}
            learningProgress={config.learningProgress || 0}
            experiences={config.experiences || []}
          />
        ))}
      </group>
      
      {/* HUD overlay */}
      <GameHUD characterCount={characters.length} />
    </>
  );
};

export default Game;
