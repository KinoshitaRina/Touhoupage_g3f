export type Difficulty = 'Normal' | 'Hard';

export interface DialogueLine {
  speaker: string;
  text: string;
  side: 'left' | 'right';
}

export interface SpellCard {
  name: string;
  dialogue: DialogueLine[];
  bossHealth: number;
  pattern: string;
}

export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;

export const PLAYER_SPEED = 4;
export const PLAYER_HITBOX_RADIUS = 3;
export const PLAYER_BULLET_SPEED = 12;

export const BOSS_ASCII = `
      .---.
     /     \\
    | () () |
     \\  ^  /
      |||||
     /| | |\\
    / | | | \\
   /  | | |  \\
      | | |
      | | |
     /  |  \\
`;

export const BOSS_NAME = "月宮之影 - 月詠";

export const DIALOGUE_BATTLE_START: DialogueLine[] = [
  { speaker: "巫女", text: "又是這種奇怪的月光...", side: 'left' },
  { speaker: "月詠", text: "凡人，汝不該踏入這片禁域。", side: 'right' },
  { speaker: "巫女", text: "既然來了，就請妳安靜地消失吧！", side: 'left' },
  { speaker: "月詠", text: "那就讓這月華，成為汝的墓標。", side: 'right' },
];

export const SPELL_CARDS: SpellCard[] = [
  {
    name: "「月落：破碎的銀鏡」",
    dialogue: [{ speaker: "月詠", text: "鏡中花，水中月，皆為虛幻！", side: 'right' }],
    bossHealth: 100,
    pattern: "circle_burst"
  },
  {
    name: "「影舞：幽冥的迴廊」",
    dialogue: [{ speaker: "月詠", text: "在陰影中掙扎吧。", side: 'right' }],
    bossHealth: 150,
    pattern: "spiral_arms"
  },
  {
    name: "「終焉：月蝕之夜」",
    dialogue: [{ speaker: "月詠", text: "永恆的黑暗即將降臨。", side: 'right' }],
    bossHealth: 200,
    pattern: "final_chaos"
  }
];
