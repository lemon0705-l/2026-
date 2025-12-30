
import React, { useState } from 'react';

interface WishModalProps {
  onClose: () => void;
  onSubmit: (name: string, content: string) => void;
}

const WishModal: React.FC<WishModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && content.trim()) {
      onSubmit(name, content);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md bg-black/60">
      <div className="bg-neutral-900 border border-red-800/50 p-8 rounded-xl w-full max-w-md shadow-[0_0_50px_rgba(255,0,0,0.1)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors cinzel"
        >
          &times;
        </button>
        
        <h2 className="cinzel text-red-600 text-2xl font-bold mb-6 text-center tracking-widest">
          Make Your Wish
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-light">
              Your Name
            </label>
            <input 
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:border-red-600/50 transition-colors"
              placeholder="Who are you?"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/50 text-xs uppercase tracking-widest mb-2 font-light">
              Wish for 2026
            </label>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-black/50 border border-white/10 text-white p-3 rounded-lg focus:outline-none focus:border-red-600/50 transition-colors resize-none"
              placeholder="What blooms in your heart?"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-red-700 hover:bg-red-600 text-white cinzel font-bold tracking-[0.3em] rounded-lg shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            IGNITE 2026
          </button>
        </form>
      </div>
    </div>
  );
};

export default WishModal;
