import React, { useEffect, useRef, useCallback } from 'react';
import { 
  GAME_WIDTH, GAME_HEIGHT, PLAYER_SPEED, PLAYER_HITBOX_RADIUS, 
  PLAYER_BULLET_SPEED, BOSS_ASCII, BOSS_NAME, Difficulty 
} from '../constants';

interface Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  emoji?: string;
  isPlayerBullet?: boolean;
}

interface GameState {
  player: { x: number; y: number; dx: number; dy: number; focus: boolean };
  playerBullets: Entity[];
  bossBullets: Entity[];
  boss: { x: number; y: number; health: number; maxHealth: number; spellIndex: number };
  score: number;
  gameOver: boolean;
  victory: boolean;
  frame: number;
}

interface GameEngineProps {
  difficulty: Difficulty;
  spellIndex: number;
  onBossPhaseComplete: () => void;
  onGameOver: () => void;
  onVictory: () => void;
  isPaused: boolean;
}

export const GameEngine: React.FC<GameEngineProps> = ({ 
  difficulty, spellIndex, onBossPhaseComplete, onGameOver, onVictory, isPaused 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, setTick] = React.useState(0);
  const stateRef = useRef<GameState>({
    player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, dx: 0, dy: 0, focus: false },
    playerBullets: [],
    bossBullets: [],
    boss: { x: GAME_WIDTH / 2, y: 100, health: 100, maxHealth: 100, spellIndex: 0 },
    score: 0,
    gameOver: false,
    victory: false,
    frame: 0
  });

  const keysRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => keysRef.current[e.key] = true;
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current[e.key] = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update spell data when spellIndex changes
  useEffect(() => {
    const healths = [100, 150, 200];
    stateRef.current.boss.health = healths[spellIndex] || 100;
    stateRef.current.boss.maxHealth = healths[spellIndex] || 100;
    stateRef.current.boss.spellIndex = spellIndex;
    stateRef.current.bossBullets = [];
    stateRef.current.playerBullets = [];
  }, [spellIndex]);

  const update = useCallback(() => {
    if (isPaused || stateRef.current.gameOver || stateRef.current.victory) return;

    const state = stateRef.current;
    const { player, boss, bossBullets, playerBullets } = state;

    // Movement
    let speed = PLAYER_SPEED;
    if (keysRef.current['Shift']) speed /= 2;
    
    let dx = 0;
    let dy = 0;
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) dy -= 1;
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) dy += 1;
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) dx -= 1;
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      dx /= mag;
      dy /= mag;
    }

    player.x = Math.max(10, Math.min(GAME_WIDTH - 10, player.x + dx * speed));
    player.y = Math.max(10, Math.min(GAME_HEIGHT - 10, player.y + dy * speed));
    player.focus = !!keysRef.current['Shift'];

    // Player Shooting
    if (state.frame % 5 === 0) {
      if (player.focus) {
          // Narrow high damage
          playerBullets.push({ x: player.x - 5, y: player.y - 10, vx: 0, vy: -PLAYER_BULLET_SPEED, radius: 4, color: '#60a5fa' });
          playerBullets.push({ x: player.x + 5, y: player.y - 10, vx: 0, vy: -PLAYER_BULLET_SPEED, radius: 4, color: '#60a5fa' });
      } else {
          // Wide spread
          playerBullets.push({ x: player.x, y: player.y - 10, vx: 0, vy: -PLAYER_BULLET_SPEED, radius: 5, color: '#60a5fa' });
          playerBullets.push({ x: player.x, y: player.y - 10, vx: -2, vy: -PLAYER_BULLET_SPEED + 1, radius: 5, color: '#93c5fd' });
          playerBullets.push({ x: player.x, y: player.y - 10, vx: 2, vy: -PLAYER_BULLET_SPEED + 1, radius: 5, color: '#93c5fd' });
      }
    }

    // Boss Patterns
    const diffMultiplier = difficulty === 'Hard' ? 1.5 : 1.0;
    state.frame++;

    if (spellIndex === 0) {
        // Circle Burst
        if (state.frame % (difficulty === 'Hard' ? 40 : 60) === 0) {
            for (let i = 0; i < 20 * diffMultiplier; i++) {
                const angle = (i / (20 * diffMultiplier)) * Math.PI * 2 + (state.frame * 0.01);
                bossBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * 2,
                    vy: Math.sin(angle) * 2,
                    radius: 4,
                    color: '#f87171'
                });
            }
        }
    } else if (spellIndex === 1) {
        // Spiral Arms
        if (state.frame % 2 === 0) {
            const count = difficulty === 'Hard' ? 4 : 2;
            for(let i=0; i<count; i++) {
                const angle = (state.frame * 0.1) + (i * Math.PI * 2 / count);
                bossBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    radius: 3,
                    color: '#c084fc'
                });
            }
        }
    } else if (spellIndex === 2) {
        // Final Chaos
        if (state.frame % 3 === 0) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3 * diffMultiplier;
            bossBullets.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 4,
                color: '#fbbf24'
            });
        }
        if (state.frame % 60 === 0) {
            // Aimed shots
            const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
            for(let i=-2; i<=2; i++) {
                const angle = angleToPlayer + (i * 0.15);
                bossBullets.push({
                    x: boss.x,
                    y: boss.y,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4,
                    radius: 6,
                    color: '#ef4444'
                });
            }
        }
    }

    // Boss Idle Move
    boss.x = GAME_WIDTH / 2 + Math.sin(state.frame * 0.02) * 100;

    // Bullet Updates
    state.playerBullets = playerBullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      // Hit boss
      const dist = Math.sqrt((b.x - boss.x)**2 + (b.y - boss.y)**2);
      if (dist < 30) {
        boss.health -= 1;
        return false;
      }
      return b.y > -20;
    });

    state.bossBullets = bossBullets.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      // Hit player
      const dist = Math.sqrt((b.x - player.x)**2 + (b.y - player.y)**2);
      if (dist < PLAYER_HITBOX_RADIUS + b.radius) {
        state.gameOver = true;
        onGameOver();
        return false;
      }
      return b.x > -20 && b.x < GAME_WIDTH + 20 && b.y > -20 && b.y < GAME_HEIGHT + 20;
    });

    // Phase complete?
    if (boss.health <= 0) {
        if (spellIndex < 2) {
            onBossPhaseComplete();
        } else {
            state.victory = true;
            onVictory();
        }
    }

  }, [isPaused, spellIndex, difficulty, onBossPhaseComplete, onGameOver, onVictory]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = stateRef.current;

    // Clear
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Starfield
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (Math.sin(i * 123.45) * 0.5 + 0.5) * GAME_WIDTH;
        const y = ((state.frame * (0.5 + (i % 5) * 0.1) + i * 50) % GAME_HEIGHT);
        const size = (i % 3) + 1;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1.0;

    // Draw Player
    ctx.fillStyle = '#60a5fa';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hitbox indicator
    if (state.player.focus) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(state.player.x, state.player.y, PLAYER_HITBOX_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Draw Boss (ASCII-ish)
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '12px monospace';
    const lines = BOSS_ASCII.split('\n');
    lines.forEach((line: string, i: number) => {
        ctx.fillText(line, state.boss.x - 40, state.boss.y - 20 + (i * 12));
    });

    // Draw Bullets
    state.playerBullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - 2, b.y - 5, 4, 10);
    });

    state.bossBullets.forEach(b => {
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        // Glow effect
        ctx.shadowBlur = 4;
        ctx.shadowColor = b.color;
    });
    ctx.shadowBlur = 0;

  }, []);

  useEffect(() => {
    let animationId: number;
    const loop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [update, draw]);

  // Touch controls for mobile
  const handleTouch = (e: React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * GAME_WIDTH;
    const y = ((touch.clientY - rect.top) / rect.height) * GAME_HEIGHT;
    stateRef.current.player.x = x;
    stateRef.current.player.y = y;
    // Mobile always "focuses" for better visibility of hitbox? Or maybe a separate button.
    // Let's make it focus if they hold two fingers?
    stateRef.current.player.focus = e.touches.length > 1;
  };

  return (
    <div className="relative group cursor-crosshair select-none">
      <canvas 
        ref={canvasRef} 
        width={GAME_WIDTH} 
        height={GAME_HEIGHT}
        className="border-4 border-slate-700 rounded-lg shadow-2xl bg-slate-900 w-full h-auto max-h-[75vh] object-contain touch-none"
        onTouchMove={handleTouch}
        onTouchStart={handleTouch}
      />

      {/* Mobile Focus Toggle */}
      <div className="absolute bottom-4 right-4 sm:hidden flex flex-col gap-2">
        <button 
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-xs ${stateRef.current.player.focus ? 'bg-red-500 border-white text-white' : 'bg-slate-800/80 border-slate-500 text-slate-400'}`}
            onTouchStart={(e) => { e.stopPropagation(); stateRef.current.player.focus = true; }}
            onTouchEnd={(e) => { e.stopPropagation(); stateRef.current.player.focus = false; }}
        >
            SLOW
        </button>
      </div>
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 p-2 rounded border border-white/20 backdrop-blur-sm">
            <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">Boss Health</div>
            <div className="w-48 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                <div 
                    className="h-full bg-red-500 transition-all duration-200"
                    style={{ width: `${(stateRef.current.boss.health / stateRef.current.boss.maxHealth) * 100}%` }}
                />
            </div>
            <div className="text-[10px] text-white mt-1">{BOSS_NAME}</div>
          </div>
          
          <div className="text-right">
            <div className="text-white font-mono text-xl drop-shadow-lg">
                Score: {String(Math.floor(stateRef.current.frame / 10)).padStart(8, '0')}
            </div>
            <div className="text-xs text-yellow-400 font-bold italic">
                {difficulty} Mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
