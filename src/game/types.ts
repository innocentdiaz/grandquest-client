export interface Character {
  id: number;
  username: string;
  enemy: boolean;
  selectionStatus: number;
  entity: {
    name: string;
    energyRate: number;
    attacks: {
      [attackId: string]: Attack;
    };
  };
  sprite: any;
  defense: number;
}
export interface Attack {
  name: string;
  description: string;
  stats: {
    baseDamage: number;
    energy: number;
  };
}
export interface CombatEvent {
  characterId: string;
  receiverId: string;
  action: {
      type: string;
      id: string;
  }
}