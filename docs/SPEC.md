# Maricaa — SPEC técnica (v1)

Fonte de verdade para implementação. Em caso de conflito com o GDD, **esta SPEC vence**.

## 1. Loop central
**Explorar → encontrar NPC → conversar → responder quiz → ler explicação → ganhar pontos.**
Tudo que não serve a esse loop está fora do MVP.

## 2. Stack e configuração
- Phaser 3 (última 3.x estável) + Vite + JS ES modules. Roda no navegador.
- Config Phaser:
  - `type: Phaser.AUTO`, `width: 480`, `height: 320`, `parent: 'game'`, `backgroundColor: '#000000'`
  - `pixelArt: true`, `roundPixels: true`
  - `physics: { default: 'arcade', arcade: { gravity: { y: 0 } } }`
  - `scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }`
- Tile: **16x16 px**. Tela visível: 30x20 tiles.

## 3. Estrutura de pastas
```text
maricaa/
├── index.html
├── package.json
├── AGENTS.md
├── docs/            (SPEC.md, TASKS.md, GDD)
├── tools/
│   └── validar-quiz.js
├── src/
│   ├── main.js              # config Phaser + registro de cenas
│   ├── config.js            # constantes (tile, pontos, teclas, áreas)
│   ├── state.js             # estado global do jogo (módulo simples)
│   ├── scenes/
│   │   ├── BootScene.js     # preload + texturas placeholder
│   │   ├── GameScene.js     # mapa, player, NPCs, portais, interação
│   │   ├── UIScene.js       # HUD, caixa de diálogo, quiz, feedback (overlay)
│   │   └── EndScene.js      # tela final
│   ├── entities/
│   │   ├── Player.js
│   │   └── Npc.js
│   └── data/
│       ├── quiz.json
│       └── npcs.json
└── assets/
    ├── maps/        (area_centro.json, area_ponta_negra.json, area_itaocaia.json, area_lagoa.json)
    ├── tilesets/
    ├── sprites/
    ├── audio/
    └── ui/
```
`UIScene` roda em paralelo à `GameScene` (`scene.launch`) e é a dona de diálogo/quiz/HUD.
`GameScene` e `UIScene` se comunicam via `this.game.events` (ex.: `npc:interact`, `quiz:done`).

## 4. Controles (teclado)
| Ação | Teclas |
|---|---|
| Mover | Setas ou WASD |
| Interagir / avançar diálogo / confirmar | Espaço, Enter ou Z |
| Quiz: escolher | ↑/↓ + confirmar, ou teclas 1-4, ou clique do mouse |

Movimento em **4 direções, sem diagonal** (se duas teclas, vale a última pressionada). Velocidade: 80 px/s (constante em `config.js`).

## 5. Estados do jogo
`state.js` exporta: `{ fase, pontos, npcsConcluidos: Set<string>, areaAtual }`.

`fase` ∈ `EXPLORANDO | DIALOGO | QUIZ | FEEDBACK | FIM`

- Em qualquer fase diferente de `EXPLORANDO`, o jogador **não se move** e não interage com NPCs.
- Transições: `EXPLORANDO → DIALOGO → QUIZ → FEEDBACK → (QUIZ | EXPLORANDO)`; ao concluir o 5º NPC → `FIM`.

## 6. Mapas (Tiled)
Exportar como **JSON** (Tiled map JSON, tiles embutidos no mapa, tileset 16x16).

Camadas de tiles (nomes exatos):
- `chao` — fundo
- `decoracao` — acima do chão, abaixo do player
- `colisao` — tiles sólidos (qualquer tile != vazio colide). Pode ficar invisível.
- `topo` (opcional) — desenhada acima do player (copas de árvore, telhados)

Camadas de objetos (nomes exatos):
- `spawns` — pontos com `name` (ex.: `inicio`, `de_centro`, `de_ponta_negra`)
- `npcs` — objeto ponto/retângulo com propriedade custom `npcId` (string, ex.: `seu_ze`)
- `portais` — retângulo com propriedades `destino` (id da área) e `spawn` (nome do spawn na área destino)

