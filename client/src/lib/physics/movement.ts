import * as THREE from "three";

// Constants
const DEFAULT_SPEED = 0.05;
const DEFAULT_TURN_SPEED = 0.1;
const DEFAULT_ACCELERATION = 0.005;
const DEFAULT_DECELERATION = 0.01;
const DEFAULT_JUMP_FORCE = 0.15;
const DEFAULT_GRAVITY = 0.01;

// Interface for movement parameters
export interface MovementParams {
  speed?: number;
  turnSpeed?: number;
  acceleration?: number;
  deceleration?: number;
  jumpForce?: number;
  gravity?: number;
}

// Class for handling character movement
export class Movement {
  // Movement properties
  private velocity: THREE.Vector3;
  private acceleration: THREE.Vector3;
  private direction: THREE.Vector3;
  private rotation: number;
  private rotationVelocity: number;
  
  // Parameters
  private speed: number;
  private turnSpeed: number;
  private accelRate: number;
  private decelRate: number;
  private jumpForce: number;
  private gravity: number;
  
  // State
  private isGrounded: boolean;
  private isJumping: boolean;
  
  constructor(params?: MovementParams) {
    // Initialize vectors
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.acceleration = new THREE.Vector3(0, 0, 0);
    this.direction = new THREE.Vector3(0, 0, 1);
    
    // Initialize parameters
    this.speed = params?.speed || DEFAULT_SPEED;
    this.turnSpeed = params?.turnSpeed || DEFAULT_TURN_SPEED;
    this.accelRate = params?.acceleration || DEFAULT_ACCELERATION;
    this.decelRate = params?.deceleration || DEFAULT_DECELERATION;
    this.jumpForce = params?.jumpForce || DEFAULT_JUMP_FORCE;
    this.gravity = params?.gravity || DEFAULT_GRAVITY;
    
    // Initialize state
    this.rotation = 0;
    this.rotationVelocity = 0;
    this.isGrounded = true;
    this.isJumping = false;
  }
  
  // Apply movement to an object
  update(object: THREE.Object3D, delta: number = 1): void {
    // Apply rotation
    object.rotation.y += this.rotationVelocity * this.turnSpeed * delta;
    this.rotation = object.rotation.y;
    
    // Update direction vector based on rotation
    this.direction.set(
      Math.sin(this.rotation),
      0,
      Math.cos(this.rotation)
    );
    
    // Apply acceleration to velocity
    this.velocity.add(this.acceleration);
    
    // Apply gravity
    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }
    
    // Apply friction (deceleration)
    this.velocity.x *= (1 - this.decelRate * delta);
    this.velocity.z *= (1 - this.decelRate * delta);
    
    // Clamp horizontal velocity
    const horizontalSpeed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);
    if (horizontalSpeed > this.speed) {
      const scale = this.speed / horizontalSpeed;
      this.velocity.x *= scale;
      this.velocity.z *= scale;
    }
    
    // Apply velocity to position
    object.position.x += this.velocity.x * delta;
    object.position.y += this.velocity.y * delta;
    object.position.z += this.velocity.z * delta;
    
    // Reset acceleration
    this.acceleration.set(0, 0, 0);
    
    // Ground check
    if (object.position.y <= 0 && this.velocity.y <= 0) {
      object.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.isJumping = false;
    }
    
    // Reset rotation velocity (for smooth movement)
    this.rotationVelocity *= 0.8;
  }
  
  // Move forward relative to current direction
  moveForward(intensity: number = 1): void {
    this.acceleration.x += this.direction.x * this.accelRate * intensity;
    this.acceleration.z += this.direction.z * this.accelRate * intensity;
  }
  
  // Move backward relative to current direction
  moveBackward(intensity: number = 1): void {
    this.acceleration.x -= this.direction.x * this.accelRate * intensity;
    this.acceleration.z -= this.direction.z * this.accelRate * intensity;
  }
  
  // Move left (strafe) relative to current direction
  moveLeft(intensity: number = 1): void {
    // Perpendicular to forward direction
    this.acceleration.x += this.direction.z * this.accelRate * intensity;
    this.acceleration.z -= this.direction.x * this.accelRate * intensity;
  }
  
  // Move right (strafe) relative to current direction
  moveRight(intensity: number = 1): void {
    // Perpendicular to forward direction
    this.acceleration.x -= this.direction.z * this.accelRate * intensity;
    this.acceleration.z += this.direction.x * this.accelRate * intensity;
  }
  
  // Rotate left
  turnLeft(intensity: number = 1): void {
    this.rotationVelocity += intensity;
  }
  
  // Rotate right
  turnRight(intensity: number = 1): void {
    this.rotationVelocity -= intensity;
  }
  
  // Jump (if grounded)
  jump(): void {
    if (this.isGrounded && !this.isJumping) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.isJumping = true;
    }
  }
  
  // Move toward a target position
  moveToward(target: THREE.Vector3, intensity: number = 1): void {
    const direction = new THREE.Vector3()
      .subVectors(target, new THREE.Vector3(0, 0, 0))
      .normalize();
    
    this.acceleration.x += direction.x * this.accelRate * intensity;
    this.acceleration.z += direction.z * this.accelRate * intensity;
  }
  
  // Getters/setters for movement properties
  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }
  
  getDirection(): THREE.Vector3 {
    return this.direction.clone();
  }
  
  setSpeed(speed: number): void {
    this.speed = speed;
  }
  
  setTurnSpeed(turnSpeed: number): void {
    this.turnSpeed = turnSpeed;
  }
  
  isMoving(): boolean {
    return this.velocity.length() > 0.001;
  }
}
