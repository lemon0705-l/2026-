
import React, { useEffect, useRef } from 'react';
import { Firework, Particle } from '../types';

interface FireworkCanvasProps {
  active: boolean;
}

interface PainterlyParticle extends Particle {
  history: { x: number; y: number }[];
  type: 'streak' | 'spark' | 'orb';
  decay: number;
}

interface EnhancedFirework {
  x: number;
  y: number;
  particles: PainterlyParticle[];
  age: number;
  maxAge: number;
}

const FireworkCanvas: React.FC<FireworkCanvasProps> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworks = useRef<EnhancedFirework[]>([]);

  const palette = ['#ff0000', '#e63946', '#ffffff', '#f1faee', '#ffd700', '#780000'];

  const createFirework = (x: number, y: number): EnhancedFirework => {
    const particles: PainterlyParticle[] = [];
    const mainColor = palette[Math.floor(Math.random() * palette.length)];
    const secondColor = palette[Math.floor(Math.random() * palette.length)];
    
    // Streaks
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: Math.random() > 0.4 ? mainColor : secondColor,
        gravity: 0.08, friction: 0.96, size: Math.random() * 2 + 1,
        history: [], type: 'streak', decay: 0.008 + Math.random() * 0.01
      });
    }

    // Sparks
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: '#fff', gravity: 0.04, friction: 0.94,
        size: Math.random() * 1, history: [], type: 'spark', decay: 0.02
      });
    }

    // Orbs
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 100, y: y + (Math.random() - 0.5) * 100,
        vx: 0, vy: 0, alpha: 0.3, color: mainColor,
        gravity: 0, friction: 1, size: Math.random() * 40 + 20,
        history: [], type: 'orb', decay: 0.004
      });
    }

    return { x, y, particles, age: 0, maxAge: 250 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    let animationFrameId: number;

    const animate = () => {
      // Trail effect without solid fill
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      fireworks.current.forEach((fw) => {
        fw.age++;
        fw.particles.forEach(p => {
          if (p.type !== 'orb') {
            p.history.push({ x: p.x, y: p.y });
            if (p.history.length > 10) p.history.shift();
            p.vx *= p.friction; p.vy *= p.friction; p.vy += p.gravity;
            p.x += p.vx; p.y += p.vy;
          }
          p.alpha -= p.decay;

          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            if (p.type === 'streak' && p.history.length > 1) {
              ctx.beginPath();
              ctx.moveTo(p.history[0].x, p.history[0].y);
              p.history.forEach(h => ctx.lineTo(h.x, h.y));
              ctx.strokeStyle = p.color;
              ctx.lineWidth = p.size;
              ctx.lineCap = 'round';
              ctx.stroke();
            } else if (p.type === 'spark') {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.fill();
            } else if (p.type === 'orb') {
              const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
              g.addColorStop(0, p.color);
              g.addColorStop(1, 'transparent');
              ctx.fillStyle = g;
              ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            }
            ctx.restore();
          }
        });
      });

      fireworks.current = fireworks.current.filter(fw => fw.age < fw.maxAge);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (active) {
      const interval = setInterval(() => {
        const x = window.innerWidth * (0.1 + Math.random() * 0.8);
        const y = window.innerHeight * (0.1 + Math.random() * 0.5);
        fireworks.current.push(createFirework(x, y));
      }, 800);
      return () => clearInterval(interval);
    }
  }, [active]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />;
};

export default FireworkCanvas;
