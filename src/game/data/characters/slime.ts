import { Character } from '@/game/types';

function Slime(character: Character, { x, y, z, }: { x: number, y: number, z?:number }): Character {
  let sprite =
    this.add.sprite(x, y, 'slime')
    .setScale(this.game.canvas.offsetHeight / 230)
    .setDepth(z || 10)
    .setOrigin(0.5)
    .play('slime-idle', false, Math.floor(Math.random() * 3));

  return {
    ...character,
    sprite,
  }
}

export default Slime
