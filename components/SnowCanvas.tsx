
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
    radius: 1.8 + Math.random() * 2.5, // Bold particles for visibility
    speed: 0.3 + Math.random() * 0.4, 
    wind: (Math.random() - 0.5) * 0.1,
    opacity: 0.7 + Math.random() * 0.3, 
    isHexagon: false,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.01,
  });

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number, isSettled = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.shadowBlur = isSettled ? 30 : 15;
    ctx.shadowColor = isSettled ? 'rgba(255, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.7)';
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      ctx.moveTo(0, 0);
      const px = Math.cos((i * Math.PI) / 3) * r * 4;
      const py = Math.sin((i * Math.PI) / 3) * r * 4;
      ctx.lineTo(px, py);
      
      const bx = px * 0.5;
      const by = py * 0.5;
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(((i * Math.PI) / 3) + 0.5) * r * 2, by + Math.sin(((i * Math.PI) / 3) + 0.5) * r * 2);
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.cos(((i * Math.PI) / 3) - 0.5) * r * 2, by + Math.sin(((i * Math.PI) / 3) - 0.5) * r * 2);
    }
    
    ctx.strokeStyle = isSettled ? '#FF0000' : '#FFFFFF';
    ctx.lineWidth = 1.0;
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
      snowflakes.current = Array.from({ length: 200 }, () => createSnowflake(window.innerWidth, true));
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

        s.isHexagon = dist < 70;

        if (s.isHexagon) {
          ctx.globalAlpha = 1.0;
          drawHexagon(ctx, s.x, s.y, s.radius * 1.8, s.angle);
        } else {
          ctx.globalAlpha = s.opacity;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 1.0)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (s.y > window.innerHeight + 20) {
          Object.assign(s, createSnowflake(window.innerWidth));
        }
      });

      // Bottom Settled Wishes (Glowing Red Hexagons)
      settledWishes.forEach((wish, idx) => {
        const spacing = Math.min(100, window.innerWidth / (settledWishes.length + 1));
        const x = (window.innerWidth / 2) - ((settledWishes.length - 1) * spacing / 2) + (idx * spacing);
        const y = window.innerHeight - 60;
        
        ctx.globalAlpha = 1;
        drawHexagon(ctx, x, y, 7, Date.now() * 0.0005, true);
        
        ctx.shadowBlur = 0;
        ctx.font = '700 10px Cinzel';
        ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(wish.name.toUpperCase(), x, y + 35);
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
      return Math.sqrt(dx * dx + dy * dy) < 50;
    });

    if (hitFalling) {
      onSnowflakeClick();
      return;
    }

    const spacing = Math.min(100, window.innerWidth / (settledWishes.length + 1));
    const startX = (window.innerWidth / 2) - ((settledWishes.length - 1) * spacing / 2);
    
    const hitSettledIndex = settledWishes.findIndex((_, idx) => {
      const x = startX + (idx * spacing);
      const y = window.innerHeight - 60;
      const dx = x - e.clientX;
      const dy = y - e.clientY;
      return Math.sqrt(dx * dx + dy * dy) < 40;
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
