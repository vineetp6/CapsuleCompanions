export type PersonalityType = "energetic" | "lazy" | "shy" | "social";

// Collection of actions for each personality type
const personalityActions = {
  energetic: [
    "jumps excitedly and runs in circles.",
    "dashes toward a new spot with enthusiasm!",
    "bounces up and down, full of energy.",
    "zooms around looking for something interesting.",
    "spins with joy, unable to contain the excitement.",
    "performs a quick dance move, showing off.",
    "races to investigate a noise in the distance.",
    "playfully rolls around, burning off energy.",
    "practices cartwheels and somersaults.",
    "challenges anyone to a race."
  ],
  
  lazy: [
    "yawns and finds a comfortable spot to rest.",
    "slowly moves a tiny bit, then decides it's too much effort.",
    "stretches out for a nap under a tree.",
    "barely opens an eye to see what's happening.",
    "contemplates moving, but decides against it.",
    "rolls to a slightly different position with minimal effort.",
    "watches others with sleepy eyes.",
    "dreams about doing things rather than actually doing them.",
    "finds the warmest spot to doze off.",
    "sighs contentedly while doing absolutely nothing."
  ],
  
  shy: [
    "cautiously peeks out from behind a safe spot.",
    "nervously moves to a quiet corner away from others.",
    "startles at a sudden movement, then calms down.",
    "blushes when someone looks their way.",
    "timidly approaches something interesting, ready to retreat.",
    "finds a good hiding spot to observe from.",
    "hesitantly explores when nobody is watching.",
    "quietly collects pretty leaves and stones.",
    "keeps a safe distance from unfamiliar characters.",
    "whispers something so quietly that nobody can hear it."
  ],
  
  social: [
    "waves excitedly at everyone nearby.",
    "approaches another character to start a conversation.",
    "shares a funny story with anyone who'll listen.",
    "organizes a small gathering under the big tree.",
    "invites others to join in a game.",
    "compliments someone on their appearance.",
    "introduces themselves to newcomers with a big smile.",
    "tries to make friends with even the shyest character.",
    "throws an impromptu dance party.",
    "suggests a group activity for everyone to enjoy."
  ]
};

export class Personality {
  type: PersonalityType;
  
  constructor(type: PersonalityType) {
    this.type = type;
  }
  
  // Get a random action based on personality type
  getRandomAction(): string {
    const actions = personalityActions[this.type];
    const randomIndex = Math.floor(Math.random() * actions.length);
    return actions[randomIndex];
  }
  
  // How likely is this personality to approach others?
  getSocialScore(): number {
    switch (this.type) {
      case "energetic": return 0.7;
      case "lazy": return 0.3;
      case "shy": return 0.1;
      case "social": return 0.9;
      default: return 0.5;
    }
  }
  
  // How much does this personality prefer movement?
  getActivityScore(): number {
    switch (this.type) {
      case "energetic": return 0.9;
      case "lazy": return 0.2;
      case "shy": return 0.5;
      case "social": return 0.7;
      default: return 0.5;
    }
  }
  
  // How likely is this personality to explore new areas?
  getAdventureScore(): number {
    switch (this.type) {
      case "energetic": return 0.8;
      case "lazy": return 0.1;
      case "shy": return 0.4;
      case "social": return 0.6;
      default: return 0.5;
    }
  }
  
  // Get decision weights for different actions
  getDecisionWeights(): Record<string, number> {
    return {
      approachOthers: this.getSocialScore(),
      exploreNewAreas: this.getAdventureScore(),
      restInPlace: 1 - this.getActivityScore(),
      playAlone: (1 - this.getSocialScore()) * this.getActivityScore(),
      watchOthers: (1 - this.getActivityScore()) * this.getSocialScore()
    };
  }
  
  // Make a weighted decision based on personality
  makeDecision(options: string[]): string {
    const weights = this.getDecisionWeights();
    
    // Calculate total weight for available options
    let totalWeight = 0;
    const availableWeights: number[] = [];
    
    options.forEach(option => {
      const weight = weights[option] || 0.5; // Default weight if not defined
      availableWeights.push(weight);
      totalWeight += weight;
    });
    
    // Normalize weights
    const normalizedWeights = availableWeights.map(w => w / totalWeight);
    
    // Choose based on weighted probability
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < normalizedWeights.length; i++) {
      cumulativeWeight += normalizedWeights[i];
      if (random <= cumulativeWeight) {
        return options[i];
      }
    }
    
    // Fallback
    return options[options.length - 1];
  }
}
