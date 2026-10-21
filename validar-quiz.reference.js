// Referência para a T10: o agente deve criar tools/validar-quiz.js equivalente a isto.
const fs = require('fs');
const path = require('path');

const quiz = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/quiz.json'), 'utf8'));
const npcs = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/npcs.json'), 'utf8'));

const CATEGORIAS = ['historia', 'cultura', 'patrimonio', 'natureza', 'personalidades', 'economia', 'tradicoes'];
const DIFICULDADES = ['facil', 'medio', 'dificil'];
const npcIds = new Set(npcs.map(n => n.id));
const quizIds = new Set();
const erros = [];

for (const q of quiz) {
  const e = m => erros.push(`[${q.id ?? '??'}] ${m}`);
  if (!q.id) e('sem id');
  if (quizIds.has(q.id)) e('id duplicado');
  quizIds.add(q.id);
  if (!npcIds.has(q.npc)) e(`npc inexistente: ${q.npc}`);
  if (!CATEGORIAS.includes(q.categoria)) e(`categoria inválida: ${q.categoria}`);
  if (!DIFICULDADES.includes(q.dificuldade)) e(`dificuldade inválida: ${q.dificuldade}`);
  if (!q.pergunta) e('sem pergunta');
  if (!Array.isArray(q.alternativas) || q.alternativas.length !== 4) e('precisa de exatamente 4 alternativas');
  if (!Number.isInteger(q.resposta_correta) || q.resposta_correta < 0 || q.resposta_correta > 3) e('resposta_correta fora de 0-3');
  if (!q.explicacao) e('sem explicacao');
  if (!q.fonte?.titulo || !/^https?:\/\//.test(q.fonte?.url ?? '')) e('fonte.titulo/url ausente ou inválida');
}
for (const n of npcs) {
  for (const id of n.perguntas ?? []) if (!quizIds.has(id)) erros.push(`[npc ${n.id}] pergunta inexistente: ${id}`);
  for (const f of n.falas ?? []) if (!['fato', 'tradicao_oral'].includes(f.tipo)) erros.push(`[npc ${n.id}] fala com tipo inválido`);
}

if (erros.length) { console.error(erros.join('\n')); process.exit(1); }
console.log(`OK: ${quiz.length} perguntas, ${npcs.length} NPCs`);
