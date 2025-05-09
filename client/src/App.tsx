import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";
import Game from "./components/game/Game";

// Define control keys for the game
export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  interact = 'interact',
}

// Define key mappings for controls
const keyMap = [
  { name: Controls.forward, keys: ["KeyW", "ArrowUp"] },
  { name: Controls.backward, keys: ["KeyS", "ArrowDown"] },
  { name: Controls.left, keys: ["KeyA", "ArrowLeft"] },
  { name: Controls.right, keys: ["KeyD", "ArrowRight"] },
  { name: Controls.interact, keys: ["Space"] },
];

// Main App component
function App() {
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [hitSound, setHitSound] = useState<HTMLAudioElement | null>(null);
  const [successSound, setSuccessSound] = useState<HTMLAudioElement | null>(null);
  const { 
    setBackgroundMusic: setStoreBackgroundMusic, 
    setHitSound: setStoreHitSound, 
    setSuccessSound: setStoreSuccessSound,
    startBackgroundMusic 
  } = useAudio();
  
  // Load audio files on component mount
  useEffect(() => {
    try {
      // Create audio elements with preload
      const bgMusic = new Audio();
      bgMusic.src = "/sounds/background.mp3";
      bgMusic.preload = "auto";
      bgMusic.loop = true;
      bgMusic.volume = 0.3;
      
      const hit = new Audio();
      hit.src = "/sounds/hit.mp3";
      hit.preload = "auto";
      hit.volume = 0.5;
      
      const success = new Audio();
      success.src = "/sounds/success.mp3";
      success.preload = "auto";
      success.volume = 0.5;
      
      console.log("Loading audio files...");
      
      // Event listeners to ensure sounds are loaded
      const handleBgLoaded = () => {
        console.log("Background music loaded successfully");
        // Set store state
        setStoreBackgroundMusic(bgMusic);
        
        // Try to start playing background music
        bgMusic.play().catch(err => {
          console.error("Could not play background music automatically:", err);
        });
      };
      
      const handleHitLoaded = () => {
        console.log("Hit sound loaded successfully");
        setStoreHitSound(hit);
      };
      
      const handleSuccessLoaded = () => {
        console.log("Success sound loaded successfully");
        setStoreSuccessSound(success);
      };
      
      // Handle loading errors
      const handleError = (e: ErrorEvent, soundType: string) => {
        console.error(`Error loading ${soundType} sound:`, e);
      };
      
      // Add event listeners
      bgMusic.addEventListener('canplaythrough', handleBgLoaded);
      hit.addEventListener('canplaythrough', handleHitLoaded);
      success.addEventListener('canplaythrough', handleSuccessLoaded);
      
      bgMusic.addEventListener('error', (e) => handleError(e as unknown as ErrorEvent, 'background'));
      hit.addEventListener('error', (e) => handleError(e as unknown as ErrorEvent, 'hit'));
      success.addEventListener('error', (e) => handleError(e as unknown as ErrorEvent, 'success'));
      
      // Set local state (immediately for UI purposes)
      setBackgroundMusic(bgMusic);
      setHitSound(hit);
      setSuccessSound(success);
      
      // Force load the audio files
      bgMusic.load();
      hit.load();
      success.load();
      
      return () => {
        // Remove event listeners
        bgMusic.removeEventListener('canplaythrough', handleBgLoaded);
        hit.removeEventListener('canplaythrough', handleHitLoaded);
        success.removeEventListener('canplaythrough', handleSuccessLoaded);
        
        // Clean up
        bgMusic.pause();
        hit.pause();
        success.pause();
      };
    } catch (err) {
      console.error("Error setting up audio:", err);
    }
  }, [setStoreBackgroundMusic, setStoreHitSound, setStoreSuccessSound]);

  return (
    <div className="w-full h-full bg-gray-900">
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{
            position: [0, 15, 15],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "default"
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          <Suspense fallback={null}>
            <Game />
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default App;
