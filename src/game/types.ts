export interface Character {
  id: number;
  username: string;
  enemy: boolean;
  selectionStatus: number;
  entity: {
    name: string;
    energyRate: number;
    health: number;
    maxHealth: number;
    defense: number;
    attacks: {
      [attackId: string]: Attack;
    };
  };
  sprite: any;
  _nameTag: any;
  _healthBar: any;
  _healthBarBackground: any;
  _healthText: any;
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
  outcome: {
    damage: any;
  }
}