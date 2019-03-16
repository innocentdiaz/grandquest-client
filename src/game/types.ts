export interface Character {
  id: number;
  username: string;
  enemy: boolean;
  selectionStatus: number;
  level: number;
  power: number;
  defense: number;
  gold: number;
  xp: number;
  inventory: {
    [itemId: string]: InventoryItem;
  };
  entity: {
    name: string;
    energy: number;
    maxEnergy: number;
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
export interface InventoryItem {
  name: string;
  id: string;
  type: string;
  uids: string[];
}
export interface CombatEvent {
  baseDamage: number;
  character: {
    id: string;
    enemy: boolean;
  };
  receiver: {
    id: string;
    enemy: boolean;
  };
  action: {
      type: string;
      id: string;
  }
  outcome: {
    damage: number;
    attackBase: number;
    heal: number;
    xp: number;
  }
}