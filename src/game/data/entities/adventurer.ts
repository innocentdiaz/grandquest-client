import { Character } from '@/game/types';

function Adventurer(character: Character, { x, y, z }: { x: number, y: number, z?: number }) {
  let sprite = 
    this.add.sprite(x, y, 'adventurer')
    .setScale(this.game.canvas.offsetHeight / 300)
    .setDepth(z || 10)
    .setOrigin(0.5)
    .play('adventurer-idle');

  // let nameTag = this.add.text(
  //   x,
  //   y,
  //   character.username,
  //   { fontSize: '17px', fill: '#fff', backgroundColor: '#0008' }
  // );

  const state = {
    id: character.id,
    entity: character.entity,
    sprite,
    // nameTag,
  };

  return Object.assign(
    {},
    state,
  )
}

export default Adventurer;
