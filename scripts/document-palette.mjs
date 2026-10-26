import { readFile, writeFile, readdir } from 'node:fs/promises';
const inventory = JSON.parse(await readFile(new URL('../docs/INVENTARIO-VISUAL.json', import.meta.url), 'utf8'));
const css = await readFile(new URL('../app/globals.css', import.meta.url), 'utf8');
const local = await readFile(new URL('../app/aprenda/aprenda.css', import.meta.url), 'utf8');
const table = (headers, rows) => [headers, headers.map(()=>'---'), ...rows].map(row=>`| ${row.join(' | ')} |`).join('\n');
const code = value => `\`${value}\``;
const tokens = inventory.globalTokens.filter(t=>t.referenced && /^#[\da-f]+$/i.test(t.value));
const roles = {
  '--forest-800':'Principal fixa: navegação, links, preços, compra e fundos verdes de seção',
  '--brand-orange':'Principal fixa: marca, pequenos títulos, ícones e destaques',
  '--cta-accent':'Alias do laranja principal: preenchimento, contorno e interação',
  '--brand-text':'Alias do laranja principal: pequenos títulos, labels e links de destaque',
  '--clay-500':'Alias do laranja principal: ícones e detalhes de comunidade',
  '--forest-950':'Apoio profundo: títulos, mídia e estados de controles',
  '--forest-900':'Apoio profundo: títulos de cards de intenções e mídia',
  '--forest-650':'Apoio médio: “relações de respeito.”, newsletter, contornos e foco',
  '--leaf-400':'Apoio claro: seleção de texto, marcadores e foco',
  '--paper':'Neutro: fundo geral', '--white':'Neutro: superfícies e texto invertido',
  '--header-white':'Neutro: fundo do header', '--paper-deep':'Neutro quente: fundos leves e controles',
  '--line':'Neutro: bordas e divisórias', '--ink':'Texto principal de apoio',
  '--muted':'Texto secundário de apoio', '--cta-on-accent':'Texto escuro sobre preenchimento laranja',
};
const primaryNames=['--forest-800','--brand-orange','--cta-accent','--brand-text','--clay-500'];
for(const name of primaryNames) {
  const expected=name==='--forest-800'?'#1a4020':'#ef4929';
  if(tokens.find(token=>token.name===name)?.value.toLowerCase()!==expected) {
    throw new Error(`Cor principal fixa divergente: ${name}. Esperado ${expected}.`);
  }
}
const colorTable = list => table(['Token','HEX','Aplicação atual'], list.map(t=>[code(t.name),code(t.value.toUpperCase()),roles[t.name]??'Apoio local']));
const rootColors=new Set(tokens.map(t=>t.value.toLowerCase()));
const literals=new Map();
for (const declaration of inventory.cssDeclarations) {
  if(declaration.selector===':root')continue;
  for(let hex of declaration.value.match(/#[\da-f]{3,8}\b/gi)??[]) {
    hex=hex.toLowerCase();
    if(rootColors.has(hex))continue;
    const contexts=literals.get(hex)??new Set();
    contexts.add(`${declaration.selector} → ${declaration.property}`);
    literals.set(hex,contexts);
  }
}
const ethnicity=table(['Povo / identidade','Acento de apoio','Texto sobre acento'],inventory.ethnicityColors.map(c=>[c.name,code(c.accent.toUpperCase()),code(c.foreground.toUpperCase())]));
const typeTokens=inventory.globalTokens.filter(t=>t.name.startsWith('--type-'));
const typography=table(['Token de tamanho','Valor CSS'], typeTokens.map(t=>[code(t.name),code(t.value)]));
const weights=inventory.globalTokens.filter(t=>t.name.startsWith('--weight-'));
const svgRows=[];
for(const dir of ['logo','contato','partners']) {
  for(const file of await readdir(new URL(`../public/assets/${dir}/`,import.meta.url))) {
    if(!file.endsWith('.svg'))continue;
    const text=await readFile(new URL(`../public/assets/${dir}/${file}`,import.meta.url),'utf8');
    const colors=[...new Set(text.match(/#[\da-f]{6}\b/gi)??[])];
    if(colors.length)svgRows.push([code(`public/assets/${dir}/${file}`),colors.map(c=>code(c.toUpperCase())).join(', ')]);
  }
}
function declaration(selector,property,source=css) {
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const rules=[...source.matchAll(new RegExp(`^${escaped} \\{([^}]+)\\}`, 'gm'))];
  if(!rules.length)throw new Error(`Seletor ausente: ${selector}`);
  for(const rule of rules) {
    const value=rule[1].match(new RegExp(`(?:^|;\\s*)${property}:\\s*([^;]+)`))?.[1];
    if(value)return value;
  }
  return 'herdado';
}
const scales=[
  ['h1 global','h1',css], ['Hero principal','.hero-title-primary',css], ['Hero secundário','.hero-title-secondary',css],
  ['Título de produto vigente','.product-page .product-summary h1',css],
  ['Intenções: índice','.intentions-intro h1, .intention-detail h1',css],
  ['Intenção: página individual','.intention-detail h1',css],
  ['Intenções: cards','.intention-card-title',css],
  ['Aprenda: índice','.learn-intro h1',local], ['Aprenda: guia','.learn-guide-article .learn-intro h1',local],
  ['Aprenda: h2','.learn-page h2',local],
].map(([label,selector,source])=>[label,code(declaration(selector,'font-size',source)),code(declaration(selector,'line-height',source)),code(selector)]);
const text=`# Paleta de cores e tipografia — Medicina Sagrada

Documento geral vigente. Fonte: estilos e componentes locais, com extração reproduzível pelo comando de documentação. Aprovação das cores principais: Danilo Gravina Dalla Paula, 26/10/2026.

## 1. Cores principais fixas

**Verde principal: #1A4020. Laranja principal: #EF4929.** Estas são as duas cores principais do site e ficam fixadas. Não aproximar o HEX, não substituí-las por tons de apoio e não gerar variantes como novas cores principais. Uma revisão exige nova orientação explícita de Danilo.

${colorTable(tokens.filter(t=>primaryNames.includes(t.name)))}

Tokens diferentes com o mesmo HEX são aliases de aplicação, não cores adicionais. Títulos pequenos acima dos títulos principais, incluindo “Recomendações da Medicina Sagrada”, usam o laranja principal. Categorias do header usam o verde principal em repouso. Os indicadores “Deslize para ver mais” e “Deslize para ver os vídeos” mantêm os cinzas de apoio; na seção verde dos kits, o texto mantém branco com transparência. O traço decorativo mantém o laranja principal. Estados de interação conservam as regras do componente.

## 2. Verdes de apoio, neutros e texto

Todos os demais verdes são apoios. Não representam alternativas às duas cores principais e não autorizam recolorir o site. Permanecem somente nos contextos já implementados.

${colorTable(tokens.filter(t=>!primaryNames.includes(t.name)))}

Preenchimentos laranja de ações usam o foreground de cada componente; a documentação registra o uso atual, sem afirmar conformidade de contraste para todos os pares.

## 3. Cores de apoio das etnias

${ethnicity}

As cores dos povos são contextuais e não são cores principais da Medicina Sagrada. Usar somente quando o povo está explicitamente identificado nos dados. Preservar os pares de texto da tabela. Não inferir origem por descrição livre nem atribuir simbolismo cultural oficial a essas associações.

## 4. Cores locais existentes

São cores aplicadas em regras atuais de componentes, estados, fundos e detalhes. Não são uma paleta alternativa. A tabela referencia os seletores que as aplicam; o inventário técnico registra todas as ocorrências. Uso em CSS não significa presença em todas as páginas ou em todos os estados.

${table(['Cor local','Referência de aplicação'],[...literals].sort(([a],[b])=>a.localeCompare(b)).map(([hex,contexts])=>[code(hex.toUpperCase()),code([...contexts][0])]))}

Sombras, overlays fotográficos e fundos discretos também usam RGBA, gradientes e misturas de cores já presentes. Transparência é um tratamento do componente, não uma nova cor principal. Fórmulas exatas: [inventário visual](INVENTARIO-VISUAL.json). Não extrair uma nova paleta das fotografias.

## 5. Cores nos arquivos vetoriais

${table(['Arquivo','Cores literais presentes'],svgRows)}

As identidades de parceiros e os verdes existentes nos símbolos de contato são apoios dos respectivos assets. Não substituir suas cores pelas da marca. Cores dentro de fotografias, vídeos e bitmaps são conteúdo, não tokens de interface.

## 6. Famílias tipográficas

**Principal: Proxima Nova.** Stack: ${code(inventory.globalTokens.find(t=>t.name==='--font-primary').value)}. Adobe Fonts, kit ${code('vjh7vll')}, carregado por ${code('components/adobe-fonts-stylesheet.tsx')}. Os fallbacks são alternativas técnicas quando a fonte não carrega, não famílias de marca adicionais.

**Apoio editorial: Georgia.** Stack: ${code('Georgia, "Times New Roman", serif')}. Aplicação atual: títulos do índice e das páginas de intenções, títulos dos cards de intenção e navegação anterior/próximo. Corpo, catálogo, produto, header e Aprenda mantêm Proxima Nova.

## 7. Tamanhos e pesos em uso

${typography}

Os valores em rem acompanham a configuração do navegador. Como referência, 1rem equivale a 16px quando a raiz está em 16px; 0,75rem = 12px, 0,8125rem = 13px, 0,875rem = 14px, 0,9375rem = 15px e 1,125rem = 18px.

${table(['Token de peso','Peso'],weights.map(t=>[code(t.name),t.value]))}

Corpo global: peso 400 e entrelinha 1,55. h1 global: peso 800 e entrelinha 0,94. Títulos globais usam tracking -0,035em. Labels de seção: 700, caixa alta e tracking 0,1em. Aprenda usa labels locais de 0,6875rem, peso 700 e tracking 0,12em. Títulos de intenções usam Georgia; o índice tem peso 400 e tracking -0,055em. Preços e quantidades usam números tabulares onde implementado.

## 8. Escalas de títulos por superfície

${table(['Contexto','Tamanho','Entrelinha local','Seletor'],scales)}

Os tamanhos fluidos e as media queries pertencem a cada componente. A escala de seção não substitui automaticamente todos os h2. As regras responsivas completas e os overrides estão no inventário; tabelas acima registram a base dos seletores nomeados.

## 9. Fontes de autoridade e manutenção

- Decisão de marca e limites: [PRODUCT](../PRODUCT.md).
- Contrato visual e componentes: [DESIGN](../DESIGN.md).
- Implementação: ${code('app/globals.css')}, ${code('app/aprenda/aprenda.css')} e ${code('lib/ethnicity-colors.ts')}.
- Extração técnica: [inventário](INVENTARIO-VISUAL.json), somente tokens globais com referência de uso no código.
- Guia do projeto: [Guia geral](GUIA-GERAL.md).

Execute ${code('npm.cmd run docs:visual')} para atualizar inventário e este documento; ${code('npm.cmd run docs:visual:check')} verifica os dois sem escrever. A extração não altera a interface. Não reintroduzir paletas de explorações, valores substituídos ou tokens sem referência na documentação vigente.
`;
const destination=new URL('../docs/PALETA-E-TIPOGRAFIA.md',import.meta.url);
if(process.argv.includes('--check')) {
  if(await readFile(destination,'utf8')!==text) {
    console.error('Paleta e tipografia desatualizadas. Execute npm.cmd run docs:visual.');
    process.exitCode=1;
  } else console.log('Paleta e tipografia correspondem às fontes atuais.');
} else {
  await writeFile(destination,text);
  console.log('Documentação de paleta e tipografia atualizada.');
}
