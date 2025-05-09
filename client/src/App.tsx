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
    // Create audio elements
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;
    
    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.5;
    
    // Set local state
    setBackgroundMusic(bgMusic);
    setHitSound(hit);
    setSuccessSound(success);
    
    // Set store state
    setStoreBackgroundMusic(bgMusic);
    setStoreHitSound(hit);
    setStoreSuccessSound(success);
    
    // Start playing background music
    // Use a timeout to ensure the audio is ready
    const audioTimeout = setTimeout(() => {
      startBackgroundMusic();
    }, 1000);
    
    return () => {
      // Clean up
      clearTimeout(audioTimeout);
      bgMusic.pause();
      hit.pause();
      success.pause();
    };
  }, [setStoreBackgroundMusic, setStoreHitSound, setStoreSuccessSound, startBackgroundMusic]);

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
