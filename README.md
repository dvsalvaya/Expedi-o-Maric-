# Maricaa

Maricaa é um jogo educativo 2D em pixel art inspirado em Maricá (RJ). A proposta é explorar um mapa, conversar com personagens e aprender sobre a história, a cultura e a natureza do município. O conteúdo está sendo preparado para crianças do 3º ao 5º ano do Ensino Fundamental.

## Requisitos

- Node.js e npm
- Navegador moderno

## Como executar

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Abra no navegador o endereço indicado pelo Vite, normalmente `http://localhost:5173`.

Para gerar e testar a versão de produção:

```bash
npm run build
npm run preview
```

## Controles

- **Mover:** setas ou `W`, `A`, `S`, `D`
- **Interagir e avançar:** `Espaço`, `Enter` ou `Z`
- **Escolher uma alternativa:** setas para cima/baixo e confirmar, teclas `1` a `4` ou clique

## Tecnologias

- Phaser 3
- Vite
- JavaScript com ES modules

## Estrutura

- `src/` — código do jogo, cenas, personagens e dados usados pelo jogo
- `assets/maps/` — mapa de teste em JSON do Tiled
- `db/` — arquivos de conteúdo de referência, como diálogos e perguntas
- `docs/` — especificação, tarefas e materiais de pesquisa

## Estado atual

Esta versão ainda é um protótipo em desenvolvimento: usa texturas provisórias, um mapa de teste do Centro, um NPC e perguntas marcadas como teste. Os arquivos em `db/` são material de conteúdo e ainda não são carregados pelo jogo; a execução utiliza os dados de `src/data/`.
