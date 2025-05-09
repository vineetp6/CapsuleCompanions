import Dexie, { Table } from 'dexie';
import { PersonalityType } from '../ai/personality';

// Define interfaces for our database schema
export interface Character {
  id?: number;
  name: string;
  personality: PersonalityType;
  color: string;
  position: [number, number, number];
  createdAt: Date;
  parentId?: number; // Reference to parent character if born from another character
  learningProgress: number; // Track learning progress for this character
  experiences: string[]; // Array of experiences the character has had
}

export interface GameState {
  id?: number;
  lastPlayed: Date;
  charactersActive: number[];
  environment: string;
}

// Create a Dexie database
class GameDatabase extends Dexie {
  characters!: Table<Character, number>;
  gameState!: Table<GameState, number>;

  constructor() {
    super('capsuleCharactersGame');
    
    // Define tables and schema
    this.version(1).stores({
      characters: '++id, name, personality, createdAt, parentId',
      gameState: '++id, lastPlayed'
    });
  }

  // Get all characters
  async getAllCharacters(): Promise<Character[]> {
    return await this.characters.toArray();
  }
  
  // Add a new character
  async addCharacter(character: Character): Promise<number> {
    return await this.characters.add(character);
  }
  
  // Update a character
  async updateCharacter(id: number, changes: Partial<Character>): Promise<number> {
    return await this.characters.update(id, changes);
  }
  
  // Delete a character
  async deleteCharacter(id: number): Promise<void> {
    await this.characters.delete(id);
  }
  
  // Get game state
  async getGameState(): Promise<GameState | undefined> {
    return await this.gameState.orderBy('id').last();
  }
  
  // Save game state
  async saveGameState(state: GameState): Promise<number> {
    return await this.gameState.add(state);
  }
  
  // Add experience to a character
  async addExperience(characterId: number, experience: string): Promise<void> {
    const character = await this.characters.get(characterId);
    if (character) {
      const experiences = [...(character.experiences || []), experience];
      await this.characters.update(characterId, { experiences });
    }
  }
  
  // Update learning progress for a character
  async updateLearningProgress(characterId: number, progress: number): Promise<void> {
    await this.characters.update(characterId, { learningProgress: progress });
  }
  
  // Create a new character based on existing character (reproduction)
  async reproduceCharacter(parentId: number): Promise<number | undefined> {
    const parent = await this.characters.get(parentId);
    if (!parent) return undefined;
    
    // Generate a new name based on parent
    const baseColor = parent.color;
    // Slightly alter the color for the new character
    const colorValues = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(baseColor);
    let newColor = baseColor;
    
    if (colorValues) {
      const r = parseInt(colorValues[1], 16);
      const g = parseInt(colorValues[2], 16);
      const b = parseInt(colorValues[3], 16);
      
      // Generate a slightly different color
      const variation = 30; // Color variation amount
      const newR = Math.min(255, Math.max(0, r + Math.floor(Math.random() * variation * 2) - variation));
      const newG = Math.min(255, Math.max(0, g + Math.floor(Math.random() * variation * 2) - variation));
      const newB = Math.min(255, Math.max(0, b + Math.floor(Math.random() * variation * 2) - variation));
      
      newColor = `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    // Use position near the parent
    const [x, y, z] = parent.position;
    const newPosition: [number, number, number] = [
      x + (Math.random() * 2 - 1),
      y,
      z + (Math.random() * 2 - 1)
    ];
    
    // Get parent name and generate a new name
    const namePrefix = parent.name.replace(/\d+$/, '');
    const newName = `${namePrefix}${Math.floor(Math.random() * 1000)}`;
    
    // Create child character - 75% chance to inherit parent's personality, 25% chance for random
    const personalities: PersonalityType[] = ['energetic', 'lazy', 'shy', 'social'];
    const inheritPersonality = Math.random() < 0.75;
    const personality = inheritPersonality 
      ? parent.personality 
      : personalities[Math.floor(Math.random() * personalities.length)];
    
    // Create and add the new character
    const newCharacter: Character = {
      name: newName,
      personality,
      color: newColor,
      position: newPosition,
      createdAt: new Date(),
      parentId: parent.id,
      learningProgress: 0,
      experiences: []
    };
    
    return await this.addCharacter(newCharacter);
  }
}

// Export a singleton instance
export const db = new GameDatabase();