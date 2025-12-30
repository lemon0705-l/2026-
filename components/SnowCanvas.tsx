import React, { useEffect, useRef } from 'react';
import { Snowflake, Wish } from '../types';

interface SnowCanvasProps {
  onSnowflakeClick: () => void;
  onSavedClick: (wish: Wish) => void;
  settledWishes: Wish[];
}

const SnowCanvas: React.FC<SnowCanvasProps> = ({ onSnowflakeClick, onSavedClick, settledWishes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snowflakes = useRef<Snowflake[]>([]);
  const mouse = useRef({ x: -2000, y: -2000 });
  
  const createSnowflake = (width: number, initial = false): Snowflake => ({
    x: Math.random() * width,
    y: initial ? Math.random() * window.innerHeight : Math.random() * -100,
    radius: 2.2 + Math.random() * 2.8,
    speed: 0.3 + Math.random() * 0.5, 
    wind: (Math.random() - 0.5) * 0.12,
    opacity: 0.75 + Math.random() * 0.25, 
    isHexagon: false,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.015,
  });

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number, isSettled = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.shadowBlur = isSettled ? 35 : 20;
    ctx.shadowColor = isSettled ? 'rgba(255, 0, 0, 1.0)' : 'rgba(255, 255, 255, 0.9)';
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      const px = Math.cos((i * Math.PI) / 3) * r * 4.5;
      const py = Math.sin((i * Math.PI) / 3) * r * 4.5;
      ctx.lineTo(px, py);
      
      const bx = px * 0.55;
      const by = py * 0.55;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(((i * Math.PI) / 3) + 0.5) * r * 2.5, by + Math.sin(((i * Math.PI) / 3) + 0.5) * r * 2.5);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(((i * Math.PI) / 3) - 0.5) * r * 2.5, by + Math.sin(((i * Math.PI) / 3) - 0.5) * r * 2.5);
    }
    
    ctx.strokeStyle = isSettled ? '#FF0000' : '#FFFFFF';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      snowflakes.current = Array.from({ length: 180 }, () => createSnowflake(window.innerWidth, true));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let animationFrameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      snowflakes.current.forEach((s) => {
        s.y += s.speed;
        s.x += s.wind;
        s.angle += s.spin;

        const dx = s.x - mouse.current.x;
        const dy = s.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        s.isHexagon = dist < 75;

        if (s.isHexagon) {
          ctx.globalAlpha = 1.0;
          drawHexagon(ctx, s.x, s.y, s.radius * 1.6, s.angle);
        } else {
          ctx.globalAlpha = s.opacity;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
        }

        if (s.y > window.innerHeight + 50) {
          Object.assign(s, createSnowflake(window.innerWidth));
        }
      });

      // Bottom Settled
      const margin = 80;
      const totalWidth = Math.min(window.innerWidth * 0.8, settledWishes.length * 90);
      const startX = (window.innerWidth - totalWidth) / 2;
      
      settledWishes.forEach((wish, idx) => {
        const x = startX + (idx * 90) + 45;
        const y = window.innerHeight - 70;
        
        ctx.globalAlpha = 1;
        drawHexagon(ctx, x, y, 7, Date.now() * 0.0006, true);
        
        ctx.shadowBlur = 0;
        ctx.font = '700 11px Cinzel';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(wish.name.toUpperCase(), x, y + 45);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [settledWishes]);

  const handleMouseMove = (e: React.MouseEvent) => {
    mouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: React.MouseEvent) => {
    const hitFalling = snowflakes.current.find(s => {
      const dx = s.x - e.clientX;
      const dy = s.y - e.clientY;
      return Math.sqrt(dx * dx + dy * dy) < 55;
    });

    if (hitFalling) {
      onSnowflakeClick();
      return;
    }

    const totalWidth = Math.min(window.innerWidth * 0.8, settledWishes.length * 90);
    const startX = (window.innerWidth - totalWidth) / 2;
    
    const hitSettledIndex = settledWishes.findIndex((_, idx) => {
      const x = startX + (idx * 90) + 45;
      const y = window.innerHeight - 70;
      const dx = x - e.clientX;
      const dy = y - e.clientY;
      return Math.sqrt(dx * dx + dy * dy) < 45;
    });

    if (hitSettledIndex !== -1) {
      onSavedClick(settledWishes[hitSettledIndex]);
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 cursor-crosshair z-[2]"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    />
  );
};

export default SnowCanvas;