
import React from 'react';
import { Wish } from '../types';

interface SavedWishModalProps {
  wish: Wish;
  onClose: () => void;
}

const SavedWishModal: React.FC<SavedWishModalProps> = ({ wish, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-md bg-black/60">
      <div className="bg-neutral-900 border border-red-800/50 p-10 rounded-xl w-full max-w-lg shadow-[0_0_80px_rgba(255,0,0,0.2)] text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6">
          <div className="cinzel text-red-600 text-sm tracking-widest mb-2 font-bold uppercase">
            A New Year Vision
          </div>
          <div className="w-12 h-[1px] bg-red-600/30 mx-auto"></div>
        </div>

        <h3 className="text-white text-3xl font-light mb-6 font-serif">
          "{wish.content}"
        </h3>
        
        <p className="cinzel text-white/40 text-sm uppercase tracking-widest">
          — By {wish.name}
        </p>

        <div className="mt-12">
          <button 
            onClick={onClose}
            className="text-white/20 hover:text-red-500 transition-colors text-xs uppercase tracking-[0.5em] font-light"
          >
            [ Return to the Night Sky ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedWishModal;
