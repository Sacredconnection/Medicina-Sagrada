# Imagens dos cards de intenções

Pasta: `public/assets/intentions/`.
Formato: **WebP, 900 × 1200 px (3:4)**. Preferencialmente até 250 KB por imagem.
O índice mantém a proporção vertical das fotos da jornada. Não inclua títulos ou
botões nas fotos finais: esses textos já são apresentados em HTML.

| Arquivo | Estado |
| --- | --- |
| `aterramento-e-presenca.webp` | Foto existente reaproveitada da jornada |
| `forca-e-coragem.webp` | Foto existente reaproveitada da jornada |
| `foco-e-clareza.webp` | **Temporária: substituir** |
| `calma-e-introspeccao.webp` | Foto existente reaproveitada da jornada |
| `energia-e-renovacao.webp` | **Temporária: substituir** |
| `limpeza-e-refrescancia.webp` | Foto existente reaproveitada da jornada |
| `oracao-e-cerimonia.webp` | **Temporária: substituir** |
| `coracao-e-conexao.webp` | Foto existente reaproveitada da jornada |

Os três arquivos temporários usam o verde da marca e estão identificados dentro
da imagem. Substitua-os pelos arquivos finais **com os mesmos nomes e formato**.
Os caminhos já estão cadastrados em `intentionCardImages`, em `lib/intencoes.ts`;
não é preciso editar código para trocar as fotos.
Em desenvolvimento, essas imagens evitam o cache do otimizador: recarregue a
página após salvar uma substituição. A otimização continua ativa no build de produção.

As cinco fotos reaproveitadas são cópias dos originais em
`public/assets/home/matcher/`, sem alteração de conteúdo ou compressão. O índice
tem seus próprios arquivos para permitir futuras substituições sem modificar
as fotos da jornada. Em produção, publique novamente após trocar os arquivos.
