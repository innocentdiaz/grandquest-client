export interface Character {
  id: number;
  username: string;
  enemy: boolean;
  entity: {
    name: string;
  };
  sprite: any;
  attacks: {};
  defense: number;
}
