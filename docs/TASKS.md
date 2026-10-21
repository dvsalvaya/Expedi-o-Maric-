# Maricaa — TASKS

Execute **uma tarefa por vez**, na ordem. Faça commit ao final de cada uma.

## Prompt padrão (trocar apenas o número)
```text
Leia AGENTS.md e docs/SPEC.md. Execute SOMENTE a tarefa T<N> de docs/TASKS.md.
Não implemente nada além dela. Ao final, informe: arquivos alterados, como rodar,
como verificar o critério de aceite e limitações. Se algo estiver ambíguo, pergunte antes de decidir.
```

## Prompt de correção
```text
A tarefa T<N> não passou no critério de aceite. Problema observado: <descreva + erro do console>.
Corrija apenas isso, sem alterar outras partes. Explique a causa e como verificar.
```

---

## T1 — Setup
**Entrega:** projeto Vite + Phaser 3 com `src/main.js`, `src/config.js`, `BootScene` e config da SPEC §2.
**Aceite:** `npm run dev` abre uma tela 480x320 escalada com o texto "Maricaa"; sem erros no console; `npm run build` funciona.

## T2 — Mapa e câmera
**Entrega:** `BootScene` gera texturas placeholder (SPEC §14). Um mapa de teste (Tiled JSON, 30x20, camadas `chao`, `colisao`) carregado na `GameScene`. Câmera com limites.
**Aceite:** o mapa aparece com grama, água e obstáculos distinguíveis por cor.

## T3 — Jogador
**Entrega:** `Player.js` com movimento em 4 direções (SPEC §4), hitbox, colisão com a camada `colisao` e limites do mapa; câmera segue o jogador; spawn vindo da camada `spawns` (`inicio`).
**Aceite:** o jogador anda com setas/WASD, não atravessa obstáculos nem sai do mapa, sem diagonal.

## T4 — Estado e NPC interativo
**Entrega:** `state.js` (SPEC §5), `Npc.js`, NPCs criados da camada `npcs` (com `npcId`), colisão com o jogador, indicador "!" quando perto, evento ao interagir. Pode usar `npcs.json` com 1 NPC de teste.
**Aceite:** perto do NPC aparece "!"; apertar interagir muda `fase` para `DIALOGO` (mostrar no console) e o jogador para de andar.

## T5 — Diálogo
**Entrega:** `UIScene` rodando em paralelo, caixa de diálogo (SPEC §9) lendo `falas` do NPC; ao fim volta para `EXPLORANDO` (quiz ainda não existe).
**Aceite:** conversar com o NPC mostra todas as falas em sequência; depois o jogador volta a andar; falas `tradicao_oral` aparecem com o rótulo.

## T6 — Quiz
**Entrega:** painel de quiz (SPEC §10) com 4 alternativas (teclado e mouse), carregando as perguntas do NPC de `quiz.json`. Crie 2 perguntas **de teste claramente marcadas como "TESTE"** (não invente fatos reais).
**Aceite:** após o diálogo aparece a pergunta; dá para escolher por ↑/↓+confirmar, teclas 1-4 e clique.

## T7 — Feedback e pontuação
**Entrega:** tela de feedback (certo/errado, alternativa correta destacada, explicação, título da fonte), +10 por acerto, HUD `Pontos` e `NPCs X/5`.
**Aceite:** responder certo soma 10; errado soma 0; explicação aparece em ambos os casos; HUD atualiza.

## T8 — Fluxo completo do NPC
**Entrega:** sequência de perguntas por NPC, marcação `concluido` (✓ no NPC), `falaConclusao` ao reinteragir, sem repetir perguntas.
**Aceite:** conversar → responder todas → NPC fica concluído → falar de novo mostra só a fala de conclusão. Esse é o **loop central funcionando em uma área**.

## T9 — Múltiplas áreas
**Entrega:** carregar mapa por área (SPEC §6), camada `portais`, troca com fade, spawns por origem, mapa de teste para as 4 áreas (pode ser cópia simples com cores/obstáculos diferentes), cada NPC na sua área.
**Aceite:** do `centro` vai-se às 3 outras áreas e volta, aparecendo no spawn correto; estado (pontos, NPCs concluídos) persiste entre áreas.

## T10 — Conteúdo real
**Entrega:** `npcs.json` com os 5 NPCs e `quiz.json` com o conteúdo **fornecido pela equipe** (não gerar fatos). `tools/validar-quiz.js` (SPEC §12).
**Aceite:** `node tools/validar-quiz.js` passa; os 5 NPCs conversam e perguntam com conteúdo real.

## T11 — Tela final
**Entrega:** `EndScene` (SPEC §11), reset de estado e "Jogar de novo".
**Aceite:** concluir o 5º NPC leva ao final com pontuação e acertos; reiniciar começa do zero no `centro`.

## T12 — Arte final e demo
**Entrega:** trocar placeholders por assets reais mantendo as chaves de textura; mapas finais do Tiled; build estático (`npm run build`) pronto para hospedar; README curto com como rodar.
**Aceite:** partida completa na build de produção, sem erros no console, na resolução de um notebook e de um projetor (16:9).

## Opcional (só depois de T12)
Efeitos sonoros e música; animações extras; persistência com localStorage; mais perguntas.
