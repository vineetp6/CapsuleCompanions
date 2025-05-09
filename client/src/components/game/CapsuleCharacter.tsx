import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAudio } from "../../lib/stores/useAudio";
import { Html } from "@react-three/drei";
import { Personality, PersonalityType } from "../../lib/ai/personality";
import { ReinforcementLearning } from "../../lib/ai/reinforcementLearning";

export interface CapsuleCharacterProps {
  position: [number, number, number];
  color: string;
  personalityType: PersonalityType;
  name: string;
  obstacles: THREE.Object3D[];
  otherCharacters: THREE.Object3D[];
}

export const CapsuleCharacter: React.FC<CapsuleCharacterProps> = ({
  position,
  color,
  personalityType,
  name,
  obstacles,
  otherCharacters,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const capsuleRef = useRef<THREE.Mesh>(null);
  const [isActive, setIsActive] = useState(false);
  const [actionText, setActionText] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const { playHit } = useAudio();
  
  // Create the personality instance
  const personality = useMemo(() => 
    new Personality(personalityType), [personalityType]);
  
  // Create the reinforcement learning instance
  const reinforcementLearning = useMemo(() => 
    new ReinforcementLearning(), []);
  
  // Cached movement variables
  const movementDirection = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const velocity = useMemo(() => new THREE.Vector3(), []);
  const [isColliding, setIsColliding] = useState(false);
  
  // Movement parameters based on personality
  const movementParams = useMemo(() => {
    switch (personalityType) {
      case "energetic":
        return { speed: 0.04, turnSpeed: 0.1, wanderRadius: 8 };
      case "lazy":
        return { speed: 0.01, turnSpeed: 0.05, wanderRadius: 3 };
      case "shy":
        return { speed: 0.02, turnSpeed: 0.08, wanderRadius: 4 };
      case "social":
        return { speed: 0.03, turnSpeed: 0.09, wanderRadius: 6 };
      default:
        return { speed: 0.025, turnSpeed: 0.07, wanderRadius: 5 };
    }
  }, [personalityType]);

  // Generate a new target position based on personality
  const generateNewTarget = useCallback(() => {
    if (!groupRef.current) return;
    
    const currentPos = groupRef.current.position.clone();
    
    // Different logic based on personality
    switch (personalityType) {
      case "energetic":
        // Energetic characters move in longer, more direct paths
        targetPosition.set(
          currentPos.x + (Math.random() * 2 - 1) * movementParams.wanderRadius,
          position[1], // Keep y-position constant
          currentPos.z + (Math.random() * 2 - 1) * movementParams.wanderRadius
        );
        break;
        
      case "lazy":
        // Lazy characters mostly stay in place with occasional small movements
        if (Math.random() > 0.7) { // 30% chance to move
          targetPosition.set(
            currentPos.x + (Math.random() * 2 - 1) * movementParams.wanderRadius * 0.5,
            position[1],
            currentPos.z + (Math.random() * 2 - 1) * movementParams.wanderRadius * 0.5
          );
        }
        break;
        
      case "shy":
        // Shy characters avoid other characters
        let avoidDirection = new THREE.Vector3();
        otherCharacters.forEach(character => {
          if (character !== groupRef.current) {
            const toOther = currentPos.clone().sub(character.position);
            const distance = toOther.length();
            if (distance < 5) { // If another character is close
              toOther.normalize().multiplyScalar(5 / distance); // Stronger avoidance for closer characters
              avoidDirection.add(toOther);
            }
          }
        });
        
        if (avoidDirection.length() > 0) {
          targetPosition.set(
            currentPos.x + avoidDirection.x + (Math.random() * 2 - 1),
            position[1],
            currentPos.z + avoidDirection.z + (Math.random() * 2 - 1)
          );
        } else {
          targetPosition.set(
            currentPos.x + (Math.random() * 2 - 1) * movementParams.wanderRadius,
            position[1],
            currentPos.z + (Math.random() * 2 - 1) * movementParams.wanderRadius
          );
        }
        break;
        
      case "social":
        // Social characters try to move toward other characters
        let nearestCharacter = null;
        let nearestDistance = Infinity;
        
        otherCharacters.forEach(character => {
          if (character !== groupRef.current) {
            const distance = currentPos.distanceTo(character.position);
            if (distance < nearestDistance && distance > 0.5) { // Prevent getting too close
              nearestDistance = distance;
              nearestCharacter = character;
            }
          }
        });
        
        if (nearestCharacter && nearestDistance > 2) {
          // Move toward nearest character
          const toCharacter = nearestCharacter.position.clone().sub(currentPos).normalize();
          targetPosition.set(
            currentPos.x + toCharacter.x * movementParams.wanderRadius * 0.7,
            position[1],
            currentPos.z + toCharacter.z * movementParams.wanderRadius * 0.7
          );
        } else {
          // Just wander if no characters nearby or already close to one
          targetPosition.set(
            currentPos.x + (Math.random() * 2 - 1) * movementParams.wanderRadius,
            position[1],
            currentPos.z + (Math.random() * 2 - 1) * movementParams.wanderRadius
          );
        }
        break;
        
      default:
        // Default random movement
        targetPosition.set(
          currentPos.x + (Math.random() * 2 - 1) * movementParams.wanderRadius,
          position[1],
          currentPos.z + (Math.random() * 2 - 1) * movementParams.wanderRadius
        );
    }
    
    // Boundary checks - keep within a 20x20 area
    targetPosition.x = Math.max(-10, Math.min(10, targetPosition.x));
    targetPosition.z = Math.max(-10, Math.min(10, targetPosition.z));
    
    // Generate appropriate action text
    generateActionText();
  }, [groupRef, personalityType, position, targetPosition, movementParams.wanderRadius, otherCharacters]);

  // Generate text that describes the character's actions
  const generateActionText = useCallback(() => {
    const actions = personality.getRandomAction();
    setActionText(`${name} ${actions}`);
  }, [name, personality]);

  // Initialize position and first action
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...position);
      generateNewTarget();
    }
    
    // Set a timer to change target position every few seconds
    const interval = setInterval(() => {
      if (isActive) {
        generateNewTarget();
      }
    }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds
    
    return () => clearInterval(interval);
  }, [position, generateNewTarget, isActive]);

  // Click handler to activate/deactivate the character
  const handleClick = (e: any) => {
    e.stopPropagation();
    setIsActive(!isActive);
    
    if (!isActive) {
      playHit();
      generateActionText();
    }
  };

  // Check for collision with obstacles
  const checkCollisions = useCallback(() => {
    if (!capsuleRef.current) return false;
    
    const capsuleBoundingBox = new THREE.Box3().setFromObject(capsuleRef.current);
    
    for (const obstacle of obstacles) {
      const obstacleBoundingBox = new THREE.Box3().setFromObject(obstacle);
      
      if (capsuleBoundingBox.intersectsBox(obstacleBoundingBox)) {
        return true;
      }
    }
    
    return false;
  }, [obstacles]);

  // Animation and movement logic
  useFrame((_, delta) => {
    if (!groupRef.current || !capsuleRef.current) return;
    
    if (isActive) {
      const currentPosition = groupRef.current.position;
      
      // Calculate direction to target
      movementDirection.subVectors(targetPosition, currentPosition).normalize();
      
      // Apply movement
      velocity.x = movementDirection.x * movementParams.speed;
      velocity.z = movementDirection.z * movementParams.speed;
      
      // Update position
      currentPosition.x += velocity.x;
      currentPosition.z += velocity.z;
      
      // Rotation to face movement direction
      if (velocity.length() > 0.001) {
        const targetRotation = Math.atan2(velocity.x, velocity.z);
        let currentRotation = groupRef.current.rotation.y;
        
        // Smooth rotation
        const rotationDiff = targetRotation - currentRotation;
        let deltaRotation = Math.atan2(Math.sin(rotationDiff), Math.cos(rotationDiff));
        groupRef.current.rotation.y += deltaRotation * movementParams.turnSpeed;
      }
      
      // Check for collisions
      const wasColliding = isColliding;
      const nowColliding = checkCollisions();
      setIsColliding(nowColliding);
      
      // Collision response
      if (nowColliding) {
        // Move back to avoid collision
        currentPosition.x -= velocity.x * 2;
        currentPosition.z -= velocity.z * 2;
        
        // If collision is new, apply reinforcement learning
        if (!wasColliding) {
          reinforcementLearning.train('collision', -1);
          // Choose a new direction
          generateNewTarget();
        }
      } else if (wasColliding && !nowColliding) {
        // Successfully avoided collision, positive reinforcement
        reinforcementLearning.train('avoidObstacle', 1);
      }
      
      // Check if we've reached the target (within a small threshold)
      if (currentPosition.distanceTo(targetPosition) < 0.2) {
        reinforcementLearning.train('reachedTarget', 1);
        generateNewTarget();
      }
      
      // Float animation - subtle up and down motion
      capsuleRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.05;
    }
  });

  return (
    <group 
      ref={groupRef} 
      onClick={handleClick}
      onPointerOver={() => setIsHovering(true)}
      onPointerOut={() => setIsHovering(false)}
    >
      {/* Capsule body */}
      <mesh ref={capsuleRef} castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1, 8, 16]} />
        <meshStandardMaterial color={color} />
        
        {/* Face elements */}
        <group position={[0, 0.3, 0.45]}>
          {/* Left eye */}
          <mesh position={[-0.2, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="white" />
            <mesh position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </mesh>
          
          {/* Right eye */}
          <mesh position={[0.2, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="white" />
            <mesh position={[0, 0, 0.08]}>
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshStandardMaterial color="black" />
            </mesh>
          </mesh>
          
          {/* Nose */}
          <mesh position={[0, -0.15, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>
        
        {/* Ears */}
        <mesh position={[-0.42, 0.4, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.42, 0.4, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </mesh>
      
      {/* Action/dialogue text */}
      {(isActive || isHovering) && (
        <Html
          position={[0, 1.5, 0]}
          center
          className="pointer-events-none"
        >
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg whitespace-nowrap">
            {isActive ? actionText : name}
          </div>
        </Html>
      )}
    </group>
  );
};

export default CapsuleCharacter;
