
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
    
    setIsFireworkTriggered(true);
    setTimeout(() => setIsFireworkTriggered(false), 10000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `你是一位精通跨年祝福的创意专家。请为名叫 ${name} 的人生成一段极具电影感、高级且富有哲理的2026跨年祝福。他的新年愿望是：${content}。仅输出一段富有诗意的祝福语。`,
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
    <div className="relative w-full h-screen bg-[#000000] overflow-hidden select-none">
      {/* Background Layer: Fireworks (Bottom) */}
      <FireworkCanvas 
        active={isFireworkTriggered} 
      />
      
      {/* Interactive Layer: Snowfall (Top) */}
      <SnowCanvas 
        onSnowflakeClick={handleSnowflakeClick} 
        onSavedClick={handleSavedSnowflakeClick}
        settledWishes={wishes}
      />

      {/* Main UI Layer (Revealed later) */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10 transition-all duration-[4000ms] ease-in-out ${hasInteracted || wishes.length > 0 ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
        <h1 className="cinzel text-white text-6xl md:text-8xl font-bold tracking-[0.3em] glow-text mb-4">
          2026
        </h1>
        <p className="text-red-600 text-sm md:text-base tracking-[1.1em] font-light uppercase opacity-80">
          A New Era
        </p>
      </div>

      {/* AI Blessing Component */}
      {aiBlessing && (
        <div className="absolute inset-0 flex items-center justify-center z-40 px-6 backdrop-blur-sm bg-black/40">
          <div className="bg-neutral-950 border border-red-900/40 p-10 rounded-2xl shadow-[0_0_100px_rgba(255,0,0,0.3)] text-center animate-in fade-in zoom-in duration-1000 max-w-2xl">
            <p className="text-white/95 italic font-light text-2xl leading-relaxed font-serif mb-10">
              "{aiBlessing}"
            </p>
            <button 
              onClick={() => setAiBlessing('')}
              className="px-10 py-4 text-[11px] text-red-500 border border-red-900/50 uppercase tracking-[0.6em] hover:bg-red-950 hover:text-white transition-all rounded-full"
            >
              [ Accept Blessing ]
            </button>
          </div>
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
