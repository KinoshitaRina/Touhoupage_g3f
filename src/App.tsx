import { useState, useCallback } from 'react';
import { GameEngine } from './components/GameEngine';
import { Menu } from './components/Menu';
import { DialogueBox } from './components/DialogueBox';
import { Difficulty, DIALOGUE_BATTLE_START, SPELL_CARDS } from './constants';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, AlertCircle, RefreshCcw } from 'lucide-react';

type GameStatus = 'MENU' | 'DIALOGUE' | 'BATTLE' | 'GAMEOVER' | 'VICTORY';

export function App() {
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('Normal');
  const [currentSpellIdx, setCurrentSpellIdx] = useState(0);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [inSpellDialogue, setInSpellDialogue] = useState(false);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setStatus('DIALOGUE');
    setDialogueIdx(0);
    setCurrentSpellIdx(0);
    setInSpellDialogue(false);
  };

  const handleDialogueNext = () => {
    const dialogueList = inSpellDialogue 
      ? SPELL_CARDS[currentSpellIdx].dialogue 
      : DIALOGUE_BATTLE_START;

    if (dialogueIdx < dialogueList.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    } else {
      if (inSpellDialogue) {
        setInSpellDialogue(false);
        setStatus('BATTLE');
      } else {
        // Initial dialogue finished, start first spell card
        setInSpellDialogue(true);
        setDialogueIdx(0);
      }
    }
  };

  const onBossPhaseComplete = useCallback(() => {
    if (currentSpellIdx < SPELL_CARDS.length - 1) {
      setCurrentSpellIdx(prev => prev + 1);
      setDialogueIdx(0);
      setInSpellDialogue(true);
      setStatus('DIALOGUE');
    } else {
      setStatus('VICTORY');
    }
  }, [currentSpellIdx]);

  const onGameOver = useCallback(() => {
    setStatus('GAMEOVER');
  }, []);

  const onVictory = useCallback(() => {
    setStatus('VICTORY');
  }, []);

  const resetGame = () => {
    setStatus('MENU');
    setDialogueIdx(0);
    setCurrentSpellIdx(0);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {status === 'MENU' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex justify-center"
            >
              <Menu onStart={startGame} />
            </motion.div>
          )}

          {(status === 'BATTLE' || status === 'DIALOGUE') && (
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative"
            >
              <GameEngine 
                difficulty={difficulty}
                spellIndex={currentSpellIdx}
                onBossPhaseComplete={onBossPhaseComplete}
                onGameOver={onGameOver}
                onVictory={onVictory}
                isPaused={status === 'DIALOGUE'}
              />
              
              {status === 'DIALOGUE' && (
                <DialogueBox 
                  line={inSpellDialogue 
                    ? SPELL_CARDS[currentSpellIdx].dialogue[dialogueIdx] 
                    : DIALOGUE_BATTLE_START[dialogueIdx]} 
                  onNext={handleDialogueNext} 
                />
              )}

              {/* Spell Card Name Announcement */}
              <AnimatePresence>
                {status === 'BATTLE' && (
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="absolute top-20 right-4 bg-red-900/80 px-4 py-2 border-l-4 border-red-500 backdrop-blur-sm pointer-events-none"
                  >
                    <div className="text-[10px] text-red-200 font-bold uppercase tracking-widest">Spell Card</div>
                    <div className="text-white font-bold">{SPELL_CARDS[currentSpellIdx].name}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {status === 'GAMEOVER' && (
            <motion.div 
              key="gameover"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-12 bg-slate-900 border-2 border-red-900/50 rounded-2xl shadow-2xl"
            >
              <AlertCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">被彈...擊中</h2>
              <p className="text-slate-400 mb-8">妳的努力到此為止了。</p>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-8 py-3 rounded-full transition-colors mx-auto"
              >
                <RefreshCcw size={18} />
                重回選單
              </button>
            </motion.div>
          )}

          {status === 'VICTORY' && (
            <motion.div 
              key="victory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-12 bg-slate-900 border-2 border-yellow-600/50 rounded-2xl shadow-2xl"
            >
              <Trophy size={64} className="text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">異變解決！</h2>
              <p className="text-slate-400 mb-8">月光恢復了平靜。</p>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-500 px-8 py-3 rounded-full transition-colors mx-auto text-black font-bold"
              >
                <RefreshCcw size={18} />
                再玩一次
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

