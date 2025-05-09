import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  startBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false, // Start with sound on by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  startBackgroundMusic: () => {
    const { backgroundMusic, isMuted } = get();
    if (backgroundMusic && !isMuted) {
      try {
        // Create a new audio element each time for more reliable playback
        const newBgMusic = new Audio("/sounds/background.mp3");
        newBgMusic.loop = true;
        newBgMusic.volume = 0.3;
        
        // Set store background music to this new element
        set({ backgroundMusic: newBgMusic });
        
        // Try to play the music with proper error handling
        const playPromise = newBgMusic.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log("Background music started successfully");
          }).catch(error => {
            console.error("Background music play prevented:", error);
            
            // Fallback method - try to play on next user interaction
            document.addEventListener('click', function playOnClick() {
              newBgMusic.play().catch(e => console.error("Even after click, couldn't play background music:", e));
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }
      } catch (error) {
        console.error("Error starting background music:", error);
      }
    } else {
      console.log("Background music not started (muted or not available)");
    }
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Handle background music
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        // Create new background music when unmuting
        const startBgMusic = () => {
          try {
            const newBgMusic = new Audio("/sounds/background.mp3");
            newBgMusic.loop = true;
            newBgMusic.volume = 0.3;
            
            set({ backgroundMusic: newBgMusic });
            
            newBgMusic.play().catch(error => {
              console.error("Background music play prevented on unmute:", error);
              
              // Try on next click if autoplay is blocked
              document.addEventListener('click', function playOnClick() {
                newBgMusic.play().catch(e => console.error("Even after click, couldn't play background music:", e));
                document.removeEventListener('click', playOnClick);
              }, { once: true });
            });
          } catch (error) {
            console.error("Error starting background music on unmute:", error);
          }
        };
        
        startBgMusic();
      }
    } else if (!newMutedState) {
      // If no background music exists but we're unmuting, try to create it
      const newBgMusic = new Audio("/sounds/background.mp3");
      newBgMusic.loop = true;
      newBgMusic.volume = 0.3;
      
      set({ backgroundMusic: newBgMusic });
      
      newBgMusic.play().catch(error => {
        console.error("Background music play prevented on new creation:", error);
      });
    }
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    console.log("Attempting to play hit sound, muted:", isMuted, "sound:", hitSound);
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      try {
        // Create a brand new audio element for each play to avoid issues
        const newSound = new Audio("/sounds/hit.mp3");
        newSound.volume = 0.5;
        
        // Play the sound with proper error handling
        const playPromise = newSound.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Sound played successfully
            console.log("Hit sound played successfully");
          }).catch(error => {
            console.error("Hit sound play prevented:", error);
            
            // Fallback attempt - sometimes we need user interaction first
            document.addEventListener('click', function playOnClick() {
              newSound.play().catch(e => console.error("Even after click, couldn't play:", e));
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }
      } catch (error) {
        console.error("Error playing hit sound:", error);
      }
    } else {
      console.warn("Hit sound not available");
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      try {
        // Create a brand new audio element for each play to avoid issues
        const newSound = new Audio("/sounds/success.mp3");
        newSound.volume = 0.5;
        
        // Play the sound with proper error handling
        const playPromise = newSound.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Sound played successfully
            console.log("Success sound played successfully");
          }).catch(error => {
            console.error("Success sound play prevented:", error);
            
            // Fallback attempt - sometimes we need user interaction first
            document.addEventListener('click', function playOnClick() {
              newSound.play().catch(e => console.error("Even after click, couldn't play:", e));
              document.removeEventListener('click', playOnClick);
            }, { once: true });
          });
        }
      } catch (error) {
        console.error("Error playing success sound:", error);
      }
    } else {
      console.warn("Success sound not available");
    }
  }
}));