Áreas (4) e topologia **estrela** (Centro é o hub):

| id | Arquivo | Inspiração | NPCs (sugestão, ajustável) | Portais |
|---|---|---|---|---|
| `centro` | `area_centro.json` | Centro de Maricá | `bernardo`, `leo` | → ponta_negra, itaocaia, lagoa |
| `ponta_negra` | `area_ponta_negra.json` | Ponta Negra | `seu_ze` | → centro |
| `itaocaia` | `area_itaocaia.json` | Itaipuaçu / Itaocaia | `vovozao` | → centro |
| `lagoa` | `area_lagoa.json` | Araçatiba e lagoa | `karu` | → centro |

Tamanho sugerido por mapa: 30x20 a 40x30 tiles. Câmera segue o player com limites do mapa
(se o mapa for menor que a tela, centralizar).

Troca de área: ao tocar um portal, fade-out (200 ms) → `scene.restart({ area, spawn })` → fade-in.
Primeira área: `centro`, spawn `inicio`.

## 7. Jogador
- Sprite com corpo físico (hitbox menor que o sprite, ~12x10 nos pés).
- Colide com camada `colisao`, limites do mapa e NPCs (NPCs são sólidos e estáticos).
- Animações andar (4 direções) e parado. Com placeholder: sem animação, apenas rotação do "olhar" opcional.

## 8. NPC
- Criado a partir da camada `npcs`; dados vêm de `npcs.json` pelo `npcId`.
- **Interação**: jogador a ≤ 24 px do NPC e pressiona o botão de interagir → `fase = DIALOGO`.
- Quando perto, mostrar indicador "!" acima do NPC.
- Estado do NPC: `novo` → `concluido` (após todas as perguntas dele respondidas). Concluído mostra um marcador (ex.: ✓) e, ao interagir, só exibe `falaConclusao`.

## 9. Diálogo
- Caixa na parte inferior da tela (altura ~64 px), nome do NPC, texto com efeito de digitação (opcional) e indicador "▼" para continuar.
- Botão de interagir: completa a fala atual; se já completa, avança.
- Após a última fala → começa o quiz do NPC.
- Falas vêm de `npcs.json` (`falas[]`).

## 10. Quiz
- Painel central com pergunta e 4 alternativas. Perguntas do NPC na ordem de `perguntas[]` (ids em `quiz.json`).
- Ao responder: `fase = FEEDBACK`. Mostrar **Correto!/Incorreto**, destacar a alternativa certa, mostrar `explicacao` e `fonte.titulo`. Continuar com o botão de interagir.
- Pontuação: **+10** por acerto, 0 por erro (sem penalidade). O jogador **não repete** pergunta.
- Após a última pergunta do NPC: marcar NPC `concluido`, mostrar `falaConclusao`, voltar a `EXPLORANDO`.
- Embaralhar alternativas é **proibido** no MVP (índice `resposta_correta` fixo).

## 11. HUD e fim de jogo
- HUD (canto superior): `Pontos: N` e `NPCs: X/5`. Sempre visível em `EXPLORANDO`.
- Ao concluir os 5 NPCs → `EndScene`: pontuação final, acertos/total, mensagem de encerramento e botão "Jogar de novo" (reseta `state.js`).
- Persistência (localStorage): **fora do MVP**.

## 12. Contratos de dados

### `quiz.json` (array)
```json
{
  "id": "hist_001",
  "npc": "bernardo",
  "categoria": "historia",
  "dificuldade": "facil",
  "pergunta": "texto",
  "alternativas": ["a", "b", "c", "d"],
  "resposta_correta": 2,
  "explicacao": "texto educativo",
  "fonte": { "titulo": "texto", "url": "https://..." }
}
```
Regras: exatamente 4 alternativas; `resposta_correta` índice 0-3; `id` único e estável;
`categoria` ∈ historia, cultura, patrimonio, natureza, personalidades, economia, tradicoes;
`dificuldade` ∈ facil, medio, dificil; `npc` referencia um id de `npcs.json`.

