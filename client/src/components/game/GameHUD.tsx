import React, { useState, useCallback } from "react";
import { Html } from "@react-three/drei";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { useAudio } from "../../lib/stores/useAudio";

const GameHUD: React.FC = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  const { isMuted, toggleMute } = useAudio();
  
  const toggleHelp = useCallback(() => {
    setHelpOpen(prev => !prev);
  }, []);
  
  return (
    <>
      {/* Fixed position HUD using Html component */}
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
                onClick={toggleHelp}
                variant="outline"
                className="bg-gray-800 bg-opacity-80 text-white hover:bg-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </Button>
            </div>
            
            <div className="text-white bg-gray-800 bg-opacity-80 py-2 px-4 rounded-lg">
              <h2 className="text-lg font-bold">Capsule Characters</h2>
            </div>
          </div>
          
          {/* Bottom bar with instructions */}
          <div className="absolute bottom-4 left-0 w-full flex justify-center">
            <div className="bg-gray-800 bg-opacity-80 text-white py-2 px-4 rounded-lg">
              <p>Click on a character to activate its AI behavior</p>
            </div>
          </div>
        </div>
      </Html>
      
      {/* Help dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>How to Play</DialogTitle>
            <DialogDescription>
              Learn about the capsule characters and how to interact with them.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Character Personalities</h3>
              <ul className="ml-6 space-y-1 list-disc">
                <li><span className="font-bold text-red-500">Reddy</span> - Energetic: Moves quickly and covers large areas</li>
                <li><span className="font-bold text-blue-500">Bluie</span> - Shy: Avoids other characters and moves cautiously</li>
                <li><span className="font-bold text-green-500">Greeny</span> - Social: Seeks out other characters and enjoys company</li>
                <li><span className="font-bold text-yellow-500">Yellowy</span> - Lazy: Moves slowly and takes frequent breaks</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Controls</h3>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Click on a character to activate its AI behavior</li>
                <li>Use the orbit controls to navigate the camera around the scene</li>
                <li>The characters will learn from their environment through reinforcement learning</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Learning</h3>
              <p>Characters learn through reinforcement learning. They get rewards for:</p>
              <ul className="ml-6 space-y-1 list-disc">
                <li>Successfully reaching targets</li>
                <li>Avoiding obstacles</li>
                <li>Interacting according to their personality type</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setHelpOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameHUD;
