import { create } from "zustand";
import * as THREE from "three";

interface CapsuleCharactersState {
  characters: THREE.Object3D[];
  setCharacters: (characters: THREE.Object3D[]) => void;
  getCharacterByName: (name: string) => THREE.Object3D | undefined;
  getCharacterById: (id: number) => THREE.Object3D | undefined;
}

export const useCapsuleCharacters = create<CapsuleCharactersState>((set, get) => ({
  characters: [],
  
  setCharacters: (characters) => set({ characters }),
  
  getCharacterByName: (name) => {
    const { characters } = get();
    return characters.find(character => character.name === name);
  },
  
  getCharacterById: (id) => {
    const { characters } = get();
    return characters[id];
  }
}));
