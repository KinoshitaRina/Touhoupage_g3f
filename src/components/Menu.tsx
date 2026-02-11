import React from 'react';
import { Difficulty } from '../constants';
import { Skull, Zap } from 'lucide-react';

interface MenuProps {
  onStart: (difficulty: Difficulty) => void;
}

export const Menu: React.FC<MenuProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-md w-full mx-auto text-center">
      <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic">
        MOONLIGHT <span className="text-blue-500">BARRAGE</span>
      </h1>
      <p className="text-slate-400 text-sm mb-8 font-mono">~ Project Moonlight Shadow ~</p>
      
      <div className="space-y-4 w-full">
        <button 
          onClick={() => onStart('Normal')}
          className="group relative w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all flex items-center justify-center gap-3 overflow-hidden"
        >
          <Zap className="text-yellow-400 group-hover:scale-125 transition-transform" size={20} />
          <span className="text-white font-bold text-lg">NORMAL</span>
          <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        <button 
          onClick={() => onStart('Hard')}
          className="group relative w-full py-4 bg-slate-800 hover:bg-red-900/40 border border-red-900/50 rounded-lg transition-all flex items-center justify-center gap-3 overflow-hidden"
        >
          <Skull className="text-red-500 group-hover:scale-125 transition-transform" size={20} />
          <span className="text-white font-bold text-lg">HARD</span>
          <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      <div className="mt-10 text-left w-full text-slate-500 text-xs font-mono space-y-1">
        <p>控制方式：</p>
        <p>• [WASD / 方向鍵] 移動</p>
        <p>• [Shift] 低速模式 (顯示判定點)</p>
        <p>• [自動射擊] 開啟中</p>
        <p className="mt-4 italic opacity-50">移動裝置：直接觸碰螢幕移動</p>
      </div>
    </div>
  );
};
