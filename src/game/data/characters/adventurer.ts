import { Character } from '@/game/types';

function Adventurer(character: Character, { x, y, z }: { x: number, y: number, z?: number }): Character {
  let sprite =
    this.add.sprite(x, y, 'adventurer')
    .setScale(this.game.canvas.offsetHeight / 300)
    .setDepth(z || 10)
    .setOrigin(0.5)
    .play('adventurer-idle');

  return {
    ...character,
    sprite,
  }
}

export default Adventurer;
