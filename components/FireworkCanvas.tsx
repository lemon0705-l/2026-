
import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

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

  // Master Palette: Red, White
  const palette = ['#FF0000', '#FF3333', '#FFFFFF', '#FFEEFF', '#770000'];

  const createFirework = (x: number, y: number): EnhancedFirework => {
    const particles: PainterlyParticle[] = [];
    const mainColor = palette[Math.floor(Math.random() * palette.length)];
    
    // Streaks
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: Math.random() > 0.3 ? mainColor : '#FFFFFF',
        gravity: 0.1, friction: 0.95, size: Math.random() * 2 + 1,
        history: [], type: 'streak', decay: 0.007 + Math.random() * 0.01
      });
    }

    // Sparks
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        alpha: 1, color: '#FFFFFF', gravity: 0.05, friction: 0.93,
        size: Math.random() * 1.2, history: [], type: 'spark', decay: 0.02
      });
    }

    // Orbs
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 120, y: y + (Math.random() - 0.5) * 120,
        vx: 0, vy: 0, alpha: 0.25, color: mainColor,
        gravity: 0, friction: 1, size: Math.random() * 50 + 30,
        history: [], type: 'orb', decay: 0.003
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
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      fireworks.current.forEach((fw) => {
        fw.age++;
        fw.particles.forEach(p => {
          if (p.type !== 'orb') {
            p.history.push({ x: p.x, y: p.y });
            if (p.history.length > 12) p.history.shift();
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
              
              // Light head
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
              ctx.fillStyle = '#FFFFFF';
              ctx.fill();
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
        const x = window.innerWidth * (0.15 + Math.random() * 0.7);
        const y = window.innerHeight * (0.1 + Math.random() * 0.4);
        fireworks.current.push(createFirework(x, y));
      }, 700);
      return () => clearInterval(interval);
    }
  }, [active]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />;
};

export default FireworkCanvas;
