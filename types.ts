
export enum GameStage {
  HOME = 'HOME',
  CAR_SELECTION = 'CAR_SELECTION',
  BATTLE = 'BATTLE',
  VICTORY = 'VICTORY',
  DEFEAT = 'DEFEAT'
}

export interface Car {
  id: string;
  name: string;
  tag: string;
  image: string;
  description: string;
  initialFace: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  position: 'left' | 'top' | 'right';
  avatar: string;
}

export interface DialogueOption {
  text: string;
  faceChange: number;
  feedback: string;
}

export interface BattleTurn {
  npc: NPC;
  attack: string;
  options: DialogueOption[];
}
