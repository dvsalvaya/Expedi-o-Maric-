# AGENTS.md — Regras permanentes do projeto Maricaa

Jogo 2D educativo em pixel art sobre Maricá (RJ), feito para um hackathon.
O objetivo é um MVP funcional, não um jogo completo.

## Leitura obrigatória antes de qualquer tarefa
1. `docs/SPEC.md` (o que construir e os contratos de dados)
2. `docs/TASKS.md` (a tarefa pedida, com critério de aceite)

## Stack (fixa)
- Phaser 3 + Vite + JavaScript puro (ES modules).
- Sem TypeScript, sem backend, sem banco de dados, sem autenticação.
- Não adicionar dependências além de `phaser` e `vite` sem pedir aprovação.

## Regras de trabalho
- Execute **somente** a tarefa pedida. Não adiantar tarefas futuras.
- Não criar arquivos, pastas ou abstrações fora do que a tarefa exige.
- Não refatorar código de tarefas anteriores a menos que a tarefa peça.
- Se a SPEC estiver ambígua ou contraditória, **pergunte antes de decidir**.
- Ao terminar, responda com: (1) arquivos criados/alterados, (2) como rodar,
  (3) como verificar o critério de aceite, (4) limitações conhecidas.

## Conteúdo educativo
- Nunca invente fatos, datas ou nomes sobre Maricá.
- Texto de falas e perguntas vem de `src/data/*.json`; o código não tem texto de conteúdo hardcoded.
- Tradição oral/folclore deve ser identificada como tal (campo `tipo` nas falas).

## Estilo de código
- Funções e classes pequenas, nomes em inglês no código, textos de jogo em português.
- Constantes (tamanho de tile, pontos por acerto, teclas) em `src/config.js`.
- Comentários só onde o "porquê" não for óbvio.
