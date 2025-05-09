import React, { useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import { Button } from "../ui/button";
import { useAudio } from "../../lib/stores/useAudio";
import { db } from "../../lib/db/database";
import { PersonalityType } from "../../lib/ai/personality";

interface GameHUDProps {
  characterCount?: number;
  onAddCharacter?: (character: any) => void;
}

const GameHUD: React.FC<GameHUDProps> = ({ characterCount = 0, onAddCharacter }) => {
  const { isMuted, toggleMute, playHit } = useAudio();
  const [isAddingCharacter, setIsAddingCharacter] = useState(false);
  
  // Generate a random character name
  const generateRandomName = () => {
    const prefixes = ["Cap", "Bub", "Sphe", "Glob", "Bop", "Zip", "Orb", "Pop", "Dot", "Pix"];
    const suffixes = ["ster", "ble", "oid", "ius", "ix", "ling", "ton", "sy", "bot", "oo"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}`;
  };
  
  // Generate a random color
  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  
  // Generate a random personality
  const generateRandomPersonality = (): PersonalityType => {
    const personalities: PersonalityType[] = ["energetic", "lazy", "shy", "social"];
    return personalities[Math.floor(Math.random() * personalities.length)];
  };
  
  // Generate a random position
  const generateRandomPosition = (): [number, number, number] => {
    return [
      Math.random() * 16 - 8, // x: -8 to 8
      0.5,                    // y: constant
      Math.random() * 16 - 8  // z: -8 to 8
    ];
  };
  
  // Handle adding a new random character
  const handleAddCharacter = useCallback(async () => {
    if (isAddingCharacter) return;
    
    try {
      setIsAddingCharacter(true);
      playHit(); // Play sound when adding character
      
      const newCharacter = {
        name: generateRandomName(),
        personality: generateRandomPersonality(),
        color: generateRandomColor(),
        position: generateRandomPosition(),
        createdAt: new Date(),
        learningProgress: 0,
        experiences: []
      };
      
      // Add to database
      const id = await db.addCharacter(newCharacter);
      console.log(`Created new random character: ${newCharacter.name} (${id})`);
      
      // Add to state via callback instead of reloading
      if (onAddCharacter) {
        const newCharacterConfig = {
          ...newCharacter,
          id,
          personalityType: newCharacter.personality
        };
        onAddCharacter(newCharacterConfig);
      }
    } catch (error) {
      console.error('Error creating new character:', error);
    } finally {
      setIsAddingCharacter(false);
    }
  }, [isAddingCharacter, playHit, onAddCharacter]);
  
  // Custom help modal instead of using alert
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleHelp = useCallback(() => {
    setShowHelpModal(true);
  }, []);
  
  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div className="w-full h-full relative pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-4 left-0 w-full flex justify-between px-4 pointer-events-auto">
          <div className="flex gap-2">
            <Button 
              onClick={toggleMute}
              variant="outline"
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
            >
              {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
              )}
            </Button>
            
            <Button 
              onClick={handleHelp}
              variant="outline"
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </Button>
            
            <Button 
              onClick={handleAddCharacter}
              variant="outline"
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
              disabled={isAddingCharacter}
            >
              {isAddingCharacter ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  Add Character
                </span>
              )}
            </Button>
          </div>
          
          <div className="text-white bg-gray-800 bg-opacity-80 py-2 px-4 rounded-lg">
            <h2 className="text-lg font-bold">Capsule Characters</h2>
            <p className="text-sm text-center">Characters: {characterCount}</p>
          </div>
        </div>
        
        {/* Bottom bar with instructions */}
        <div className="absolute bottom-4 left-0 w-full flex justify-center">
          <div className="bg-gray-800 bg-opacity-80 text-white py-2 px-4 rounded-lg">
            <p>Click on a character to activate its AI behavior</p>
            <p className="text-xs mt-1 text-center">Characters learn over time and can jump or reproduce!</p>
          </div>
        </div>
        
        {/* Custom Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-gray-800 text-white rounded-lg p-6 max-w-xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">CAPSULE CHARACTERS - HOW TO PLAY</h2>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Character Personalities:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><span className="text-red-400 font-bold">Red/Orange</span> - Energetic: Moves quickly and covers large areas</li>
                    <li><span className="text-blue-400 font-bold">Blue</span> - Shy: Avoids other characters and moves cautiously</li>
                    <li><span className="text-green-400 font-bold">Green</span> - Social: Seeks out other characters and enjoys company</li>
                    <li><span className="text-yellow-300 font-bold">Yellow</span> - Lazy: Moves slowly and takes frequent breaks</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Controls:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Click on a character to activate its AI behavior</li>
                    <li>Use the orbit controls to navigate the camera</li>
                    <li>Characters learn through reinforcement learning</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Learning & Reproduction:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Characters get rewards for:</li>
                    <ul className="list-circle pl-5 space-y-1">
                      <li>Successfully reaching targets</li>
                      <li>Avoiding obstacles</li>
                      <li>Interacting according to their personality type</li>
                    </ul>
                    <li>Characters can reproduce when they learn enough</li>
                    <li>They can also jump as they learn new behaviors</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Management:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Characters are saved in the browser database</li>
                    <li>Learning progress is persistent between sessions</li>
                    <li>Add more characters with the "Add Character" button</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setShowHelpModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

export default GameHUD;
