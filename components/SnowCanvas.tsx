
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
    radius: 1.2 + Math.random() * 1.5, // 1.2-2.7px radius
    speed: 0.4 + Math.random() * 0.4, 
    wind: (Math.random() - 0.5) * 0.1,
    opacity: 0.6 + Math.random() * 0.4, // Higher opacity for visibility
    isHexagon: false,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.01,
  });

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, angle: number, isSettled = false) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    ctx.shadowBlur = isSettled ? 25 : 15;
    ctx.shadowColor = isSettled ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.6)';
    
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
    
    ctx.strokeStyle = isSettled ? 'rgba(255, 100, 100, 1)' : 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); // Must allow alpha for transparent background
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      snowflakes.current = Array.from({ length: 250 }, () => createSnowflake(canvas.width, true));
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let animationFrameId: number;
    const animate = () => {
      // Clear with transparent to see through to the Fireworks layer
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.current.forEach((s) => {
        s.y += s.speed;
        s.x += s.wind;
        s.angle += s.spin;

        const dx = s.x - mouse.current.x;
        const dy = s.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        s.isHexagon = dist < 80;

        if (s.isHexagon) {
          ctx.globalAlpha = 1.0;
          drawHexagon(ctx, s.x, s.y, s.radius * 2, s.angle);
        } else {
          ctx.globalAlpha = s.opacity;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'; // Stronger glow
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (s.y > canvas.height + 20) {
          Object.assign(s, createSnowflake(canvas.width));
        }
      });

      // Bottom Settled
      settledWishes.forEach((wish, idx) => {
        const spacing = canvas.width / (settledWishes.length + 1);
        const x = spacing * (idx + 1);
        const y = canvas.height - 60;
        ctx.globalAlpha = 1;
        drawHexagon(ctx, x, y, 6.5, Date.now() * 0.0005, true);
        ctx.font = '700 10px Cinzel';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hitFalling = snowflakes.current.find(s => {
      const dx = s.x - e.clientX;
      const dy = s.y - e.clientY;
      return Math.sqrt(dx * dx + dy * dy) < 50;
    });
    if (hitFalling) {
      onSnowflakeClick();
      return;
    }
    const spacing = canvas.width / (settledWishes.length + 1);
    const hitSettledIndex = settledWishes.findIndex((_, idx) => {
      const x = spacing * (idx + 1);
      const y = canvas.height - 60;
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
