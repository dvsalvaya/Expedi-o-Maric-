import Phaser from 'phaser';
import { CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Npc } from '../entities/Npc.js';
import { state } from '../state.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.currentArea = data.area || 'centro';
    this.targetSpawn = data.spawn || 'inicio';
    state.areaAtual = this.currentArea;
    this.isTransitioning = false;
  }

  create() {
    // Transição de fade-in ao entrar na área (SPEC §6)
    this.cameras.main.fadeIn(200, 0, 0, 0);

    // Carrega o mapa Tiled da área atual
    const mapKey = `map_${this.currentArea}`;
    const map = this.make.tilemap({ key: mapKey });

    const tileset = map.addTilesetImage('tileset_placeholder', 'tileset_placeholder');
    if (!tileset) {
      throw new Error(`O mapa "${this.currentArea}" não encontrou o tileset "tileset_placeholder".`);
    }

    const groundLayer = map.createLayer('chao', tileset, 0, 0);
    const colisaoLayer = map.createLayer('colisao', tileset, 0, 0);

    if (!groundLayer || !colisaoLayer) {
      throw new Error(`O mapa "${this.currentArea}" precisa das camadas "chao" e "colisao".`);
    }
    colisaoLayer.setCollisionByExclusion([-1, 0]);

    const mapWidthInPixels = map.widthInPixels;
    const mapHeightInPixels = map.heightInPixels;

    this.physics.world.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels);
    this.cameras.main.setBounds(0, 0, mapWidthInPixels, mapHeightInPixels);

    // Procura o spawn correspondente
    const spawnsLayer = map.getObjectLayer('spawns');
    const spawn = spawnsLayer?.objects.find((obj) => obj.name === this.targetSpawn);
    if (!spawn) {
      throw new Error(`O mapa "${this.currentArea}" não possui o spawn "${this.targetSpawn}".`);
    }

    // Instancia o jogador
    this.player = new Player(this, spawn.x, spawn.y);
    this.physics.add.collider(this.player, colisaoLayer);
    this.cameras.main.startFollow(this.player, true);

    // Instancia os NPCs da área
    const npcsData = this.cache.json.get('npcs_data');
    if (!Array.isArray(npcsData)) {
      throw new Error('Não foi possível carregar os dados de NPCs.');
    }
    this.npcs = [];

    const npcsLayer = map.getObjectLayer('npcs');
    if (npcsLayer) {
      npcsLayer.objects.forEach((obj) => {
        const npcIdProp = obj.properties?.find((p) => p.name === 'npcId');
        const npcId = npcIdProp ? npcIdProp.value : obj.name;
        const npcData = npcsData.find((n) => n.id === npcId);
        if (!npcData) {
          throw new Error(`O NPC "${npcId}" do mapa não existe em src/data/npcs.json.`);
        }

        const npc = new Npc(this, obj.x, obj.y, npcData);
        this.npcs.push(npc);
        this.physics.add.collider(this.player, npc);
      });
    }

    // Configura os portais da camada 'portais' (SPEC §6)
    const portaisLayer = map.getObjectLayer('portais');
    this.portaisGroup = this.physics.add.staticGroup();

    if (portaisLayer) {
      portaisLayer.objects.forEach((obj) => {
        const destinoProp = obj.properties?.find((p) => p.name === 'destino');
        const spawnProp = obj.properties?.find((p) => p.name === 'spawn');
        const destino = destinoProp?.value;
        const targetSpawn = spawnProp?.value;
        if (typeof destino !== 'string' || !destino || typeof targetSpawn !== 'string' || !targetSpawn) {
          throw new Error(`O portal "${obj.name}" precisa das propriedades "destino" e "spawn".`);
        }

        // Tiled objects têm posição (x, y) no canto superior-esquerdo
        const pZone = this.add.zone(obj.x + (obj.width || 16) / 2, obj.y + (obj.height || 16) / 2, obj.width || 16, obj.height || 16);
        this.physics.add.existing(pZone, true);
        pZone.setData('destino', destino);
        pZone.setData('spawn', targetSpawn);
        this.portaisGroup.add(pZone);
      });
    }

    // Colisão do jogador com portais
    this.physics.add.overlap(this.player, this.portaisGroup, (player, portal) => {
      this.handlePortalEnter(portal);
    });

    // Inicia a UIScene em paralelo se ainda não estiver ativa (SPEC §3)
    if (!this.scene.isActive('UIScene')) {
      this.scene.launch('UIScene');
    }

    // Atualiza status dos NPCs caso já tenham sido concluídos anteriormente
    this.npcs.forEach((npc) => npc.updateStatus());

    this.game.events.on('npc:completed', this.handleNpcCompleted, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
  }

  handleNpcCompleted() {
    this.npcs?.forEach((npc) => npc.updateStatus());
  }

  handleShutdown() {
    this.game.events.off('npc:completed', this.handleNpcCompleted, this);
  }

  handlePortalEnter(portal) {
    if (this.isTransitioning || state.fase !== 'EXPLORANDO') {
      return;
    }

    this.isTransitioning = true;
    const destino = portal.getData('destino');
    const nextSpawn = portal.getData('spawn');

    // Troca de área: fade-out (200 ms) -> scene.restart({ area, spawn }) -> fade-in (SPEC §6)
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.restart({ area: destino, spawn: nextSpawn });
    });
  }

  update() {
    this.player?.update();

    if (!this.player || !this.npcs || this.isTransitioning) {
      return;
    }

    // Checa proximidade com NPCs (SPEC §8: <= 24 px)
    let nearbyNpc = null;
    for (const npc of this.npcs) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );

      if (distance <= 24) {
        nearbyNpc = npc;
        npc.showIndicator(true);
      } else {
        npc.showIndicator(false);
      }
    }

    // Interação
    if (nearbyNpc && state.fase === 'EXPLORANDO' && this.player.isInteractJustDown()) {
      state.fase = 'DIALOGO';
      this.game.events.emit('npc:interact', nearbyNpc.npcData);
    }
  }
}
