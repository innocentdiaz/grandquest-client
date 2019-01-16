export interface Character {
  id: number;
  username: string;
  enemy: boolean;
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