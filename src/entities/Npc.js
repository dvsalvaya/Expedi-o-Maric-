import Phaser from 'phaser';
import { state } from '../state.js';

export class Npc extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, npcData) {
    const realTexture = `real_npc_${npcData.id}`;
    const textureKey = scene.textures.exists(realTexture) ? realTexture : (npcData.sprite || 'player');

    super(scene, x, y, textureKey);
    this.scene = scene;
    this.npcData = npcData;
    this.npcId = npcData.id;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Estático (imóvel)

    // Se houver animação idle registrada para este NPC, toca
    if (scene.anims.exists(`${npcData.id}_idle`)) {
      this.play(`${npcData.id}_idle`);
    }

    // Ajusta corpo físico para colisão nos pés
    this.body.setSize(12, 10);
    this.body.setOffset(2, 6);

    // Indicador "!" quando perto
    if (scene.textures.exists('emote_exclamation')) {
      this.indicatorSprite = scene.add.sprite(x, y - 16, 'emote_exclamation');
      if (scene.anims.exists('exclamation_bounce')) {
        this.indicatorSprite.play('exclamation_bounce');
      }
      this.indicatorSprite.setVisible(false);
    } else {
      this.indicatorText = scene.add.text(x, y - 14, '!', {
        fontFamily: 'monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.indicatorText.setVisible(false);
    }

    // Marcador de concluído "✓" (SPEC §8)
    this.doneMarker = scene.add.text(x + 7, y - 12, '✓', {
      fontFamily: 'monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#4ade80',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.updateStatus();
  }

  updateStatus() {
    const isDone = state.npcsConcluidos.has(this.npcId);
    if (this.doneMarker) {
      this.doneMarker.setVisible(isDone);
    }
  }

  showIndicator(visible) {
    if (this.indicatorSprite) {
      this.indicatorSprite.setVisible(visible);
    }
    if (this.indicatorText) {
      this.indicatorText.setVisible(visible);
    }
  }

  destroy(fromScene) {
    if (this.indicatorSprite) {
      this.indicatorSprite.destroy();
    }
    if (this.indicatorText) {
      this.indicatorText.destroy();
    }
    if (this.doneMarker) {
      this.doneMarker.destroy();
    }
    super.destroy(fromScene);
  }
}
