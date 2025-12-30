
import React, { useState } from 'react';
import { Wish } from './types';
import SnowCanvas from './components/SnowCanvas';
import FireworkCanvas from './components/FireworkCanvas';
import WishModal from './components/WishModal';
import SavedWishModal from './components/SavedWishModal';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);
  const [isFireworkTriggered, setIsFireworkTriggered] = useState(false);
  const [aiBlessing, setAiBlessing] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleAddWish = async (name: string, content: string) => {
    const newWish: Wish = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
      timestamp: Date.now(),
    };
    
    setWishes(prev => [...prev, newWish]);
    setIsModalOpen(false);
    setHasInteracted(true);
    
    // Trigger fireworks visual
    setIsFireworkTriggered(true);
    setTimeout(() => setIsFireworkTriggered(false), 12000);

    // Call Gemini to generate a special 2026 blessing
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位精通跨年祝福的创意专家。请为名叫 ${name} 的人生成一段极具电影感、高级且富有哲理的2026跨年祝福。他的新年愿望是：${content}。
要求：
1. 风格高级、唯美。
2. 字数在50字左右。
3. 语言包含对2026年的期待。
4. 仅输出祝福语。`,
      });
      setAiBlessing(response.text || '愿你在2026年，星河灿烂，万事顺遂。');
    } catch (error) {
      console.error("AI Blessing failed", error);
      setAiBlessing('愿你在2026年，踏梦前行，所愿皆所得。');
    }
  };

  const handleSnowflakeClick = () => {
    setIsModalOpen(true);
  };

  const handleSavedSnowflakeClick = (wish: Wish) => {
    setSelectedWish(wish);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Visual Layer: Fireworks (Bottom) */}
      <FireworkCanvas 
        active={isFireworkTriggered} 
      />
      
      {/* Interaction Layer: Snowfall (Top) */}
      <SnowCanvas 
        onSnowflakeClick={handleSnowflakeClick} 
        onSavedClick={handleSavedSnowflakeClick}
        settledWishes={wishes}
      />

      {/* Cinematic Branding (Reveals after first wish) */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 transition-all duration-[4000ms] ease-in-out ${hasInteracted || wishes.length > 0 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-12'}`}>
        <h1 className="cinzel text-white text-7xl md:text-9xl font-bold tracking-[0.3em] glow-text mb-4">
          2026
        </h1>
        <p className="text-red-600 text-sm md:text-lg tracking-[1.5em] font-light uppercase opacity-80">
          The Future Awaits
        </p>
      </div>

      {/* AI Blessing Message */}
      {aiBlessing && (
        <div className="absolute inset-0 flex items-center justify-center z-40 px-6 backdrop-blur-sm bg-black/40">
          <div className="bg-neutral-950 border border-red-900/40 p-10 rounded-2xl shadow-[0_0_120px_rgba(255,0,0,0.4)] text-center animate-in fade-in zoom-in duration-1000 max-w-2xl">
            <div className="mb-6">
              <span className="text-red-500 text-[10px] uppercase tracking-[0.8em]">2026 Prophecy</span>
            </div>
            <p className="text-white/95 italic font-light text-2xl leading-relaxed font-serif mb-10">
              "{aiBlessing}"
            </p>
            <button 
              onClick={() => setAiBlessing('')}
              className="px-12 py-4 text-[11px] text-red-500 border border-red-900/50 uppercase tracking-[0.6em] hover:bg-red-950 hover:text-white transition-all rounded-full"
            >
              [ Accept Blessing ]
            </button>
          </div>
        </div>
      )}

      {/* Interaction Prompts */}
      {!hasInteracted && wishes.length === 0 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 animate-pulse text-white/20 text-[10px] tracking-[0.8em] uppercase text-center">
          Tap a snowflake to begin
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <WishModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddWish} 
        />
      )}

      {selectedWish && (
        <SavedWishModal 
          wish={selectedWish} 
          onClose={() => setSelectedWish(null)} 
        />
      )}
    </div>
  );
};

export default App;
