interface StateAction {
  state: string;
  action: string;
}

interface QValue {
  [key: string]: number;
}

export interface Experience {
  state: string;
  action: string;
  reward: number;
  nextState: string;
  timestamp: number;
}

export class ReinforcementLearning {
  private qTable: Record<string, QValue>;
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private lastState: string | null;
  private lastAction: string | null;
  private experienceBuffer: Experience[];
  private maxBufferSize: number;
  private experiences: string[]; // Textual descriptions of experiences
  
  constructor() {
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.explorationRate = 0.2;
    this.lastState = null;
    this.lastAction = null;
    this.experienceBuffer = [];
    this.maxBufferSize = 100; // Store the last 100 experiences
    this.experiences = [];
  }
  
  // Get key for the Q-table
  private getStateActionKey(state: string, action: string): string {
    return `${state}:${action}`;
  }
  
  // Initialize Q-value if not present
  private initQValue(state: string, action: string): void {
    const stateKey = this.getStateActionKey(state, action);
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = {};
    }
  }
  
  // Get Q-value for a state-action pair
  getQValue(state: string, action: string): number {
    const stateKey = this.getStateActionKey(state, action);
    if (!this.qTable[stateKey]) {
      return 0;
    }
    return this.qTable[stateKey][action] || 0;
  }
  
  // Update Q-value based on reward
  private updateQValue(state: string, action: string, newState: string, reward: number): void {
    const stateKey = this.getStateActionKey(state, action);
    this.initQValue(state, action);
    
    // Get the best action for the new state
    const possibleActions = this.getPossibleActions(newState);
    let maxQValue = 0;
    
    for (const nextAction of possibleActions) {
      const qValue = this.getQValue(newState, nextAction);
      maxQValue = Math.max(maxQValue, qValue);
    }
    
    // Q-learning update formula
    const oldValue = this.qTable[stateKey][action] || 0;
    const newValue = oldValue + this.learningRate * (reward + this.discountFactor * maxQValue - oldValue);
    
    this.qTable[stateKey][action] = newValue;
    
    // Add to experience buffer
    this.addExperience({
      state,
      action,
      reward,
      nextState: newState,
      timestamp: Date.now()
    });
  }
  
  // Get all possible actions for a state
  getPossibleActions(state: string): string[] {
    // Enhanced set of actions including jumping and reproduction
    return [
      'moveForward', 'moveBackward', 'turnLeft', 'turnRight', 
      'approachOther', 'avoidOther', 'rest', 'jump', 'reproduce',
      'explore', 'dance', 'spin', 'follow', 'lead'
    ];
  }
  
  // Choose an action using epsilon-greedy strategy
  chooseAction(state: string): string {
    // Epsilon-greedy: explore random actions some of the time
    if (Math.random() < this.explorationRate) {
      const actions = this.getPossibleActions(state);
      return actions[Math.floor(Math.random() * actions.length)];
    }
    
    // Otherwise choose the best action according to Q-values
    const actions = this.getPossibleActions(state);
    let bestAction = actions[0];
    let bestValue = this.getQValue(state, bestAction);
    
    for (let i = 1; i < actions.length; i++) {
      const action = actions[i];
      const qValue = this.getQValue(state, action);
      
      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    }
    
    return bestAction;
  }
  
  // Record a state and chosen action
  recordStateAction(state: string, action: string): void {
    this.lastState = state;
    this.lastAction = action;
  }
  
  // Add an experience to the buffer
  private addExperience(experience: Experience): void {
    this.experienceBuffer.push(experience);
    
    // Keep buffer size under maxBufferSize
    if (this.experienceBuffer.length > this.maxBufferSize) {
      this.experienceBuffer.shift();
    }
    
    // Generate textual description of the experience
    const experienceText = this.generateExperienceText(experience);
    if (experienceText) {
      this.experiences.push(experienceText);
      // Keep experiences array manageable
      if (this.experiences.length > 20) {
        this.experiences.shift();
      }
    }
  }
  
  // Generate textual description of an experience
  private generateExperienceText(experience: Experience): string | null {
    const { state, action, reward } = experience;
    
    // Only generate text for significant experiences (high rewards or penalties)
    if (Math.abs(reward) < 0.5) return null;
    
    let description = '';
    
    if (reward > 0) {
      // Positive experiences
      switch (action) {
        case 'moveForward':
          description = "moved forward successfully";
          break;
        case 'approachOther':
          description = "enjoyed approaching another character";
          break;
        case 'avoidObstacle':
          description = "skillfully avoided an obstacle";
          break;
        case 'reachedTarget':
          description = "reached a destination";
          break;
        case 'jump':
          description = "performed a perfect jump";
          break;
        case 'reproduce':
          description = "successfully reproduced";
          break;
        case 'dance':
          description = "danced happily";
          break;
        case 'follow':
          description = "followed another character";
          break;
        default:
          description = `performed ${action} successfully`;
      }
    } else {
      // Negative experiences
      switch (action) {
        case 'collision':
          description = "bumped into an obstacle";
          break;
        case 'moveBackward':
          description = "moved backward awkwardly";
          break;
        case 'reproduce':
          description = "failed to reproduce";
          break;
        case 'jump':
          description = "stumbled during a jump";
          break;
        default:
          description = `struggled with ${action}`;
      }
    }
    
    return description;
  }
  
  // Get recent experiences
  getRecentExperiences(count: number = 3): string[] {
    return this.experiences.slice(-count);
  }
  
  // Train the model with a reward
  train(newState: string, reward: number): string {
    if (this.lastState && this.lastAction) {
      this.updateQValue(this.lastState, this.lastAction, newState, reward);
      
      // Update the exploration rate (decrease over time)
      this.explorationRate = Math.max(0.05, this.explorationRate * 0.999);
    }
    
    // Record the new state and choose an action
    const nextAction = this.chooseAction(newState);
    this.recordStateAction(newState, nextAction);
    
    return nextAction;
  }
  
  // Use experience replay to improve learning
  replayExperiences(batchSize: number = 10): void {
    if (this.experienceBuffer.length < batchSize) return;
    
    // Sample random experiences from buffer
    for (let i = 0; i < batchSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.experienceBuffer.length);
      const experience = this.experienceBuffer[randomIndex];
      
      // Re-learn from this experience
      this.updateQValue(
        experience.state,
        experience.action,
        experience.nextState,
        experience.reward
      );
    }
  }
  
  // Get the best learned action for a state
  getBestAction(state: string): string {
    const actions = this.getPossibleActions(state);
    let bestAction = actions[0];
    let bestValue = this.getQValue(state, bestAction);
    
    for (let i = 1; i < actions.length; i++) {
      const action = actions[i];
      const qValue = this.getQValue(state, action);
      
      if (qValue > bestValue) {
        bestValue = qValue;
        bestAction = action;
      }
    }
    
    return bestAction;
  }
  
  // Get learning progress (normalized between 0 and 1)
  getLearningProgress(): number {
    // Count how many state-action pairs have been learned
    const keys = Object.keys(this.qTable);
    // Calculate a progress score between 0 and 1
    // Aim for at least 50 state-action pairs for "complete" learning
    return Math.min(1, keys.length / 50);
  }
  
  // Should the character reproduce?
  shouldReproduce(): boolean {
    // Characters should reproduce when they've learned enough
    // and reproduce is chosen as the best action
    if (this.getLearningProgress() > 0.5) {
      const lastState = this.lastState || 'default';
      const bestAction = this.getBestAction(lastState);
      return bestAction === 'reproduce' && Math.random() < 0.1; // 10% chance if conditions met
    }
    return false;
  }
  
  // Should the character jump?
  shouldJump(): boolean {
    if (this.lastState) {
      const bestAction = this.getBestAction(this.lastState);
      return bestAction === 'jump';
    }
    return false;
  }
  
  // Reset learning
  reset(): void {
    this.qTable = {};
    this.lastState = null;
    this.lastAction = null;
    this.explorationRate = 0.2;
    this.experienceBuffer = [];
    this.experiences = [];
  }
  
  // Save learning state to JSON
  saveToJSON(): string {
    return JSON.stringify({
      qTable: this.qTable,
      learningRate: this.learningRate,
      discountFactor: this.discountFactor,
      explorationRate: this.explorationRate,
      experiences: this.experiences
    });
  }
  
  // Load learning state from JSON
  loadFromJSON(json: string): void {
    try {
      const data = JSON.parse(json);
      this.qTable = data.qTable || {};
      this.learningRate = data.learningRate || 0.1;
      this.discountFactor = data.discountFactor || 0.9;
      this.explorationRate = data.explorationRate || 0.2;
      this.experiences = data.experiences || [];
    } catch (error) {
      console.error("Error loading learning state:", error);
    }
  }
}
