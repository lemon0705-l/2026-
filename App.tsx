import React, { useState, useCallback } from 'react';
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

  const handleAddWish = useCallback(async (name: string, content: string) => {
    const newWish: Wish = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
      timestamp: Date.now(),
    };
    
    setWishes(prev => [...prev, newWish]);
    setIsModalOpen(false);
    setHasInteracted(true);
    
    // Trigger fireworks visual explosion
    setIsFireworkTriggered(true);
    setTimeout(() => setIsFireworkTriggered(false), 12000);

    // Call Gemini for a cinematic blessing
    try {
      // Create fresh AI instance per request as per instructions
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const prompt = `你是一位跨年祝福创意专家。请为名叫 ${name} 的人生成一段极具电影感、高级且富有哲理的2026新年寄语。他的愿望是：${content}。
      要求：
      1. 语调充满希望和未来感。
      2. 50字以内，仅输出祝福文本。
      3. 包含对2026年这一时代的独特诠释。`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      const blessingText = response.text;
      if (blessingText) {
        setAiBlessing(blessingText.trim());
      } else {
        throw new Error("Empty response text");
      }
    } catch (error) {
      console.error("AI Blessing failed:", error);
      setAiBlessing('愿你在2026年，星河灿烂，所愿皆所得，踏梦前行，万事胜意。');
    }
  }, []);

  const handleSnowflakeClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSavedSnowflakeClick = useCallback((wish: Wish) => {
    setSelectedWish(wish);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      {/* Visual background layers */}
      <FireworkCanvas active={isFireworkTriggered} />
      
      {/* Interactive snowfall on top */}
      <SnowCanvas 
        onSnowflakeClick={handleSnowflakeClick} 
        onSavedClick={handleSavedSnowflakeClick}
        settledWishes={wishes}
      />

      {/* Cinematic Branding */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 transition-all duration-[4000ms] ease-in-out ${hasInteracted || wishes.length > 0 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-12'}`}>
        <h1 className="cinzel text-white text-7xl md:text-9xl font-bold tracking-[0.3em] glow-text mb-4">
          2026
        </h1>
        <p className="text-red-600 text-sm md:text-lg tracking-[1.5em] font-light uppercase opacity-80">
          The New Horizon
        </p>
      </div>

      {/* AI Blessing Prophecy Overlay */}
      {aiBlessing && (
        <div className="absolute inset-0 flex items-center justify-center z-40 px-6 backdrop-blur-sm bg-black/50 transition-all">
          <div className="bg-neutral-950 border border-red-900/40 p-8 md:p-12 rounded-2xl shadow-[0_0_150px_rgba(255,0,0,0.3)] text-center animate-in fade-in zoom-in duration-1000 max-w-2xl relative">
             <div className="mb-6">
              <span className="text-red-500 text-[10px] uppercase tracking-[1em]">Prophecy of 2026</span>
            </div>
            <p className="text-white/95 italic font-light text-xl md:text-3xl leading-relaxed font-serif mb-12">
              "{aiBlessing}"
            </p>
            <button 
              onClick={() => setAiBlessing('')}
              className="px-14 py-4 text-[10px] text-red-500 border border-red-900/50 uppercase tracking-[0.8em] hover:bg-red-950 hover:text-white transition-all rounded-full"
            >
              [ Accept Gift ]
            </button>
          </div>
        </div>
      )}

      {/* Interaction Hint */}
      {!hasInteracted && wishes.length === 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-pulse text-white/30 text-[10px] tracking-[1em] uppercase text-center">
          Tap a drifting crystal
        </div>
      )}

      {/* Overlays */}
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