import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { state } from '../state.js';

const DIRECTIONS = ['up', 'down', 'left', 'right'];

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const textureKey = scene.textures.exists('player_idle') ? 'player_idle' : 'player';
    super(scene, x, y, textureKey);
    this.scene = scene;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.body.setSize(12, 10).setOffset(2, 6);
    this.pressedKeys = [];
    this.directionKeyHandlers = [];

    // Mapeamento de direção
    for (const direction of DIRECTIONS) {
      const keys = scene.input.keyboard.addKeys(
        CONFIG.keys[direction].join(',')
      );

      for (const key of Object.values(keys)) {
        const onDown = () => this.pressDirection(direction, key);
        const onUp = () => this.releaseDirection(key);
        key.on('down', onDown);
        key.on('up', onUp);
        this.directionKeyHandlers.push({ key, onDown, onUp });
      }
    }

    // Tecla de interagir: Espaço, Enter ou Z (SPEC §4)
    this.interactKeys = [
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    ];
  }

  update() {
    this.body.setVelocity(0);

    if (state.fase !== 'EXPLORANDO') {
      return;
    }

    const activeKey = this.pressedKeys[this.pressedKeys.length - 1];
    if (!activeKey) {
      return;
    }

    const { direction } = activeKey;
    const velocity = CONFIG.playerSpeed;
    if (direction === 'up') {
      this.body.setVelocityY(-velocity);
    } else if (direction === 'down') {
      this.body.setVelocityY(velocity);
    } else if (direction === 'left') {
      this.body.setVelocityX(-velocity);
      this.setFlipX(true);
    } else if (direction === 'right') {
      this.body.setVelocityX(velocity);
      this.setFlipX(false);
    }
  }

  pressDirection(direction, key) {
    this.pressedKeys = this.pressedKeys.filter(
      (pressed) => pressed.key !== key
    );
    this.pressedKeys.push({ direction, key });
  }

  releaseDirection(key) {
    this.pressedKeys = this.pressedKeys.filter(
      (pressed) => pressed.key !== key
    );
  }

  isInteractJustDown() {
    return this.interactKeys.some((key) => Phaser.Input.Keyboard.JustDown(key));
  }

  destroy(fromScene) {
    this.directionKeyHandlers.forEach(({ key, onDown, onUp }) => {
      key.off('down', onDown);
      key.off('up', onUp);
    });
    this.directionKeyHandlers = [];
    super.destroy(fromScene);
  }
}
