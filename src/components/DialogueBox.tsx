import React from 'react';
import { motion } from 'framer-motion';
import { DialogueLine } from '../constants';

interface DialogueBoxProps {
  line: DialogueLine;
  onNext: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ line, onNext }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-10 left-4 right-4 bg-slate-900/90 border-2 border-slate-700 p-6 rounded-xl backdrop-blur-md shadow-2xl z-50 cursor-pointer"
      onClick={onNext}
    >
      <div className={`flex flex-col ${line.side === 'right' ? 'items-end' : 'items-start'}`}>
        <div className="text-sm font-bold text-blue-400 mb-1 tracking-widest uppercase">
          {line.speaker}
        </div>
        <div className="text-lg text-slate-100 font-medium leading-relaxed">
          {line.text}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <span className="text-[10px] text-slate-500 animate-pulse">點擊繼續...</span>
      </div>
    </motion.div>
  );
};
