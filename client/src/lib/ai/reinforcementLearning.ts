interface StateAction {
  state: string;
  action: string;
}

interface QValue {
  [key: string]: number;
}

export class ReinforcementLearning {
  private qTable: Record<string, QValue>;
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private lastState: string | null;
  private lastAction: string | null;
  
  constructor() {
    this.qTable = {};
    this.learningRate = 0.1;
    this.discountFactor = 0.9;
    this.explorationRate = 0.2;
    this.lastState = null;
    this.lastAction = null;
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
  }
  
  // Get all possible actions for a state
  getPossibleActions(state: string): string[] {
    // For this simple implementation, return fixed set of actions
    return ['moveForward', 'moveBackward', 'turnLeft', 'turnRight', 'approachOther', 'avoidOther', 'rest'];
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
  
  // Train the model with a reward
  train(newState: string, reward: number): void {
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
  
  // Get learning progress
  getLearningProgress(): number {
    // Count how many state-action pairs have been learned
    const keys = Object.keys(this.qTable);
    return keys.length;
  }
  
  // Reset learning
  reset(): void {
    this.qTable = {};
    this.lastState = null;
    this.lastAction = null;
    this.explorationRate = 0.2;
  }
}
