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
              onClick={() => {
                if (confirm("Are you sure you want to reset the game? This will delete all characters.")) {
                  // Clear the database
                  db.clearAllCharacters()
                    .then(() => {
                      alert("Game reset successfully! The page will reload.");
                      window.location.reload();
                    })
                    .catch(error => {
                      console.error("Error resetting game:", error);
                      alert("Error resetting game. Please try again.");
                    });
                }
              }}
              variant="outline"
              className="bg-gray-800 bg-opacity-80 text-white hover:bg-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>
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
          // Portal this outside of the canvas to avoid rendering issues
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'auto'
          }}>
            <div style={{
              backgroundColor: '#1f2937',
              color: 'white',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>CAPSULE CHARACTERS - HOW TO PLAY</h2>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e0',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                  onMouseOut={(e) => e.currentTarget.style.color = '#cbd5e0'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>Character Personalities:</h3>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}><span style={{ color: '#f87171', fontWeight: 'bold' }}>Red/Orange</span> - Energetic: Moves quickly and covers large areas</li>
                  <li style={{ marginBottom: '4px' }}><span style={{ color: '#60a5fa', fontWeight: 'bold' }}>Blue</span> - Shy: Avoids other characters and moves cautiously</li>
                  <li style={{ marginBottom: '4px' }}><span style={{ color: '#4ade80', fontWeight: 'bold' }}>Green</span> - Social: Seeks out other characters and enjoys company</li>
                  <li style={{ marginBottom: '4px' }}><span style={{ color: '#fde047', fontWeight: 'bold' }}>Yellow</span> - Lazy: Moves slowly and takes frequent breaks</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>Controls:</h3>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}>Click on a character to activate its AI behavior</li>
                  <li style={{ marginBottom: '4px' }}>Use the orbit controls to navigate the camera</li>
                  <li style={{ marginBottom: '4px' }}>Characters learn through reinforcement learning</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>Learning & Reproduction:</h3>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}>Characters get rewards for:</li>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '4px' }}>Successfully reaching targets</li>
                    <li style={{ marginBottom: '4px' }}>Avoiding obstacles</li>
                    <li style={{ marginBottom: '4px' }}>Interacting according to their personality type</li>
                  </ul>
                  <li style={{ marginBottom: '4px' }}>Characters can reproduce when they learn enough</li>
                  <li style={{ marginBottom: '4px' }}>They can also jump as they learn new behaviors</li>
                </ul>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>Management:</h3>
                <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '4px' }}>Characters are saved in the browser database</li>
                  <li style={{ marginBottom: '4px' }}>Learning progress is persistent between sessions</li>
                  <li style={{ marginBottom: '4px' }}>Add more characters with the "Add Character" button</li>
                </ul>
              </div>
              
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '1rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
};

export default GameHUD;
