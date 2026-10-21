import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this.createPlaceholderTextures();

    // Mapas
    this.load.tilemapTiledJSON('map_centro', 'assets/maps/area_centro.json');
    this.load.tilemapTiledJSON('map_ponta_negra', 'assets/maps/area_ponta_negra.json');
    this.load.tilemapTiledJSON('map_itaocaia', 'assets/maps/area_itaocaia.json');
    this.load.tilemapTiledJSON('map_lagoa', 'assets/maps/area_lagoa.json');

    // Dados
    this.load.json('npcs_data', 'src/data/npcs.json');
    this.load.json('quiz_data', 'src/data/quiz.json');

    // Assets reais de Player e Emotes
    this.load.image('player_idle', 'assets/players 16x16/players-idle/sprite_47.png');
    this.load.spritesheet('player_walk', 'assets/players 16x16/players-walk/sprite_00.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    // Emotes (balão de exclamação animado/spritesheet 16x16)
    this.load.spritesheet('emote_exclamation', 'assets/npcs/Emotes/Exclamation_emote_16x16.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    // NPCs reais da pasta assets/npcs/ (spritesheet 16x16)
    // Bernardo: NPC_8 (estudioso/elegante)
    // Léo: NPC_2 (jovem/menino)
    // Seu Zé: NPC_4 (pescador/barba/chapéu)
    // Vovozão: NPC_9 (senhor idoso simpático)
    // Karu: NPC_11 (nativo/guerreiro)
    this.load.spritesheet('real_npc_bernardo', 'assets/npcs/NPC_8.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('real_npc_leo', 'assets/npcs/NPC_2.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('real_npc_seu_ze', 'assets/npcs/NPC_4.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('real_npc_vovozao', 'assets/npcs/NPC_9.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('real_npc_karu', 'assets/npcs/NPC_11.png', {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  createPlaceholderTextures() {
    // Tileset com arte em pixel art estilizada rica em detalhes
    const tilesetCanvas = this.textures.createCanvas('tileset_placeholder', 64, 16);
    const ctx = tilesetCanvas.context;

    // 1: Grama texturizada com sombras e nuances orgânicas
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#40916c';
    ctx.fillRect(2, 2, 4, 3);
    ctx.fillRect(9, 7, 4, 3);
    ctx.fillRect(4, 11, 4, 3);
    ctx.fillStyle = '#52b788';
    ctx.fillRect(3, 3, 2, 1);
    ctx.fillRect(10, 8, 2, 1);
    ctx.fillStyle = '#1b4332';
    ctx.fillRect(0, 15, 16, 1);
    ctx.fillRect(15, 0, 1, 16);

    // 2: Água cristalina estilizada com ondas e reflexos
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(16, 0, 16, 16);
    ctx.fillStyle = '#0096c7';
    ctx.fillRect(18, 3, 7, 2);
    ctx.fillRect(24, 9, 6, 2);
    ctx.fillStyle = '#caf0f8';
    ctx.fillRect(19, 4, 3, 1);
    ctx.fillRect(25, 10, 3, 1);
    ctx.fillStyle = '#03045e';
    ctx.fillRect(16, 15, 16, 1);

    // 3: Caminho de terra/areia batida com pedrinhas
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(32, 0, 16, 16);
    ctx.fillStyle = '#e9edc9';
    ctx.fillRect(34, 4, 3, 2);
    ctx.fillRect(41, 10, 4, 2);
    ctx.fillStyle = '#bc6c25';
    ctx.fillRect(38, 2, 2, 2);
    ctx.fillRect(35, 12, 2, 2);
    ctx.fillRect(44, 6, 2, 2);

    // 4: Parede/rocha com textura de pedras esculpidas
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(48, 0, 16, 16);
    ctx.fillStyle = '#718096';
    ctx.fillRect(49, 1, 6, 6);
    ctx.fillRect(57, 1, 6, 6);
    ctx.fillRect(49, 9, 6, 6);
    ctx.fillRect(57, 9, 6, 6);
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(48, 7, 16, 2);
    ctx.fillRect(48, 15, 16, 1);
    ctx.fillRect(55, 0, 2, 16);

    tilesetCanvas.refresh();

    // Fallback placeholder para o player
    const playerCanvas = this.textures.createCanvas('player', 16, 16);
    const pCtx = playerCanvas.context;
    pCtx.fillStyle = '#3b82f6';
    pCtx.fillRect(2, 2, 12, 12);
    playerCanvas.refresh();
  }

  create() {
    // Cria animações de NPCs respirando/idle
    const npcKeys = ['bernardo', 'leo', 'seu_ze', 'vovozao', 'karu'];
    npcKeys.forEach((key) => {
      const realKey = `real_npc_${key}`;
      if (this.textures.exists(realKey) && !this.anims.exists(`${key}_idle`)) {
        this.anims.create({
          key: `${key}_idle`,
          frames: this.anims.generateFrameNumbers(realKey, { start: 0, end: 3 }),
          frameRate: 4,
          repeat: -1
        });
      }
    });

    // Animação de exclamação pulsando
    if (this.textures.exists('emote_exclamation') && !this.anims.exists('exclamation_bounce')) {
      this.anims.create({
        key: 'exclamation_bounce',
        frames: this.anims.generateFrameNumbers('emote_exclamation', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }

    this.scene.start('GameScene', { area: 'centro', spawn: 'inicio' });
  }
}
