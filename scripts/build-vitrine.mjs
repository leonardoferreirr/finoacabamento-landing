/* Gera assets/js/produtos.js a partir de porcelanatos.json.
   Rode depois de mexer no catálogo:  node scripts/build-vitrine.mjs

   Valida, na mesma passada:
   - se todo "file" do JSON existe em assets/porc/
   - se sobrou arquivo em assets/porc/ que não está no JSON
   - se alguma tag de estilo está fora do conjunto fechado
*/
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirImg = join(raiz, 'assets', 'porc');

const TAGS = ['marmorizado', 'cimenticio', 'amadeirado', 'grande-formato', 'tons-neutros', 'area-externa'];

const produtos = JSON.parse(readFileSync(join(raiz, 'porcelanatos.json'), 'utf8'));
const erros = [];

const noDisco = existsSync(dirImg)
  ? new Set(readdirSync(dirImg).filter((f) => f.endsWith('.webp')))
  : new Set();

const vistos = new Set();

for (const p of produtos) {
  for (const campo of ['nome', 'marca', 'formato', 'file']) {
    if (!p[campo]) erros.push(`produto sem "${campo}": ${JSON.stringify(p)}`);
  }
  if (!noDisco.has(p.file)) erros.push(`imagem faltando em assets/porc/: ${p.file}`);
  noDisco.delete(p.file);

  for (const t of p.estilos || []) {
    if (!TAGS.includes(t)) erros.push(`tag de estilo inválida "${t}" em ${p.nome}`);
  }
  if (!(p.estilos || []).length) erros.push(`produto sem estilo: ${p.nome}`);

  const chave = `${p.marca}|${p.nome}|${p.formato}`.toLowerCase();
  if (vistos.has(chave)) erros.push(`produto duplicado: ${chave}`);
  vistos.add(chave);
}

for (const orfa of noDisco) erros.push(`imagem órfã, não está no JSON: ${orfa}`);

if (erros.length) {
  console.error('Vitrine com problema:\n' + erros.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}

// só o que a página usa, na ordem em que vai aparecer
const enxuto = produtos.map(({ nome, marca, formato, acabamento, estilos, file }) => ({
  nome, marca, formato, acabamento, estilos, file
}));

writeFileSync(
  join(raiz, 'assets', 'js', 'produtos.js'),
  '/* GERADO por scripts/build-vitrine.mjs. Não edite à mão: edite porcelanatos.json. */\n' +
    'window.__PORCELANATOS__=' + JSON.stringify(enxuto) + ';\n'
);

console.log(`ok: ${enxuto.length} porcelanatos na vitrine`);