### `npcs.json` (array)
```json
{
  "id": "seu_ze",
  "nome": "Seu Zé",
  "papel": "Pescador",
  "area": "ponta_negra",
  "sprite": "npc_seu_ze",
  "falas": [
    { "texto": "texto da fala", "tipo": "fato" }
  ],
  "falaConclusao": "texto",
  "perguntas": ["pesca_001", "pesca_002", "pesca_003"]
}
```
`tipo` ∈ `fato` | `tradicao_oral`. Falas `tradicao_oral` são exibidas com o rótulo
**"Conta a tradição…"** (ou similar) para não parecerem fato histórico comprovado.

`tools/validar-quiz.js` (Node, sem libs) valida os contratos acima e falha com mensagem clara.

## 13. Conteúdo: NPCs e temas
Meta para a demo: **5 NPCs, 3 perguntas por NPC (15 no total)**; mínimo aceitável: 2 por NPC.

| NPC | Papel | Temas |
|---|---|---|
| Seu Zé | Pescador | Título de Capital Estadual da Pesca Artesanal; Colônia Z-7; importância hidrodinâmica do Canal de Ponta Negra; saber empírico dos pescadores |
| Karu | Índio Tupi | Povos originários Tupis na região; origem botânica do nome Maricá; lenda do Boitatá (`tradicao_oral`) |
| Professor Bernardo | Historiador | Elevação a Vila em 1814; motivo arquitetônico/localização da Igreja Matriz; Casa de Cultura; Estrada de Ferro Maricá |
| Léo | Criança curiosa | Expedição de Darwin; Beachrocks de Jaconé; Moeda Social Mumbuca; Tarifa Zero (Vermelhinhos) |
| Vovozão | Contador de causos | Capela de Nossa Senhora das Graças (formato de avião); Farol de Ponta Negra; Quilombo de Maricá (1812); Lobisomem de Bambuí e Tesouro de Itaocaia (`tradicao_oral`) |

**Regras de curadoria** (humanos escrevem/validam o conteúdo; o agente só implementa):
- Todo fato precisa de `fonte.url` específica e verificável antes de virar pergunta.
- Itens marcados abaixo ainda **não foram validados** e não devem virar pergunta sem checagem:
  - século de chegada dos Tupis; "hidrodinâmica" do Canal de Ponta Negra; data/detalhes da visita de Darwin;
  - Mumbuca (paridade 1:1, origem); Tarifa Zero (nome e abrangência atuais); formato de avião da Capela;
  - Farol e "curvatura da Terra"; título de Capital Estadual da Pesca Artesanal e papel da Colônia Z-7.
- Não fixar valores de benefícios sociais.
- Folclore (Boitatá, Lobisomem de Bambuí, Tesouro de Itaocaia) → sempre `tradicao_oral`; perguntas sobre eles devem ser do tipo "segundo a tradição…".

## 14. Placeholders → assets finais
- Antes dos assets finais, `BootScene` gera texturas placeholder em runtime (canvas 16x16): grama, água, caminho, parede/obstáculo, player (azul), NPCs (cores distintas).
- Trocar para arte final = substituir arquivos em `assets/` e manter as **mesmas chaves** de textura e **mesmo layout de tileset**; o código não deve mudar.
- Mapas do Tiled são feitos por humanos; até existirem, usar um mapa de teste simples.

## 15. Fora do escopo
Combate, inventário, multiplayer, backend, contas, banco relacional, persistência, diagonal,
mobile/touch, localização para outros idiomas. Áudio e animações extras só depois do loop completo.

## 16. Definição de pronto da demo
1. `npm run dev` e `npm run build` funcionam sem erros.
2. Dá para jogar do início ao `EndScene` passando pelas 4 áreas e 5 NPCs.
3. `node tools/validar-quiz.js` passa.
4. Nenhum erro no console durante uma partida completa.
