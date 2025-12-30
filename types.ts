
export interface Wish {
  id: string;
  name: string;
  content: string;
  timestamp: number;
}

export interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  wind: number;
  opacity: number;
  isHexagon: boolean;
  angle: number;
  spin: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  gravity: number;
  friction: number;
  size: number;
}

export interface Firework {
  x: number;
  y: number;
  particles: Particle[];
  age: number;
  maxAge: number;
}
